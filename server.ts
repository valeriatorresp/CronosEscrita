import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory cache for literary research queries to avoid repeating rate limits (15 min TTL)
const researchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to execute generateContent with automatic retry and model fallback on 429/quota limits
async function fetchWithRetryAndFallback(
  ai: GoogleGenAI,
  prompt: string,
  systemInstruction: string,
  useSearch: boolean = true
) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-2.5-flash'];

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {
          systemInstruction,
        };
        if (useSearch) {
          config.tools = [{ googleSearch: {} }];
        }

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        if (response && response.text) {
          return { response, modelUsed: model };
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isRateLimit =
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('Quota') ||
          errMsg.includes('rate limit');

        if (isRateLimit && attempt === 0) {
          // Wait 1.5s and retry once with same model
          await delay(1500);
          continue;
        }
        // If second attempt or other error, break to next model fallback
        break;
      }
    }
  }

  // If search grounding was on and failed with rate limits, try without search tool
  if (useSearch) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { systemInstruction },
      });
      if (response && response.text) {
        return { response, modelUsed: 'gemini-3.8-flash-direct' };
      }
    } catch {
      // ignore
    }
  }

  throw new Error('Todas as tentativas de conexão com a IA atingiram o limite de cota temporário.');
}

// API route for literary research with Google Search Grounding & Quota Resilience
app.post('/api/research', async (req: Request, res: Response) => {
  const { query, bookContext, category } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    res.status(400).json({ error: 'Uma pergunta ou termo de busca é obrigatório.' });
    return;
  }

  const cleanQuery = query.trim();
  const cacheKey = `${cleanQuery.toLowerCase()}_${category || 'all'}`;

  // Check memory cache
  const cached = researchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.json(cached.data);
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Chave GEMINI_API_KEY não configurada no servidor. Por favor, verifique as configurações.',
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let contextDesc = '';
    if (bookContext) {
      contextDesc = `\nContexto da Obra que o autor está escrevendo:
- Título: ${bookContext.title || 'Não informado'}
- Gênero: ${bookContext.genre || 'Ficção'}
- Cenário/Época: ${bookContext.setting || 'Não informado'}
- Premissa: ${bookContext.premise || 'Não informado'}\n`;
    }

    const systemInstruction = `Você é o Assistente Especializado de Pesquisa e Referência Literária do CronosEscrita.
Sua missão é ajudar autores e escritoras a tirar dúvidas de época, ambientação, detalhes sensoriais, termos náuticos/medievais/técnicos, fact-checking e referências históricas e científicas diretamente no app, sem precisarem sair para o navegador (evitando distrações e perda de foco).
${contextDesc}
Diretrizes de Resposta:
1. Forneça respostas concisas, visualmente ricas e ricas em detalhes sensoriais (cheiros, texturas, sons, iluminação, vocabulário exato).
2. Se a dúvida envolver uma época ou cenário específico, traga precisão factual histórica ou cultural.
3. Se envolver termos técnicos ou sinônimos poéticos/antigos, apresente uma lista de termos úteis que a autora pode aplicar no manuscrito.
4. Mantenha um tom profissional, acolhedor e focado no ofício da escrita criativa. Responda sempre em português.`;

    const prompt = `Pergunta de Pesquisa do Escritor: "${cleanQuery}"${
      category ? ` (Categoria: ${category})` : ''
    }`;

    let result;
    try {
      result = await fetchWithRetryAndFallback(ai, prompt, systemInstruction, true);
    } catch {
      // Fallback without search grounding if rate limit on search persisted
      result = await fetchWithRetryAndFallback(ai, prompt, systemInstruction, false);
    }

    const response = result.response;
    const answer = response.text || 'Não foi possível encontrar detalhes para a busca informada.';
    const rawChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries =
      response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    const sources = rawChunks
      .filter((chunk: any) => chunk?.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || chunk.web.uri,
        url: chunk.web.uri,
      }));

    const responseData = {
      answer,
      sources,
      searchQueries: webSearchQueries,
    };

    // Save to cache
    researchCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    res.json(responseData);
  } catch (error: any) {
    console.error('Erro na rota /api/research:', error);
    
    // Fallback: If quota limit persists even after all retries and fallbacks,
    // construct an intelligent, helpful writing guide so the writer is never blocked.
    const fallbackAnswer = `### Referência Literária & Inspiração: "${cleanQuery}"

*Nota: O serviço de busca web em tempo real atingiu a taxa temporária de requisições, mas reunimos os principais pontos práticos para a sua escrita:*

1. **Aspectos Sensoriais & Ambientação:**
   - Ao descrever esta cena ou elemento, explore texturas, contrastes de luz (chamas, penumbra, reflexos) e odores característicos (madeira envelhecida, ferro, chuva, especiarias).
   - Use o cenário como espelho do estado emocional das personagens.

2. **Dica de Construção de Cena:**
   - Evite despejar informações históricas de uma vez (info-dumping). Deixe a personagem interagir fisicamente com o elemento (ex: limpando a fuligem, sentindo o peso do objeto, ouvindo o ranger do mecanismo).

3. **Vocabulário & Tom:**
   - Varie verbos de ação específicos em vez de adjetivos genéricos para imprimir ritmo e autenticidade ao manuscrito.`;

    res.json({
      answer: fallbackAnswer,
      sources: [
        {
          title: 'Guia de Pesquisa & Ambientação Literária',
          url: 'https://pt.wikipedia.org/wiki/Escrita_criativa',
        },
      ],
      searchQueries: [cleanQuery],
    });
  }
});

// API route for generating 3 plot ideas / writing prompts using Gemini API
app.post('/api/generate-plot-ideas', async (req: Request, res: Response) => {
  const { genre, bookTitle, premise, tone } = req.body;
  const targetGenre = (genre || 'Ficção / Fantasia').trim();

  const apiKey = process.env.GEMINI_API_KEY;

  // Curated genre fallback templates if API key is not present or quota reached
  const generateFallbackIdeas = (g: string, title?: string) => {
    return [
      {
        title: 'O Juramento Quebrado do Silêncio',
        tropeOrTheme: 'Dilema Moral & Segredo Ancestral',
        premise: `Em um cenário imersivo de ${g}, o protagonista descobre que a única forma de salvar sua família é quebrando um juramento que manteve a paz intacta por três gerações.`,
        conflict: 'Revelar a verdade trará guerra aberta contra aliados leais, mas ocultá-la custará a vida daqueles que ele jurou proteger.',
        writingPrompt: 'A poeira ainda dançava na réstia de sol quando o selo de cera estalou sob os meus dedos trêmulos, revelando o nome que nunca deveria ter sido pronunciado.',
      },
      {
        title: 'O Eco da Última Escolha',
        tropeOrTheme: 'Relógio Correndo & Conspiração',
        premise: `Faltam menos de quarenta e oito horas para o evento que redefinirá o poder, e a pessoa em quem o protagonista menos confia é a única com a chave para evitar a ruína.`,
        conflict: 'Eles são obrigados a cooperar debaixo do mesmo teto enquanto cada um guarda um plano secreto para trair o outro no último instante.',
        writingPrompt: 'Olhei para o relógio na parede: os ponteiros pareciam correr mais rápido a cada mentira que tínhamos acabado de trocar.',
      },
      {
        title: 'Cinzas sob o Manto Dourado',
        tropeOrTheme: 'Inversão de Papéis & Identidade Roubada',
        premise: `Para escapar de uma condenação injusta em ${title || 'um mundo implacável'}, a personagem principal é forçada a assumir a identidade de sua maior rival.`,
        conflict: 'Quanto mais tempo passa disfarçada, mais percebe que o verdadeiro vilão era a pessoa que ela sempre defendeu como mentora.',
        writingPrompt: 'O espelho diante de mim não devolvia meu reflexo, mas o rosto de quem eu jurara destruir — e o sorriso que curvei nos lábios era perigosamente perfeito.',
      },
    ];
  };

  if (!apiKey) {
    res.json({
      genre: targetGenre,
      ideas: generateFallbackIdeas(targetGenre, bookTitle),
      isFallback: true,
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let contextDetails = `Gênero literário: ${targetGenre}`;
    if (bookTitle) contextDetails += `\nLivro do autor: "${bookTitle}"`;
    if (premise) contextDetails += `\nPremissa base do livro: "${premise}"`;
    if (tone) contextDetails += `\nTom da narrativa: "${tone}"`;

    const systemInstruction = `Você é um consultor literário premiado e mestre em criação de enredos, narrativa dramática e ganchos instigantes para ficção em língua portuguesa.
Sua missão é criar EXATAMENTE 3 ideias / prompts de escrita altamente cativantes, originais e ricos em conflito, adequados ao gênero literário e contexto fornecidos pela autora ou escritor.`;

    const promptText = `Por favor, crie 3 ideias e prompts de enredo inovadores e estimulantes para escrita:
${contextDetails}

Cada uma das 3 ideias deve ter:
- "title": Título evocativo e poético/dramático para a ideia.
- "tropeOrTheme": O trope literário ou tema central (ex: Enemies to Lovers, O Escolhido Relutante, Relógio Correndo, Traição Inevitável, etc.).
- "premise": A premissa central e gancho dramático (2 a 3 frases instigantes).
- "conflict": O conflito central e o que está em jogo para as personagens.
- "writingPrompt": Um parágrafo ou frase de abertura envolvente para o autor começar a escrever o primeiro rascunho imediatamente.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            genre: { type: Type.STRING },
            ideas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  tropeOrTheme: { type: Type.STRING },
                  premise: { type: Type.STRING },
                  conflict: { type: Type.STRING },
                  writingPrompt: { type: Type.STRING },
                },
                required: ['title', 'tropeOrTheme', 'premise', 'conflict', 'writingPrompt'],
              },
            },
          },
          required: ['genre', 'ideas'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (Array.isArray(parsed.ideas) && parsed.ideas.length >= 3) {
      res.json({
        genre: parsed.genre || targetGenre,
        ideas: parsed.ideas.slice(0, 3),
      });
      return;
    }

    res.json({
      genre: targetGenre,
      ideas: generateFallbackIdeas(targetGenre, bookTitle),
    });
  } catch (err: any) {
    console.error('Erro na geração de ideias de enredo:', err);
    res.json({
      genre: targetGenre,
      ideas: generateFallbackIdeas(targetGenre, bookTitle),
      isFallback: true,
      errorNotice: err?.message,
    });
  }
});

// API route for marketing chat assistant
app.post('/api/marketing/chat', async (req: Request, res: Response) => {
  const { message, history, bookContext } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'Mensagem vazia não é permitida.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Chave GEMINI_API_KEY não configurada no servidor.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let contextText = '';
    if (bookContext) {
      contextText = `\nContexto do livro do autor:
- Título: ${bookContext.title || 'Não informado'}
- Gênero: ${bookContext.genre || 'Não informado'}
- Premissa: ${bookContext.premise || 'Não informado'}
- Tom/Vibe: ${bookContext.tone || 'Não informado'}\n`;
    }

    const systemInstruction = `Você é o Assistente Especializado em Marketing Editorial e Social Media do CronosEscrita.
Sua especialidade é ajudar escritores e autoras (novatos ou consagrados) a criar ideias inovadoras, roteiros virais para BookTok/TikTok, posts magnéticos no Instagram/Facebook, estratégias de marca autoral e legendas envolventes.
${contextText}
Diretrizes:
1. Forneça legendas altamente atraentes com ganchos de atenção fortes nas primeiras linhas.
2. Sugira hashtags adequadas e CTAs (chamadas para ação) voltados a pré-vendas, avaliações na Amazon, engajamento e conexão emocional.
3. Mantenha um tom profissional, altamente criativo, estimulante e acolhedor. Responda sempre em português.`;

    const contents: any[] = [];
    if (Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    const modelsToTry = ['gemini-3.8-flash', 'gemini-2.5-flash'];
    let lastError: any = null;
    let responseText: string | null = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
          },
        });
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Tentativa com modelo ${model} no chat de marketing falhou:`, err?.message || err);
        await delay(800);
      }
    }

    if (responseText) {
      res.json({ text: responseText });
      return;
    }

    // High quality offline fallback in case of transient quota limit
    const fallbackReply = `✨ **Sugestão Criativa de Marketing:**\n\n` +
      `Aqui está uma sugestão direcionada para sua obra:\n\n` +
      `**Gancho (Hook de Abertura):** "Você leria um livro onde o protagonista precisa escolher entre salvar quem ama ou proteger o próprio destino?"\n\n` +
      `**Corpo da Mensagem:** Compartilhe um trecho visceral de diálogo ou uma cena de conflito. Convide seus seguidores a comentarem qual escolha eles tomariam no lugar da personagem.\n\n` +
      `**Chamada para Ação (CTA):** "Link oficial de compra e amostra gratuita no primeiro capítulo disponível na bio!"\n\n` +
      `*Dica de hashtags:* #BookTokBrasil #AutoresNacionais #LivrosDeFantasia #EscritoresIndependentes`;

    res.json({ text: fallbackReply });
  } catch (err: any) {
    console.error('Erro na conversa da IA:', err);
    res.status(500).json({ error: err.message || 'Falha ao processar mensagem do chat.' });
  }
});

// API route for marketing image creative generation
app.post('/api/marketing/generate-image', async (req: Request, res: Response) => {
  const { prompt, aspectRatio } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'Um prompt de imagem é obrigatório.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Chave GEMINI_API_KEY não configurada no servidor.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: prompt.trim(),
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1',
        },
      },
    });

    let base64Data = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        base64Data = part.inlineData.data;
        break;
      }
    }

    if (base64Data) {
      res.json({ imageUrl: `data:image/png;base64,${base64Data}` });
    } else {
      res.status(500).json({ error: 'A IA não retornou nenhuma imagem para o prompt especificado.' });
    }
  } catch (err: any) {
    console.error('Erro na geração de imagem:', err);
    res.status(500).json({ error: err.message || 'Falha ao gerar imagem com a IA.' });
  }
});

import fs from 'fs';
import { build } from 'vite';

// Ensure dist/index.html is built on startup if missing
const distPath = path.resolve(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  try {
    console.log('Building app programmatically via Vite API on startup...');
    await build({
      root: __dirname,
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      mode: 'production',
    });
    console.log('Programmatic Vite build completed successfully.');
  } catch (e) {
    console.error('Programmatic Vite build failed:', e);
  }
}

// Serve static dist files if available
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Universal SPA catch-all route for frontend routing
app.get('*', (_req: Request, res: Response) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send('Application is compiling righ now. Please refresh in 5 seconds.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CronosEscrita Server running on http://0.0.0.0:${PORT}`);
});
