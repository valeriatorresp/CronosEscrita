# ✍️ CronosEscrita v1.0 (Versão Final para Produção)

O **CronosEscrita** é o assistente, planejador e ambiente de escrita imersivo completo para autores, escritoras e criadores de conteúdo literário.

## 🌟 Funcionalidades da Versão 1.0 Final

1. **Escritor Imersivo (ImmersiveWriter):**
   * **Modo Foco Total:** Oculta distrações e maximiza a área de escrita.
   * **Tela Cheia Real (Fullscreen API):** Remove todas as barras e elementos do navegador para imersão total.
   * **Trilha Sonora Integrada (YouTube & Spotify):** Permite configurar links personalizados (vídeos, playlists, faixas) ou usar presets de foco (Lo-Fi, Jazz, Fantasia Medieval, Sons Ambientais com Web Audio).
   * **Metas de Sessão e Celebração:** Alvos de palavras, contadores e mini-celebrações a cada 500 palavras.

2. **Gerador de Ideias de Enredo por IA:**
   * Botão direto no Dashboard que utiliza a Gemini API para gerar 3 prompts e premissas de enredo originais com base no gênero do livro mais recente do autor.

3. **Pesquisa Literária & Ambientação Inteligente:**
   * Consulta rápida de termos históricos, sensoriais e técnicos com Google Search Grounding sem sair do app.

4. **Bíblia do Livro (Book Bible):**
   * Organização de personagens, capítulos, cenários, linhas do tempo e notas estruturais.

5. **Marketing Editorial & Automação de Redes Sociais:**
   * Assistente de marketing e criativos para BookTok, Instagram, Amazon e legendas virais.

6. **Segurança & Estabilidade:**
   * **Error Boundary Global:** Proteção contra telas em branco e falhas inesperadas de renderização.
   * **Global Skeleton Loader:** Tela de carregamento elegante durante a inicialização e autenticação.
   * **Backup em Nuvem (Firebase Firestore):** Sincronização automática e segura dos manuscritos e metas.

---

## 🚀 Como Subir no Servidor (Deploy para Produção)

O projeto possui suporte completo a **Node.js + Express + Vite**, servindo tanto a API quanto a interface estática otimizada em uma única porta (`3000`).

### 1. Requisitos no Servidor
* Node.js (versão 18 ou superior)
* npm ou bun

### 2. Passos para Deploy

1. **Baixe ou clone o repositório no GitHub** do projeto.
2. No diretório do projeto no servidor, instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente necessárias (como a chave da IA e configurações do Firebase) no arquivo `.env` (baseado em `.env.example`).
4. Execute o build de produção e inicie o servidor:
   ```bash
   npm start
   ```
   *(O script `npm start` compila automaticamente o projeto com Vite e inicia o servidor Express em `http://0.0.0.0:3000`).*

---
© 2026 CronosEscrita v1.0. Todos os direitos reservados.
