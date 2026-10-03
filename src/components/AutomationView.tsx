import React, { useState } from 'react';
import {
  Bot,
  Zap,
  Settings,
  Send,
  Smartphone,
  MessageCircle,
  Trash2,
  Plus,
  Check,
  CheckCircle2,
  Cpu,
  Workflow,
  Layers,
  AlertCircle,
  X,
  ExternalLink,
  Share2,
  Play,
  Megaphone,
  Terminal,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Eye,
  Heart,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Clock,
  Radio,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SocialAutomation, MarketingPost, Book } from '../types';

interface AutomationViewProps {
  automations: SocialAutomation[];
  marketingPosts: MarketingPost[];
  books: Book[];
  onAddAutomation: (automation: Omit<SocialAutomation, 'id' | 'createdAt'>) => void;
  onUpdateAutomation: (automation: SocialAutomation) => void;
  onDeleteAutomation: (id: string) => void;
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  automations,
  marketingPosts,
  books,
  onAddAutomation,
  onUpdateAutomation,
  onDeleteAutomation,
}) => {
  // Modal / Form state for new automation
  const [showAddForm, setShowAddForm] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'tiktok' | 'threads' | 'whatsapp'>('instagram');
  const [triggerType, setTriggerType] = useState<'comment' | 'dm' | 'story_mention'>('comment');
  const [keyword, setKeyword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [connectedPostId, setConnectedPostId] = useState<string>('all');

  // Simulation State
  const [simPostId, setSimPostId] = useState<string>('all');
  const [simReaderName, setSimReaderName] = useState('maria_leitora');
  const [simText, setSimText] = useState('Eu quero muito o capítulo! QUERO');
  const [simType, setSimType] = useState<'comment' | 'dm'>('comment');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simViewTab, setSimViewTab] = useState<'phone' | 'logs'>('phone');
  const [simLogs, setSimLogs] = useState<string[]>([
    '🟢 [SISTEMA] Serviço CronosLink iniciado e monitorando webhooks...',
    '📡 [REDE] Aguardando comentários ou DMs com palavras-chave ativadoras.',
    '⚡ [STATUS] 0 mensagens pendentes. Modo de escuta em tempo real ativo.'
  ]);

  // Mock phone state
  const [phoneNotification, setPhoneNotification] = useState<string | null>(null);
  const [phoneMessages, setPhoneMessages] = useState<{ sender: 'reader' | 'bot'; text: string; link?: string }[]>([
    {
      sender: 'reader',
      text: 'Olá! Vi seu post e quero muito ler o primeiro capítulo! QUERO',
    },
    {
      sender: 'bot',
      text: 'Que alegria ter você por aqui! 🎉 Aqui está o link do capítulo degustação completo para você ler agora mesmo:',
      link: 'https://cronosescrita.com.br/capitulo-gratis',
    }
  ]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0891b2', '#06b6d4', '#2dd4bf', '#6c2eb9', '#ec4899'],
      });
    } catch {}
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !keyword.trim() || !responseMessage.trim() || !linkUrl.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onAddAutomation({
      name: ruleName.trim(),
      platform,
      triggerType,
      keyword: keyword.trim().toUpperCase(),
      responseMessage: responseMessage.trim(),
      linkUrl: linkUrl.trim(),
      connectedPostId,
      status: 'active',
    });

    // Reset Form
    setRuleName('');
    setKeyword('');
    setResponseMessage('');
    setLinkUrl('');
    setConnectedPostId('all');
    setShowAddForm(false);
    triggerConfetti();

    // Log the event
    setSimLogs((prev) => [
      ...prev,
      `✨ [NOVA REGRA] "${ruleName.trim()}" cadastrada com sucesso | Gatilho: [${keyword.trim().toUpperCase()}]`
    ]);
  };

  const handleToggleStatus = (rule: SocialAutomation) => {
    const updated = { ...rule, status: rule.status === 'active' ? ('inactive' as const) : ('active' as const) };
    onUpdateAutomation(updated);
    setSimLogs((prev) => [
      ...prev,
      `⚙️ [STATUS] Regra "${rule.name}" foi ${updated.status === 'active' ? 'ATIVADA' : 'PAUSADA'}.`
    ]);
  };

  const handleTestSpecificRule = (rule: SocialAutomation) => {
    setSimType(rule.triggerType === 'dm' ? 'dm' : 'comment');
    setSimText(`Olá! Quero muito o livro! ${rule.keyword}`);
    setSimPostId(rule.connectedPostId || 'all');
    setSimViewTab('phone');

    const el = document.getElementById('cronoslink-playground');
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleRunSimulation = () => {
    if (isSimulating) return;

    // Check if there are any active rules
    const activeRules = automations.filter((r) => r.status === 'active');
    if (activeRules.length === 0) {
      alert('Nenhuma automação ativa cadastrada para simular. Crie e ative uma regra antes!');
      return;
    }

    setIsSimulating(true);
    setPhoneNotification(null);
    setPhoneMessages([]);
    setSimViewTab('phone');

    const inputKeyword = simText.toUpperCase();
    const isDM = simType === 'dm';

    setSimLogs((prev) => [
      ...prev,
      `\n⏱️ [SIMULAÇÃO INICIADA] Testando fluxo de disparo automático...`,
      isDM
        ? `📥 [WEBHOOK RECEBIDO] DM de @${simReaderName}: "${simText}"`
        : `📥 [WEBHOOK RECEBIDO] Comentário de @${simReaderName} no post: "${simText}"`
    ]);

    // Stage reader message inside phone screen
    setPhoneMessages([{ sender: 'reader', text: simText }]);

    // Processing steps with realistic delay
    setTimeout(() => {
      // Find matching rule
      const matchedRule = activeRules.find((rule) => {
        const matchesKeyword = inputKeyword.includes(rule.keyword);
        const matchesType = isDM ? rule.triggerType === 'dm' : rule.triggerType === 'comment';
        const matchesPost = rule.connectedPostId === 'all' || rule.connectedPostId === simPostId;
        return matchesKeyword && matchesType && matchesPost;
      });

      if (matchedRule) {
        setSimLogs((prev) => [
          ...prev,
          `🔍 [MATCH ENCONTRADO] Automação vinculada: "${matchedRule.name}"`,
          `⚙️ [GATILHO] Palavra-chave "${matchedRule.keyword}" identificada com sucesso.`
        ]);

        setTimeout(() => {
          setSimLogs((prev) => [
            ...prev,
            `📤 [ENVIO API] Disparando direct automático via Meta Graph API para @${simReaderName}...`,
          ]);

          // Trigger phone visual feedback
          setPhoneNotification(`📬 Nova DM automática de CronosEscrita para @${simReaderName}!`);
          setPhoneMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: matchedRule.responseMessage,
              link: matchedRule.linkUrl,
            }
          ]);

          setTimeout(() => {
            setSimLogs((prev) => [
              ...prev,
              `✅ [ENTREGA CONFIRMADA] Mensagem e link entregues com sucesso a @${simReaderName}. Custo de envio: R$ 0,00.`
            ]);
            setIsSimulating(false);
            triggerConfetti();
          }, 700);
        }, 800);
      } else {
        setSimLogs((prev) => [
          ...prev,
          `🔍 [SEM CORRESPONDÊNCIA] Nenhuma regra ativa combinou com a palavra-chave "${simText}" para este tipo de interação.`,
          `💡 [DICA] Certifique-se de que a palavra-chave está cadastrada e o tipo (Comentário ou DM) coincide.`,
          `❌ [ENCERRADO] Nenhuma mensagem automática enviada.`
        ]);
        setIsSimulating(false);
      }
    }, 1000);
  };

  const handleApplyExample = (example: any) => {
    setRuleName(example.name);
    setPlatform(example.platform);
    setTriggerType(example.triggerType);
    setKeyword(example.keyword);
    setResponseMessage(example.responseMessage);
    setLinkUrl(example.linkUrl);
    setConnectedPostId('all');
    setShowAddForm(true);

    const el = document.getElementById('rule-form-container');
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const EXAMPLES = [
    {
      name: 'Entrega de Capítulo Grátis',
      platform: 'instagram' as const,
      triggerType: 'comment' as const,
      keyword: 'QUERO',
      responseMessage: 'Olá! Fico muito feliz que queira ler o capítulo gratuito do meu novo livro! Aqui está o link oficial de download direto:',
      linkUrl: 'https://www.cronosescrita.com.br/ler-capitulo-gratis',
      badge: '📖 Degustação',
    },
    {
      name: 'Link de Compra na Amazon',
      platform: 'instagram' as const,
      triggerType: 'dm' as const,
      keyword: 'COMPRAR',
      responseMessage: 'Olá! Muito obrigado pelo interesse no meu livro! Garanta já o seu exemplar na Amazon com desconto especial clicando aqui:',
      linkUrl: 'https://amazon.com.br/meu-livro-fantasia',
      badge: '🛒 Vendas',
    },
    {
      name: 'Inscrição de Leitor Beta / Newsletter',
      platform: 'tiktok' as const,
      triggerType: 'comment' as const,
      keyword: 'BETA',
      responseMessage: 'Que incrível! Quero muito te ter na equipe de leitores beta do livro. Cadastre-se na newsletter para receber o formulário:',
      linkUrl: 'https://www.cronosescrita.com.br/leitores-beta',
      badge: '💌 Comunidade',
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-16">
      {/* 1. HEADER BANNER - STANDARDIZED VIBRANT TITLE & METRIC CHIPS */}
      <section className="relative rounded-3xl overflow-hidden p-5 sm:p-7 lg:p-8 shadow-lg bg-gradient-to-br from-[#120a1f] via-[#1a0f2b] to-[#120721] dark:from-[#0f071a] dark:to-[#0a0413] border border-[#ebdff2]/20 dark:border-[#2d1b42] text-white">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0891b2]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#6c2eb9]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0891b2]/20 backdrop-blur-md border border-[#0891b2]/40 text-xs font-bold tracking-wider uppercase text-[#22d3ee] shadow-xs">
                <Zap className="w-3.5 h-3.5 text-[#22d3ee]" />
                <span>CronosLink · Automação Oficial via Direct e Comentários</span>
              </div>
              <h1 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
                CronosEscrita -{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] via-[#06b6d4] to-[#2dd4bf]">
                  Automação de Redes Sociais
                </span>{' '}
                ⚡
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base max-w-3xl leading-relaxed">
                As ferramentas tradicionais cobram mensalidades caras por disparo de mensagens. No <strong>CronosEscrita</strong>,
                o serviço é <strong>100% gratuito e ilimitado</strong>: envie capítulos de amostra, links da Amazon ou formulários de leitores beta
                automaticamente quando seu público comentar ou mandar mensagem.
              </p>
            </div>

            {/* Plan & Status Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-2xl shrink-0 flex flex-col justify-between shadow-lg min-w-[240px]">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#22d3ee] font-bold block">
                  Status da Automação
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="font-serif-display text-xl sm:text-2xl font-bold text-white">
                    Ativo & Monitorando
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                <span>Disparos Ilimitados</span>
                <span className="text-emerald-400 font-bold">R$ 0,00 / mês</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0891b2]/20 flex items-center justify-center text-[#22d3ee]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Regras Ativas</span>
                <span className="text-sm sm:text-base font-bold text-white tabular-nums">
                  {automations.filter((a) => a.status === 'active').length} de {automations.length}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Canais Vinculados</span>
                <span className="text-sm sm:text-base font-bold text-white">Instagram & TikTok</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Segurança</span>
                <span className="text-sm sm:text-base font-bold text-white">APIs Oficiais Meta</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Taxa de Resposta</span>
                <span className="text-sm sm:text-base font-bold text-emerald-400">Tempo Real (&lt;2s)</span>
              </div>
            </div>
          </div>

          {/* Quick Section Navigator Anchors */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-white/80">
            <span className="font-bold text-white flex items-center gap-1">
              <span>Navegação Rápida:</span>
            </span>
            <a href="#how-it-works-section" className="hover:text-[#22d3ee] transition-colors flex items-center gap-1 font-semibold">
              ⚡ Como Funciona na Prática
            </a>
            <span className="text-white/20">•</span>
            <a href="#automation-rules-list" className="hover:text-[#2dd4bf] transition-colors flex items-center gap-1 font-semibold">
              📋 Suas Regras ({automations.length})
            </a>
            <span className="text-white/20">•</span>
            <a href="#cronoslink-playground" className="hover:text-[#22d3ee] transition-colors flex items-center gap-1 font-semibold">
              📲 Live Playground (Simulador)
            </a>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS GUIDE (FULL-WIDTH 3-STEP SECTION ANCHORING AT THE TOP) */}
      <section id="how-it-works-section" className="scroll-mt-20 bg-white dark:bg-[#160b24] rounded-3xl p-5 sm:p-7 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ebdff2]/40 dark:border-[#2d1b42]/40">
          <div>
            <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-2">
              <Workflow className="w-6 h-6 text-[#0891b2] dark:text-[#22d3ee]" />
              <span>Como o CronosLink funciona na prática?</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#5c4672] dark:text-[#c4b3d8] mt-1">
              Diferente de sistemas tradicionais que cobram mensalidades caras por disparo, o CronosLink é gratuito e automático.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Sem Limite de Mensagens</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#faf7fd] dark:bg-[#1a0c2c] border border-[#ebdff2] dark:border-[#351e50] space-y-3 flex flex-col justify-between hover:border-[#0891b2]/40 transition-colors">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#0891b2]/10 text-[#0891b2] dark:text-[#22d3ee] flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="font-serif-display text-base font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Cadastre o Gatilho
              </h4>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] leading-relaxed">
                Crie uma palavra-chave simples e fácil de digitar (ex: <strong>QUERO</strong>, <strong>COMPRAR</strong> ou <strong>BETA</strong>) vinculada ao link desejado.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#0891b2] dark:text-[#22d3ee] flex items-center gap-1">
              Passo 1 concluído no painel <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#faf7fd] dark:bg-[#1a0c2c] border border-[#ebdff2] dark:border-[#351e50] space-y-3 flex flex-col justify-between hover:border-[#0891b2]/40 transition-colors">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="font-serif-display text-base font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Chame a Atenção no Post
              </h4>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] leading-relaxed">
                No seu Reels ou Carrossel do Marketing, termine a legenda dizendo: <em>"Comente QUERO que eu te envio o capítulo de presente no direct!"</em>
              </p>
            </div>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
              Gera alto engajamento nos algoritmos <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#faf7fd] dark:bg-[#1a0c2c] border border-[#ebdff2] dark:border-[#351e50] space-y-3 flex flex-col justify-between hover:border-[#0891b2]/40 transition-colors">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="font-serif-display text-base font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                Envio Imediato via Direct
              </h4>
              <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] leading-relaxed">
                Assim que o leitor comenta, o CronosLink detecta a interação e envia a mensagem com o link oficial no direct dele em menos de 2 segundos.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              Conversão direta sem perda de tráfego <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </section>

      {/* 3. MAIN WORKSPACE: BALANCED DUAL-COLUMN LAYOUT ON MONITORS & STACKED ON MOBILE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ACTIVE RULES & CREATOR (7 cols) */}
        <section id="automation-rules-list" className="lg:col-span-7 space-y-6 scroll-mt-20">
          <div className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ebdff2]/40 dark:border-[#2d1b42]/40">
              <div>
                <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#220d3a] dark:text-[#f7f2fc] flex items-center gap-2">
                  <span>Suas Regras Ativas</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0891b2]/10 text-[#0891b2] dark:text-[#22d3ee]">
                    {automations.length}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[#5c4672] dark:text-[#c4b3d8] mt-1">
                  Palavras-chave que seus leitores devem comentar ou enviar para receber links automáticos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0891b2] to-[#06b6d4] hover:opacity-95 shadow-md shadow-[#0891b2]/20 hover:scale-102 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{showAddForm ? 'Fechar Criador' : 'Nova Regra'}</span>
              </button>
            </div>

            {/* Quick Templates Bar */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c4672] dark:text-[#c4b3d8] block">
                💡 Modelos Rápidos de Sucesso (Clique para preencher):
              </span>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyExample(ex)}
                    className="px-3 py-1.5 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] hover:bg-[#0891b2]/10 dark:hover:bg-[#0891b2]/20 border border-[#ebdff2] dark:border-[#351e50] text-[#6c2eb9] dark:text-[#a875ec] hover:text-[#0891b2] dark:hover:text-[#22d3ee] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{ex.badge}</span>
                    <span className="font-bold text-[#220d3a] dark:text-[#f7f2fc]">{ex.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Add Rule Form */}
            {showAddForm && (
              <form
                id="rule-form-container"
                onSubmit={handleSaveRule}
                className="p-6 rounded-2xl bg-[#faf7fd] dark:bg-[#1a0c2c] border border-[#e6d8ee] dark:border-[#351e50] space-y-4 animate-in slide-in-from-top-4 duration-300"
              >
                <div className="flex items-center justify-between border-b border-[#e6d8ee] dark:border-[#351e50] pb-3 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0891b2] dark:text-[#22d3ee] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Criar Nova Regra de Automação</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase block">
                      Nome Amigável / Campanha
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Entrega de PDF Grátis"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-purple-900 bg-white dark:bg-[#120820] text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  {/* Keyword */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase block">
                      Palavra-Chave Ativadora
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: QUERO, CAPITULO, DESCONTO"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-purple-900 bg-white dark:bg-[#120820] text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-teal-500 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Platform */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase block">
                      Rede Social Vinculada
                    </label>
                    <select
                      value={platform}
                      onChange={(e: any) => setPlatform(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-purple-900 bg-white dark:bg-[#120820] text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="facebook">Facebook</option>
                      <option value="whatsapp">WhatsApp Direct</option>
                      <option value="threads">Threads (Meta)</option>
                    </select>
                  </div>

                  {/* Trigger Type */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase block">
                      Gatilho / Ação do Leitor
                    </label>
                    <select
                      value={triggerType}
                      onChange={(e: any) => setTriggerType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-purple-900 bg-white dark:bg-[#120820] text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="comment">Comentário em Post</option>
                      <option value="dm">Mensagem Direta (DM)</option>
                      <option value="story_mention">Menção de Perfil nos Stories</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Connected Post */}
                  <div className="space-y-1 col-span-1">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase block">
                      Vincular a Post Específico
                    </label>
                    <select
                      value={connectedPostId}
                      onChange={(e) => setConnectedPostId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-purple-900 bg-white dark:bg-[#120820] text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="all">Qualquer Post (Toda a Conta)</option>
                      {marketingPosts.map((p) => (
                        <option key={p.id} value={p.id}>
                          🚀 {p.title} ({p.date})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Link */}
                  <div className="space-y-1 col-span-1">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase block">
                      Link de Destino
                    </label>
                    <input
                      type="url"
                      placeholder="https://amazon.com.br/seu-livro"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-purple-900 bg-white dark:bg-[#120820] text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Response Message */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase block">
                    Mensagem de Resposta no Direct
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escreva a mensagem humanizada que o leitor receberá no Direct acompanhada do link..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-gray-300 dark:border-purple-900 bg-white dark:bg-[#120820] text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-950/40 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0891b2] to-[#06b6d4] hover:opacity-95 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Salvar e Ativar Regra
                  </button>
                </div>
              </form>
            )}

            {/* Empty State */}
            {automations.length === 0 && !showAddForm && (
              <div className="p-8 rounded-3xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#2d1b42] text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0891b2]/10 text-[#0891b2] dark:text-[#22d3ee] flex items-center justify-center mx-auto">
                  <Bot className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-serif-display text-lg font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                    Nenhuma automação cadastrada ainda
                  </h3>
                  <p className="text-xs text-[#5c4672] dark:text-[#c4b3d8] leading-relaxed">
                    Comece escolhendo um dos nossos modelos prontos de sucesso acima ou clique em <strong>"Nova Regra"</strong> para personalizar seus disparos de capítulos e links de venda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="px-5 py-2.5 bg-[#0891b2] hover:bg-[#0e7490] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Minha Primeira Regra</span>
                </button>
              </div>
            )}

            {/* List of Active Rules */}
            {automations.length > 0 && (
              <div className="space-y-3.5">
                {automations.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      rule.status === 'active'
                        ? 'bg-[#faf7fd] dark:bg-[#1b0a2c] border-[#ebdff2] dark:border-[#381f54] shadow-xs hover:border-[#0891b2]/40'
                        : 'bg-gray-50/60 dark:bg-slate-900/30 border-gray-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="space-y-2 flex-1 min-w-0 pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif-display text-base font-bold text-[#220d3a] dark:text-white">
                          {rule.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#5c4672] dark:text-[#c4b3d8] font-bold uppercase tracking-wider">
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-[#6c2eb9] dark:text-[#a875ec]">
                            {rule.platform}
                          </span>
                          <span>·</span>
                          <span>{rule.triggerType === 'comment' ? 'Comentário' : rule.triggerType === 'dm' ? 'DM' : 'Stories'}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        <p>
                          🔑 Palavra-chave:{' '}
                          <strong className="font-mono bg-[#0891b2]/10 dark:bg-[#0891b2]/20 px-2 py-0.5 rounded-md text-[#0891b2] dark:text-[#22d3ee] font-bold uppercase">
                            {rule.keyword}
                          </strong>
                        </p>
                        <p className="line-clamp-1 italic text-gray-500 dark:text-gray-400">
                          ✉️ "{rule.responseMessage}"
                        </p>
                        <p className="truncate text-teal-600 dark:text-teal-400 font-mono text-[11px]">
                          🔗 {rule.linkUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      {/* Test Rule in Simulator Shortcut */}
                      <button
                        type="button"
                        onClick={() => handleTestSpecificRule(rule)}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Preencher simulador com esta regra"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Testar</span>
                      </button>

                      {/* Active/Inactive Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(rule)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer border transition-colors whitespace-nowrap ${
                          rule.status === 'active'
                            ? 'bg-purple-50 dark:bg-purple-950/45 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {rule.status === 'active' ? '● Ativa' : '○ Pausada'}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Excluir a regra de automação "${rule.name}"?`)) {
                            onDeleteAutomation(rule.id);
                            setSimLogs((prev) => [...prev, `🗑️ [EXCLUSÃO] Regra "${rule.name}" removida.`]);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer transition-colors"
                        title="Excluir regra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: CRONOSLINK LIVE PLAYGROUND (5 cols, cohesive light & dark styling) */}
        <section id="cronoslink-playground" className="lg:col-span-5 space-y-6 scroll-mt-20">
          <div className="bg-white dark:bg-[#160b24] rounded-3xl p-6 sm:p-8 border border-[#ebdff2] dark:border-[#2d1b42] shadow-sm space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#ebdff2]/40 dark:border-[#2d1b42]/40">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0891b2] to-[#06b6d4] flex items-center justify-center text-white shadow-md shadow-[#0891b2]/20">
                <Play className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h3 className="font-serif-display text-xl font-bold text-[#220d3a] dark:text-[#f7f2fc]">
                  CronosLink Live Playground 📲
                </h3>
                <span className="text-xs font-bold text-[#0891b2] dark:text-[#22d3ee] uppercase tracking-wider block">
                  Simulador de Automação Direct Real
                </span>
              </div>
            </div>

            {/* Test Controls */}
            <div className="space-y-4">
              {/* Type selector pills */}
              <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#351e50]">
                <button
                  type="button"
                  onClick={() => setSimType('comment')}
                  className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    simType === 'comment'
                      ? 'bg-gradient-to-r from-[#0891b2] to-[#06b6d4] text-white shadow-xs'
                      : 'text-[#5c4672] dark:text-[#c4b3d8] hover:text-[#220d3a] dark:hover:text-white'
                  }`}
                >
                  💬 Comentário no Post
                </button>
                <button
                  type="button"
                  onClick={() => setSimType('dm')}
                  className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    simType === 'dm'
                      ? 'bg-gradient-to-r from-[#0891b2] to-[#06b6d4] text-white shadow-xs'
                      : 'text-[#5c4672] dark:text-[#c4b3d8] hover:text-[#220d3a] dark:hover:text-white'
                  }`}
                >
                  ✉️ Mensagem Direta (DM)
                </button>
              </div>

              {/* Reader and Post selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase block">
                    Leitor Simulado
                  </label>
                  <input
                    type="text"
                    value={simReaderName}
                    onChange={(e) => setSimReaderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#faf7fd] dark:bg-[#120820] text-xs font-semibold text-[#220d3a] dark:text-white border border-[#ebdff2] dark:border-[#381f54] focus:outline-hidden focus:border-[#0891b2]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase block">
                    Post Alvo
                  </label>
                  <select
                    value={simPostId}
                    onChange={(e) => setSimPostId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#faf7fd] dark:bg-[#120820] text-xs font-semibold text-[#220d3a] dark:text-white border border-[#ebdff2] dark:border-[#381f54] focus:outline-hidden focus:border-[#0891b2]"
                  >
                    <option value="all">Qualquer Post</option>
                    {marketingPosts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Simulated message input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#5c4672] dark:text-[#c4b3d8] uppercase block">
                    {simType === 'comment' ? 'Texto do Comentário do Leitor' : 'Mensagem enviada na DM'}
                  </label>
                  {automations.length > 0 && (
                    <span className="text-[10px] text-[#0891b2] dark:text-[#22d3ee] font-semibold">
                      Use: {automations.map((a) => a.keyword).join(', ')}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Ex: Quero o link do primeiro capítulo! QUERO"
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7fd] dark:bg-[#120820] text-xs font-bold text-[#220d3a] dark:text-white border border-[#ebdff2] dark:border-[#381f54] focus:outline-hidden focus:border-[#0891b2]"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={isSimulating}
                onClick={handleRunSimulation}
                className="w-full py-3 bg-gradient-to-r from-[#0891b2] via-[#06b6d4] to-[#2dd4bf] hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#0891b2]/20 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 fill-white ${isSimulating ? 'animate-spin' : 'animate-bounce'}`} />
                <span>{isSimulating ? 'Automação Disparando...' : 'Testar Automação Real'}</span>
              </button>
            </div>

            {/* Results Display: Dual Mode (Phone Mockup vs Webhook Logs) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#ebdff2]/40 dark:border-[#2d1b42]/40">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5c4672] dark:text-[#c4b3d8]">
                  Visualização do Teste
                </span>
                <div className="inline-flex p-1 rounded-xl bg-[#f6f0fb] dark:bg-[#1f1033] border border-[#ebdff2] dark:border-[#351e50]">
                  <button
                    type="button"
                    onClick={() => setSimViewTab('phone')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      simViewTab === 'phone'
                        ? 'bg-white dark:bg-[#160b24] text-[#0891b2] dark:text-[#22d3ee] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Celular do Leitor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimViewTab('logs')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      simViewTab === 'logs'
                        ? 'bg-white dark:bg-[#160b24] text-[#0891b2] dark:text-[#22d3ee] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Log do Servidor ({simLogs.length})</span>
                  </button>
                </div>
              </div>

              {/* View 1: Smartphone UI */}
              {simViewTab === 'phone' && (
                <div className="py-2 flex justify-center animate-in fade-in duration-200">
                  <div className="relative w-[280px] h-[480px] rounded-[38px] border-[8px] border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col justify-between">
                    {/* Notch & Speaker */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-neutral-800 rounded-b-xl z-20" />

                    {/* Notification Banner */}
                    {phoneNotification && (
                      <div className="absolute top-7 left-3 right-3 z-30 bg-[#0891b2] text-white p-2 rounded-xl text-[10px] font-bold shadow-lg animate-in slide-in-from-top-4 flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{phoneNotification}</span>
                      </div>
                    )}

                    {/* Phone Screen Internal */}
                    <div className="flex-1 flex flex-col bg-white text-gray-900 text-xs h-full justify-between pt-7">
                      {/* Instagram Direct Header */}
                      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0891b2] to-[#6c2eb9] flex items-center justify-center text-white text-[9px] font-bold">
                            C
                          </div>
                          <div>
                            <p className="font-bold text-[11px] leading-tight">cronosescrita</p>
                            <p className="text-[8px] text-emerald-600 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                              Online agora
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Heart className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gray-50/70 scrollbar-none">
                        <div className="text-center my-1">
                          <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[8px] font-bold uppercase">
                            Hoje · Direct Oficial
                          </span>
                        </div>

                        {phoneMessages.length === 0 ? (
                          <div className="h-40 flex flex-col items-center justify-center text-center text-gray-400 p-4 space-y-2">
                            <Bot className="w-8 h-8 opacity-40 text-[#0891b2]" />
                            <p className="text-[10px] leading-relaxed">
                              Clique em <strong>"Testar Automação Real"</strong> acima para ver a DM sendo entregue aqui em tempo real!
                            </p>
                          </div>
                        ) : (
                          phoneMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`max-w-[85%] rounded-2xl p-2.5 text-[11px] leading-relaxed shadow-xs animate-in zoom-in-95 duration-200 ${
                                msg.sender === 'reader'
                                  ? 'ml-auto bg-[#0891b2] text-white rounded-br-none'
                                  : 'mr-auto bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                              }`}
                            >
                              <p>{msg.text}</p>
                              {msg.link && (
                                <a
                                  href={msg.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 block p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6c2eb9] border border-purple-200 text-[10px] font-bold transition-colors flex items-center justify-between"
                                >
                                  <span className="truncate">{msg.link}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
                                </a>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Fake Input Bottom Bar */}
                      <div className="p-2 border-t border-gray-100 bg-white flex items-center justify-between text-gray-400 text-[10px]">
                        <span className="px-2">Enviar mensagem...</span>
                        <Send className="w-3.5 h-3.5 text-[#0891b2]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View 2: Server Logs Terminal */}
              {simViewTab === 'logs' && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="bg-[#0e0717] rounded-2xl p-4 border border-[#2d1b42] font-mono text-[11px] text-[#22d3ee] space-y-2 h-[480px] overflow-y-auto leading-relaxed select-text shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 text-white/50 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                        <span className="ml-2">cronoslink-webhook-stream.log</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSimLogs(['🟢 [SISTEMA] Log limpo. Aguardando novos disparos...'])
                        }
                        className="hover:text-white cursor-pointer underline"
                      >
                        Limpar
                      </button>
                    </div>

                    {simLogs.map((log, i) => (
                      <div key={i} className="whitespace-pre-wrap">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
