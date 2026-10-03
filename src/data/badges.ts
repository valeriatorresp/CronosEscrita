import type { Badge, WritingSession, Book, Project, BadgeLevel } from '../types';

export const LEVEL_DEFINITIONS: Record<
  BadgeLevel,
  {
    name: string;
    description: string;
    funRankName: string;
    color: string;
    badgeCount: number;
  }
> = {
  novato: {
    name: 'Escritor Novato',
    funRankName: 'Explorador da Folha em Branco',
    description: 'Vencendo o medo do rascunho inicial e acendendo a centelha criativa.',
    color: '#147d74', // Teal
    badgeCount: 10,
  },
  mediano: {
    name: 'Escritor em Ascensão',
    funRankName: 'Artesão dos Parágrafos',
    description: 'Navegando o labirinto do meio com ritmo consistente e disciplina inabalável.',
    color: '#6c2eb9', // Purple
    badgeCount: 16,
  },
  bom_demais: {
    name: 'Escritor Bom Demais',
    funRankName: 'Lenda Viva dos Finais Épicos',
    description: 'Domínio narrativo absoluto, maratonas lendárias e obras que deixam marcas eternas.',
    color: '#b83280', // Rose Velvet
    badgeCount: 19,
  },
};

/**
 * Formats a number cleanly for progress display (e.g. 40000 -> 40k, 1000 -> 1k, 500 -> 500)
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000) {
    if (num % 1000 === 0) {
      return `${num / 1000}k`;
    }
    const val = (num / 1000).toFixed(1);
    return `${val.endsWith('.0') ? val.slice(0, -2) : val}k`;
  }
  return num.toString();
};

/**
 * Formats progress ratio for display on the right side of the bar (e.g. 0/40k, 1.5k/10k, 350/500)
 */
export const formatProgressRatio = (current: number, target: number): string => {
  return `${formatCompactNumber(current)}/${formatCompactNumber(target)}`;
};

export const INITIAL_BADGES: Badge[] = [
  // ========================================================
  // NÍVEL 1: ESCRITOR NOVATO (Explorador da Folha em Branco)
  // ========================================================
  {
    id: 'first_log',
    title: 'O Primeiro Traço',
    description: 'Registrou sua primeiríssima sessão de escrita no aplicativo.',
    iconName: 'PenTool',
    category: 'milestone',
    color: '#6c2eb9',
    level: 'novato',
    levelName: 'Escritor Novato',
    funRankName: 'Explorador da Folha em Branco',
    targetNumber: 1,
    metricType: 'total_words', // checking sessions count >= 1
    metricUnit: 'sessão',
    celebrationSuggestion: 'Prepare seu café ou chá favorito em uma xícara especial e comemore o início oficial da jornada! ☕',
    consistencyReminder: 'O segredo não é a perfeição da primeira frase, mas a coragem de quebrar a inércia.',
  },
  {
    id: 'hundred_words',
    title: 'O Começo de Tudo (100 pal.)',
    description: 'Escreveu suas primeiras 100 palavras. A história começou a respirar!',
    iconName: 'Feather',
    category: 'milestone',
    color: '#147d74',
    level: 'novato',
    levelName: 'Escritor Novato',
    funRankName: 'Faísca da Imaginação',
    targetNumber: 100,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Feche os olhos por 1 minuto imaginando o leitor sorrindo na primeira página. ✨',
    consistencyReminder: '100 palavras escritas valem mil vezes mais do que uma obra-prima que existe apenas na cabeça.',
  },
  {
    id: 'one_k',
    title: 'Primeiro Milhar (1k)',
    description: 'Alcançou 1.000 palavras no manuscrito. A primeira grande barreira foi rompida!',
    iconName: 'Bookmark',
    category: 'milestone',
    color: '#b83280',
    level: 'novato',
    levelName: 'Escritor Novato',
    funRankName: 'Caçador de Milhares',
    targetNumber: 1000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Coma um pedaço generoso de chocolate apreciando cada mordida como recompensa merecida. 🍫',
    consistencyReminder: 'Todo livro de 100 mil palavras foi, um dia, apenas as suas primeiras mil.',
  },
  {
    id: 'sprint_500',
    title: 'Faísca Criativa',
    description: 'Completou uma sessão focada com 500 palavras ou mais de uma só vez.',
    iconName: 'Zap',
    category: 'streak',
    color: '#eab308',
    level: 'novato',
    levelName: 'Escritor Novato',
    funRankName: 'Relâmpago da Inspiração',
    targetNumber: 500,
    metricType: 'session_words',
    metricUnit: 'palavras em 1 sessão',
    celebrationSuggestion: 'Coloque aquela música épica que você adora e faça uma dancinha de vitória na sala! 🎶',
    consistencyReminder: 'O foco de um sprint é maravilhoso, mas a tranquilidade de voltar amanhã é o que constrói o hábito.',
  },
  {
    id: 'two_days_streak',
    title: 'Passo a Passo',
    description: 'Registrou palavras em pelo menos 2 dias diferentes, firmando o hábito.',
    iconName: 'CheckCircle',
    category: 'streak',
    color: '#06b6d4',
    level: 'novato',
    levelName: 'Escritor Novato',
    funRankName: 'Bicicletinha Literária',
    targetNumber: 2,
    metricType: 'unique_days',
    metricUnit: 'dias com escrita',
    celebrationSuggestion: 'Mande uma mensagem para um grande amigo dizendo: "O dia rendeu hoje!". Compartilhar alegrias multiplica a dopamina. 💬',
    consistencyReminder: 'Dois dias seguidos não é sorte, já é o embrião de uma rotina vitoriosa.',
  },
  {
    id: 'three_days_streak',
    title: 'Três Dias de Ouro',
    description: 'Manteve a rotina de escrita ativa por 3 dias diferentes.',
    iconName: 'Award',
    category: 'streak',
    color: '#0ea5e9',
    level: 'novato',
    levelName: 'Escritor Novato',
    funRankName: 'Engrenagem em Movimento',
    targetNumber: 3,
    metricType: 'unique_days',
    metricUnit: 'dias com escrita',
    celebrationSuggestion: 'Dê uma volta de 10 minutos ao ar livre, respirando ar puro e deixando a mente descansar. 🌿',
    consistencyReminder: 'Constância é sobre gentileza: se um dia for difícil, escreva apenas 50 palavras, mas não deixe a corrente quebrar.',
  },
  {
    id: 'deep_focus_30',
    title: 'Pausa Criativa (30m)',
    description: 'Acumulou pelo menos 30 minutos de tempo de escrita dedicado.',
    iconName: 'Coffee',
    category: 'streak',
    color: '#f97316',
    level: 'novato',
    levelName: 'Escritor Novato',
    funRankName: 'Café sem Pressa',
    targetNumber: 30,
    metricType: 'total_minutes',
    metricUnit: 'minutos dedicados',
    celebrationSuggestion: 'Faça um alongamento relaxante dos ombros e pescoço, soltando a tensão do teclado. 🧘',
    consistencyReminder: 'Meia hora de presença plena gera mais páginas do que 3 horas de distração com celular.',
  },
  {
    id: 'worldbuilder',
    title: 'Arquiteto de Mundos',
    description: 'Criou e estruturou seu primeiro livro no Manual do Livro.',
    iconName: 'Castle',
    category: 'worldbuilding',
    color: '#6c2eb9',
    level: 'novato',
    levelName: 'Escritor Novato',
    funRankName: 'Pioneiro de Universos',
    targetNumber: 1,
    metricType: 'books',
    metricUnit: 'livro planejado',
    celebrationSuggestion: 'Diga em voz alta o título do seu livro com orgulho: sua obra agora tem um lar oficial! 📖',
    consistencyReminder: 'Uma boa fundação dá asas à imaginação para voar sem se perder.',
  },
  {
    id: 'word_alchemist',
    title: 'Alquimista das Palavras',
    description: 'Criou e registrou um microconto no jogo Palavra-Puxa-Palavra.',
    iconName: 'Feather',
    category: 'creative',
    color: '#b83280',
    level: 'novato',
    levelName: 'Escritor Novato',
    funRankName: 'Mágico da Frase Curta',
    targetNumber: 1,
    metricType: 'micro_stories',
    metricUnit: 'microconto criado',
    celebrationSuggestion: 'Releia seu microconto em voz alta para você mesmo, saboreando cada escolha de palavra. 🪄',
    consistencyReminder: 'A brincadeira e o improviso desarmam o perfeccionismo que trava a caneta.',
  },
  {
    id: 'pub_first',
    title: 'Primeira Publicação!',
    description: 'Confirmou a primeira publicação de uma obra ou arquivo pelo app. Sua história ganhou o mundo!',
    iconName: 'Rocket',
    category: 'milestone',
    color: '#147d74',
    level: 'novato',
    levelName: 'Escritor Novato',
    funRankName: 'Autor Inaugurado',
    targetNumber: 1,
    metricType: 'publications',
    metricUnit: 'publicação confirmada',
    celebrationSuggestion: 'Faça um brinde com sua bebida predileta, fotografe o momento e compartilhe com quem mais torce por você! 🚀📚',
    consistencyReminder: 'A primeira publicação prova que os dias de rascunho valeram cada segundo de dedicação.',
  },

  // ========================================================
  // NÍVEL 2: ESCRITOR EM ASCENSÃO (Artesão dos Parágrafos)
  // ========================================================
  {
    id: 'three_k',
    title: 'Ritmo Fluindo (3k)',
    description: 'Acumulou 3.000 palavras com constância e presença.',
    iconName: 'Sparkles',
    category: 'milestone',
    color: '#6c2eb9',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Artesão dos Parágrafos',
    targetNumber: 3000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Acenda uma vela aromática ou borrife um aroma agradável no seu cantinho de escrita. 🕯️',
    consistencyReminder: 'Três mil palavras provam que a inspiração não é mágica: é resultado da sua dedicação.',
  },
  {
    id: 'five_k',
    title: 'Primeiros Capítulos (5k)',
    description: 'Ultrapassou a marca de 5.000 palavras escritas no projeto.',
    iconName: 'BookOpen',
    category: 'milestone',
    color: '#b83280',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Construtor de Capítulos',
    targetNumber: 5000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Tire uma foto das suas anotações ou da tela para criar um diário visual de progresso. 📸',
    consistencyReminder: '5.000 palavras já é um conto completo ou os primeiros atos de um romance cativante.',
  },
  {
    id: 'ten_k',
    title: 'Voz Consistente (10k)',
    description: 'Atingiu 10.000 palavras acumuladas na sua jornada de criação.',
    iconName: 'BookOpen',
    category: 'milestone',
    color: '#7c3aed',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Guerreiro do Segundo Ato',
    targetNumber: 10000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Compre aquele livro que estava na sua lista de desejos como um presente de escritor para escritor. 📚',
    consistencyReminder: 'Entrar no segundo ato exige fôlego: confie no processo mesmo quando o meio parecer nebuloso.',
  },
  {
    id: 'fifteen_k',
    title: 'Trama em Expansão (15k)',
    description: 'Alcançou 15.000 palavras. O universo narrativo está encorpado.',
    iconName: 'FileText',
    category: 'milestone',
    color: '#6366f1',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Tecelão de Conflitos',
    targetNumber: 15000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Assista a um episódio da sua série favorita sem culpa, com a mente em paz pela missão cumprida. 🍿',
    consistencyReminder: 'As tramas ganham vida quando você as visita com regularidade e afeto.',
  },
  {
    id: 'twenty_k',
    title: 'Ponto de Virada (20k)',
    description: 'Atingiu 20.000 palavras escritas com carinho e dedicação.',
    iconName: 'Flame',
    category: 'milestone',
    color: '#147d74',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Domador da Metade',
    targetNumber: 20000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Diga a si mesmo no espelho: "Eu sou escritor e minhas palavras têm força e destino". 🪞',
    consistencyReminder: '20 mil palavras separam quem sonha em escrever de quem efetivamente realiza.',
  },
  {
    id: 'sprint_1000',
    title: 'Fluxo Perfeito',
    description: 'Produziu 1.000 palavras ou mais em uma única sessão inspirada.',
    iconName: 'Zap',
    category: 'streak',
    color: '#14b8a6',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Turbo Criativo',
    targetNumber: 1000,
    metricType: 'session_words',
    metricUnit: 'palavras em 1 sessão',
    celebrationSuggestion: 'Faça um brinde com sua bebida predileta à fluidez da sua imaginação! 🥂',
    consistencyReminder: 'Sessões de 1.000 palavras são eletrizantes, mas sessões modestas de 300 palavras mantêm a chama viva.',
  },
  {
    id: 'daily_pace',
    title: 'No Ritmo do Dia',
    description: 'Alcançou uma sessão memorável de 1.667 palavras ou mais.',
    iconName: 'Zap',
    category: 'streak',
    color: '#0d9488',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Relógio Suíço das Letras',
    targetNumber: 1667,
    metricType: 'session_words',
    metricUnit: 'palavras em 1 sessão',
    celebrationSuggestion: 'Presenteie-se com 30 minutos de lazer absoluto sem pensar em metas ou prazos. 🎮',
    consistencyReminder: '1.667 palavras é o ritmo clássico que conclui um romance inteiro em 30 dias.',
  },
  {
    id: 'five_days_streak',
    title: 'Hábito em Flor',
    description: 'Registrou sessões em 5 dias distintos. A rotina floresce a cada página!',
    iconName: 'Sun',
    category: 'streak',
    color: '#f59e0b',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Ritmo Inquebrável',
    targetNumber: 5,
    metricType: 'unique_days',
    metricUnit: 'dias com escrita',
    celebrationSuggestion: 'Desfrute de uma refeição especial em comemoração à sua semana produtiva. 🍝',
    consistencyReminder: '5 dias de escrita mudam sua identidade neurológica: você não está apenas tentando, você está escrevendo.',
  },
  {
    id: 'seven_days_streak',
    title: 'Semana do Escritor',
    description: 'Registrou escrita em 7 dias diferentes. Constância admirável!',
    iconName: 'CalendarCheck',
    category: 'streak',
    color: '#10b981',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Semana Imparável',
    targetNumber: 7,
    metricType: 'unique_days',
    metricUnit: 'dias com escrita',
    celebrationSuggestion: 'Reserve uma tarde tranquila para caminhar em um parque ou livraria sem pressa. 🌳',
    consistencyReminder: 'A constância de 7 dias é mais poderosa que qualquer sprint desesperado de fim de semana.',
  },
  {
    id: 'deep_focus_60',
    title: 'Hora de Pura Criação (60m)',
    description: 'Acumulou 60 minutos de escrita atenta e focada na sua história.',
    iconName: 'Hourglass',
    category: 'streak',
    color: '#0284c7',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Catedral da Concentração',
    targetNumber: 60,
    metricType: 'total_minutes',
    metricUnit: 'minutos dedicados',
    celebrationSuggestion: 'Tome um banho morno e relaxante sentindo a satisfação de 1 hora de criação pura. 🛁',
    consistencyReminder: 'Uma hora de foco imersivo no silêncio vale por dias de procrastinação.',
  },
  {
    id: 'character_crafter',
    title: 'Criador de Almas',
    description: 'Criou 2 ou mais personagens detalhados no Manual do Livro.',
    iconName: 'Users',
    category: 'worldbuilding',
    color: '#2dd4bf',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Escultor de Almas',
    targetNumber: 2,
    metricType: 'characters',
    metricUnit: 'personagens criados',
    celebrationSuggestion: 'Desenhe ou procure uma foto que represente seus personagens para colocar na parede ou moodboard. 🎨',
    consistencyReminder: 'Personagens com objetivos claros guiam a história mesmo quando você não sabe o que escrever.',
  },
  {
    id: 'chapter_architect',
    title: 'Engenheiro de Capítulos',
    description: 'Estruturou pelo menos 3 capítulos no Manual do Livro.',
    iconName: 'BookMarked',
    category: 'worldbuilding',
    color: '#6c2eb9',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Engenheiro de Enredos',
    targetNumber: 3,
    metricType: 'chapters',
    metricUnit: 'capítulos planejados',
    celebrationSuggestion: 'Crie uma playlist exclusiva com 3 músicas que definam o clima desses novos capítulos! 🎧',
    consistencyReminder: 'Saber para onde o próximo capítulo vai remove 90% da ansiedade de sentar para escrever.',
  },
  {
    id: 'weeks_4_constancy',
    title: 'O Submarino Literário (4 Semanas de Foco)',
    description: '4 semanas consecutivas escrevendo nas profundezas, sem pressa nem carência de medalhas. Constância em modo furtivo!',
    iconName: 'ShieldCheck',
    category: 'streak',
    color: '#0d9488',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Mestre da Profundidade',
    targetNumber: 4,
    metricType: 'weeks_constancy',
    metricUnit: 'semanas sem carência',
    celebrationSuggestion: 'Coloque um café ou chá quentinho em uma caneca especial e dê três tapinhas no próprio ombro: escrever 4 semanas sem depender de aplausos é o verdadeiro superpoder do escritor! ☕🌊',
    consistencyReminder: 'Grandes histórias são lapidadas no silêncio, longe dos holofotes passageiros.',
  },
  {
    id: 'pub_each',
    title: 'Autor em Série (Nova Publicação)',
    description: 'Confirmou mais uma publicação concluída no app. Sua estante autoral não para de crescer!',
    iconName: 'Bookmark',
    category: 'milestone',
    color: '#6c2eb9',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Artesão de Lançamentos',
    targetNumber: 2,
    metricType: 'publications',
    metricUnit: 'publicações confirmadas',
    celebrationSuggestion: 'Compre um livro novo para sua estante ou saboreie sua sobremesa predileta em comemoração ao lançamento! 🍰📖',
    consistencyReminder: 'Cada lançamento consolida seu diálogo íntimo com os leitores.',
  },
  {
    id: 'pub_5',
    title: 'Quíntuplo Lançamento (5ª Publicação)',
    description: 'Alcançou 5 publicações no app. Uma carreira literária consistente e frutífera!',
    iconName: 'BookOpen',
    category: 'milestone',
    color: '#b83280',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Arquiteto de Prateleiras',
    targetNumber: 5,
    metricType: 'publications',
    metricUnit: 'publicações confirmadas',
    celebrationSuggestion: 'Crie um marcador de página personalizado ou presenteie alguém especial com uma dedicatória da sua obra! 🔖',
    consistencyReminder: 'Cinco publicações mostram que você não teve só uma boa ideia: você domina o processo de finalização.',
  },
  {
    id: 'pub_10',
    title: 'Catálogo de Peso (10ª Publicação)',
    description: '10 publicações confirmadas! Uma dezena de projetos concluídos e entregues ao leitor.',
    iconName: 'Trophy',
    category: 'milestone',
    color: '#f59e0b',
    level: 'mediano',
    levelName: 'Escritor em Ascensão',
    funRankName: 'Prolífico Notável',
    targetNumber: 10,
    metricType: 'publications',
    metricUnit: 'publicações confirmadas',
    celebrationSuggestion: 'Organize uma reunião descontraída ou brinde com amigos para comemorar sua primeira dezena de publicações! 🥂',
    consistencyReminder: 'Dez obras publicadas colocam você em um grupo seleto de autores com impressionante perseverança.',
  },

  // ========================================================
  // NÍVEL 3: ESCRITOR BOM DEMAIS (Lenda Viva das Palavras)
  // ========================================================
  {
    id: 'halfway',
    title: 'Metade da Travessia (25k)',
    description: 'Alcançou a marca épica de 25.000 palavras escritas na obra!',
    iconName: 'Compass',
    category: 'milestone',
    color: '#f43f5e',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Conquistador da Cordilheira',
    targetNumber: 25000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Peça seu prato favorito por delivery para um banquete particular de meio de livro! 🍕',
    consistencyReminder: 'A descida da montanha agora tem a gravidade a seu favor. Mantenha o passo firme.',
  },
  {
    id: 'thirty_k',
    title: 'Corpo do Romance (30k)',
    description: 'Ultrapassou 30.000 palavras. A história caminha firme rumo ao clímax.',
    iconName: 'Sparkles',
    category: 'milestone',
    color: '#f97316',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Mestre da Tensão Literária',
    targetNumber: 30000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Compartilhe um trecho que você adorou escrever com alguém que apoia sua arte. 💌',
    consistencyReminder: '30 mil palavras é o volume de muitas novelas consagradas da literatura mundial.',
  },
  {
    id: 'forty_k',
    title: 'Reta do Clímax (40k)',
    description: 'Atingiu 40.000 palavras. O desfecho da sua história está logo ali!',
    iconName: 'Flame',
    category: 'milestone',
    color: '#f59e0b',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Piloto do Clímax',
    targetNumber: 40000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Reserve 1 hora no fim de semana para ouvir sua trilha sonora preferida sonhando com a noite de autógrafos. 🎧',
    consistencyReminder: 'O final está próximo: resista à tentação de revisar antes de colocar o ponto final.',
  },
  {
    id: 'champion_50k',
    title: 'Obra Consagrada (50k)',
    description: 'Completou a marca monumental de 50.000 palavras escritas!',
    iconName: 'Trophy',
    category: 'milestone',
    color: '#10b981',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Lenda Viva dos Finais Épicos',
    targetNumber: 50000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Comemore com uma festa particular ou jantar memorável com amigos íntimos: você escreveu um livro de verdade! 🏆🎉',
    consistencyReminder: 'A medalha de 50k é gloriosa, mas a pessoa disciplinada e resiliente que você se tornou é a verdadeira obra-prima.',
  },
  {
    id: 'hundred_k',
    title: 'Centenário de Palavras (100k)',
    description: 'Ultrapassou 100.000 palavras escritas! Uma marca verdadeiramente notável de perseverança criativa.',
    iconName: 'Sparkles',
    category: 'milestone',
    color: '#0ea5e9',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Mestre Centenário',
    targetNumber: 100000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Faça uma pausa especial ou brinde com uma bebida deliciosa: 100 mil palavras é o equivalente a um romance robusto ou uma saga inesquecível! 🥂✨',
    consistencyReminder: 'Cem mil palavras não surgem da pressa, mas do hábito inabalável de retornar à página todos os dias.',
  },
  {
    id: 'two_hundred_k',
    title: 'Maratona das 200 Mil (200k)',
    description: '200.000 palavras acumuladas. Sua dedicação literária é monumental!',
    iconName: 'Bookmark',
    category: 'milestone',
    color: '#6366f1',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Maratonista das Letras',
    targetNumber: 200000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Compre aquele livro dos sonhos que você tanto queria para a sua estante de inspiração! 📚',
    consistencyReminder: 'A constância transforma qualquer sonho distante em capítulos reais e tangíveis.',
  },
  {
    id: 'three_hundred_k',
    title: 'Trilogia Imortal (300k)',
    description: 'Alcançou 300.000 palavras no total de suas obras. Uma biblioteca de mundos criados!',
    iconName: 'BookOpen',
    category: 'milestone',
    color: '#8b5cf6',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Arquiteto de Universos',
    targetNumber: 300000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Tire um dia de descanso completo em um parque ou museu sabendo que sua imaginação já construiu universos inteiros. 🌳',
    consistencyReminder: 'Trezentas mil palavras formam o tecido de grandes obras que atravessam gerações.',
  },
  {
    id: 'five_hundred_k',
    title: 'Biblioteca Ambulante (500k)',
    description: 'Meio milhão de palavras escritas! Um feito reservado para titãs da escrita.',
    iconName: 'Library',
    category: 'milestone',
    color: '#d946ef',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Titã da Prolificidade',
    targetNumber: 500000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Comemore com um banquete inesquecível: meio milhão de palavras é uma marca histórica! 🏆🎉',
    consistencyReminder: 'Meio milhão de palavras demonstram que a escrita para você não é apenas um hobby, mas uma vocação eterna.',
  },
  {
    id: 'one_million',
    title: 'O Gigante das Letras (1 Milhão de Palavras!)',
    description: 'Alcançou a marca mítica de 1.000.000 de palavras escritas! (Nota da autora do app: Esse é o gigante hahahah 🏔️✨)',
    iconName: 'Flame',
    category: 'milestone',
    color: '#f43f5e',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Titã Absoluto da Literatura Mundial',
    targetNumber: 1000000,
    metricType: 'total_words',
    metricUnit: 'palavras',
    celebrationSuggestion: 'Celebre como uma lenda viva das letras: 1 milhão de palavras é o ápice absoluto da dedicação criativa! 🏔️👑🎉',
    consistencyReminder: 'Um milhão de palavras escritas provam que a persistência humana é capaz de erguer catedrais de palavras no tempo.',
  },
  {
    id: 'sprint_master',
    title: 'Voo Noturno',
    description: 'Escreveu mais de 2.000 palavras em uma única sessão de pura inspiração.',
    iconName: 'Moon',
    category: 'streak',
    color: '#6366f1',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Vulcão de Palavras',
    targetNumber: 2000,
    metricType: 'session_words',
    metricUnit: 'palavras em 1 sessão',
    celebrationSuggestion: 'Durma aquela noite com um sorriso largo sabendo que poucas pessoas no mundo têm essa energia criativa. 🌙',
    consistencyReminder: 'Depois de um vulcão, o descanso é sagrado para recarregar as energias criativas.',
  },
  {
    id: 'ten_days_streak',
    title: 'Constância Serena',
    description: 'Escreveu em 10 dias distintos, fazendo da escrita parte natural da sua vida.',
    iconName: 'Heart',
    category: 'streak',
    color: '#ec4899',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Zen da Escrita Contínua',
    targetNumber: 10,
    metricType: 'unique_days',
    metricUnit: 'dias com escrita',
    celebrationSuggestion: 'Compre uma caneta de luxo ou caderno artesanal novo para selar sua fase profissional. 🖋️',
    consistencyReminder: 'A constância serena não sofre por dias difíceis: ela simplesmente retorna amanhã com humildade.',
  },
  {
    id: 'fifteen_days_streak',
    title: 'Mestre da Rotina',
    description: 'Dedicou 15 dias à criação literária. A escrita agora é seu lar seguro.',
    iconName: 'Crown',
    category: 'streak',
    color: '#6c2eb9',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Monge Supremo da Rotina',
    targetNumber: 15,
    metricType: 'unique_days',
    metricUnit: 'dias com escrita',
    celebrationSuggestion: 'Tire um dia sabático completo para nutrir a alma com museus, filmes ou natureza. 🏞️',
    consistencyReminder: 'A escrita já não é uma obrigação: tornou-se a sua forma mais autêntica de estar no mundo.',
  },
  {
    id: 'deep_focus',
    title: 'Mergulho Profundo (120m)',
    description: 'Acumulou mais de 120 minutos de tempo de escrita dedicado à sua obra.',
    iconName: 'Clock',
    category: 'streak',
    color: '#0ea5e9',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Mergulhador Abissal do Foco',
    targetNumber: 120,
    metricType: 'total_minutes',
    metricUnit: 'minutos dedicados',
    celebrationSuggestion: 'Tome um café com bolo fatiado curtindo o silêncio da sua própria companhia realizada. 🍰',
    consistencyReminder: 'Duas horas dedicadas ao seu sonho são um ato de profunda coragem e amor-próprio.',
  },
  {
    id: 'pantheon_creator',
    title: 'Panteão de Personagens',
    description: 'Deu vida a 4 ou mais personagens ricos na sua galeria.',
    iconName: 'Users',
    category: 'worldbuilding',
    color: '#14b8a6',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Deus do Olimpo Literário',
    targetNumber: 4,
    metricType: 'characters',
    metricUnit: 'personagens criados',
    celebrationSuggestion: 'Escreva um diálogo divertido e fictício entre seus personagens celebrando o autor deles! 🎭',
    consistencyReminder: 'Personagens vivos continuam conversando na mente do leitor muito depois da última página.',
  },
  {
    id: 'weeks_52_constancy',
    title: 'O Monge dos Rascunhos Eternos (52 Semanas Zen)',
    description: '52 semanas inteiras (um ano completo!) escrevendo nas sombras com paciência monástica. Sem pressa e sem afobação — você cria no tempo dos clássicos imortais!',
    iconName: 'Hourglass',
    category: 'streak',
    color: '#7c3aed',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Grão-Mestre da Paciência Zen',
    targetNumber: 52,
    metricType: 'weeks_constancy',
    metricUnit: 'semanas de dedicação',
    celebrationSuggestion: 'Abra sua melhor garrafa ou peça um banquete especial para celebrar um ano de teimosia poética digna de Tolkien e George R.R. Martin. Você é uma fortaleza! 🍷📜✨',
    consistencyReminder: 'A eternidade não tem pressa de publicação. Cada parágrafo trabalhado neste ano carrega a densidade dos clássicos.',
  },
  {
    id: 'pub_15',
    title: 'Prateleira Cheia (15ª Publicação)',
    description: '15 publicações confirmadas. Você já possui uma seção própria em qualquer livraria respeitável!',
    iconName: 'Library',
    category: 'milestone',
    color: '#b83280',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Mestre da Produção Contínua',
    targetNumber: 15,
    metricType: 'publications',
    metricUnit: 'publicações confirmadas',
    celebrationSuggestion: 'Visite uma livraria física e passeie entre as prateleiras com o orgulho de quem tem 15 títulos no currículo! 🏛️',
    consistencyReminder: 'A repetição do ciclo de criação e publicação é o verdadeiro templo da maestria.',
  },
  {
    id: 'pub_30',
    title: 'Acervo Prolífico (30ª Publicação)',
    description: '30 publicações confirmadas! Um catálogo exuberante que poucos escritores conseguem construir.',
    iconName: 'Crown',
    category: 'milestone',
    color: '#6c2eb9',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Titã da Literatura',
    targetNumber: 30,
    metricType: 'publications',
    metricUnit: 'publicações confirmadas',
    celebrationSuggestion: 'Tire um fim de semana de refúgio criativo como presente pelo marco monumental de 30 publicações! 🌿',
    consistencyReminder: '30 obras publicadas são um testamento de dedicação que atravessa anos e gerações.',
  },
  {
    id: 'pub_50',
    title: 'Lenda das Editoras (50ª Publicação)',
    description: '50 publicações no aplicativo! Sua produtividade e disciplina são referência máxima.',
    iconName: 'Flame',
    category: 'milestone',
    color: '#e11d48',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Patrimônio Vivo das Letras',
    targetNumber: 50,
    metricType: 'publications',
    metricUnit: 'publicações confirmadas',
    celebrationSuggestion: 'Escreva uma carta inspiradora para o seu "eu" do passado que começou com a primeira palavra e guarde com carinho. ✉️❤️',
    consistencyReminder: 'Cinquenta obras não são sorte: são o fruto de milhares de horas de puro amor pelas palavras.',
  },
  {
    id: 'pub_100',
    title: 'Enciclopédia Humana (100ª Publicação)',
    description: '100 publicações no app! Uma façanha histórica digna dos maiores autores da literatura mundial.',
    iconName: 'Sparkles',
    category: 'milestone',
    color: '#10b981',
    level: 'bom_demais',
    levelName: 'Escritor Bom Demais',
    funRankName: 'Monstro Sagrado da Criação',
    targetNumber: 100,
    metricType: 'publications',
    metricUnit: 'publicações confirmadas',
    celebrationSuggestion: 'Celebre como se tivesse ganhado um prêmio literário vitalício: você construiu um legado imortal! 🏆✨',
    consistencyReminder: 'Cem obras no mundo significam milhares de leitores tocados pela sua imaginação inesgotável.',
  },
];

/**
 * Calculates current progress value, target, and percentage for any badge.
 */
export const calculateBadgeProgress = (
  badge: Badge,
  sessions: WritingSession[],
  books: Book[],
  projects: Project[],
  wordGameCompletionsCount: number = 0
): { current: number; target: number; percentage: number; unit: string } => {
  const totalWords = sessions.reduce((sum, s) => sum + s.words, 0);
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const uniqueDays = new Set(sessions.map((s) => s.date)).size;
  const maxSessionWords = sessions.reduce((max, s) => Math.max(max, s.words), 0);
  const totalCharacters = books.reduce((sum, b) => sum + (b.characters?.length || 0), 0);
  const totalChapters = books.reduce((sum, b) => sum + (b.chapters?.length || 0), 0);
  const hasGameSession = sessions.some((s) => s.source === 'game') || wordGameCompletionsCount > 0;

  const target = badge.targetNumber || 1;
  const unit = badge.metricUnit || (badge.category === 'milestone' ? 'palavras' : 'itens');
  let current = 0;

  switch (badge.id) {
    case 'first_log':
      current = Math.min(1, sessions.length);
      break;
    case 'hundred_words':
    case 'one_k':
    case 'three_k':
    case 'five_k':
    case 'ten_k':
    case 'fifteen_k':
    case 'twenty_k':
    case 'halfway':
    case 'thirty_k':
    case 'forty_k':
    case 'champion_50k':
    case 'hundred_k':
    case 'two_hundred_k':
    case 'three_hundred_k':
    case 'five_hundred_k':
    case 'one_million':
      current = totalWords;
      break;
    case 'sprint_500':
    case 'sprint_1000':
    case 'daily_pace':
    case 'sprint_master':
      current = maxSessionWords;
      break;
    case 'two_days_streak':
    case 'three_days_streak':
    case 'five_days_streak':
    case 'seven_days_streak':
    case 'ten_days_streak':
    case 'fifteen_days_streak':
      current = uniqueDays;
      break;
    case 'deep_focus_30':
    case 'deep_focus_60':
    case 'deep_focus':
      current = totalMinutes;
      break;
    case 'worldbuilder':
      current = books.length;
      break;
    case 'character_crafter':
    case 'pantheon_creator':
      current = totalCharacters;
      break;
    case 'chapter_architect':
      current = totalChapters;
      break;
    case 'word_alchemist':
      current = hasGameSession ? 1 : 0;
      break;
    case 'weeks_4_constancy':
    case 'weeks_52_constancy': {
      const nowTime = new Date().getTime();
      let daysWithout = 0;
      if (badge.unlockedAt) {
        current = target;
      } else {
        const sessionTimestamps = sessions.map((s) => new Date(s.date).getTime()).filter((t) => !isNaN(t));
        if (sessionTimestamps.length > 0) {
          const minSessionTime = Math.min(...sessionTimestamps);
          daysWithout = Math.max(0, Math.floor((nowTime - minSessionTime) / (1000 * 60 * 60 * 24)));
        }
        current = Math.floor(daysWithout / 7);
      }
      break;
    }
    case 'pub_first':
    case 'pub_each':
    case 'pub_5':
    case 'pub_10':
    case 'pub_15':
    case 'pub_30':
    case 'pub_50':
    case 'pub_100': {
      const totalPublications = books.reduce((sum, b) => {
        const count = b.publicationCount && b.publicationCount > 0
          ? b.publicationCount
          : (b.publishedAt || b.publicationStatus === 'publicado' ? 1 : 0);
        return sum + count;
      }, 0);
      current = totalPublications;
      break;
    }
    default:
      current = badge.unlockedAt ? target : 0;
  }

  // If already unlocked, ensure percentage is 100
  if (badge.unlockedAt) {
    return {
      current: Math.max(current, target),
      target,
      percentage: 100,
      unit,
    };
  }

  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return {
    current,
    target,
    percentage,
    unit,
  };
};

export const evaluateBadges = (
  currentBadges: Badge[],
  sessions: WritingSession[],
  books: Book[],
  projects: Project[],
  wordGameCompletionsCount: number = 0
): { updatedBadges: Badge[]; newlyUnlocked: Badge[] } => {
  const totalWords = sessions.reduce((sum, s) => sum + s.words, 0);
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const uniqueDays = new Set(sessions.map((s) => s.date)).size;
  const maxSessionWords = sessions.reduce((max, s) => Math.max(max, s.words), 0);
  const totalCharacters = books.reduce((sum, b) => sum + (b.characters?.length || 0), 0);
  const totalChapters = books.reduce((sum, b) => sum + (b.chapters?.length || 0), 0);
  const hasGameSession = sessions.some((s) => s.source === 'game') || wordGameCompletionsCount > 0;
  const totalPublications = books.reduce((sum, b) => {
    const count = b.publicationCount && b.publicationCount > 0
      ? b.publicationCount
      : (b.publishedAt || b.publicationStatus === 'publicado' ? 1 : 0);
    return sum + count;
  }, 0);

  // Calculate days/weeks without badge
  const nowTime = new Date().getTime();
  const unlockedBadges = currentBadges.filter((b) => !!b.unlockedAt);
  let daysSinceLastBadge = 0;
  if (unlockedBadges.length > 0) {
    const dates = unlockedBadges
      .map((b) => (b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0))
      .filter((t) => t > 0);
    if (dates.length > 0) {
      const maxUnlockTime = Math.max(...dates);
      daysSinceLastBadge = Math.max(0, Math.floor((nowTime - maxUnlockTime) / (1000 * 60 * 60 * 24)));
    }
  } else {
    const sessionTimestamps = sessions.map((s) => new Date(s.date).getTime()).filter((t) => !isNaN(t));
    if (sessionTimestamps.length > 0) {
      const minSessionTime = Math.min(...sessionTimestamps);
      daysSinceLastBadge = Math.max(0, Math.floor((nowTime - minSessionTime) / (1000 * 60 * 60 * 24)));
    }
  }
  const weeksWithoutBadge = Math.floor(daysSinceLastBadge / 7);

  const now = new Date().toISOString().split('T')[0];
  const newlyUnlocked: Badge[] = [];

  // Reconcile existing stored badges with initial definitions
  const existingMap = new Map<string, Badge>();
  for (const b of currentBadges) {
    existingMap.set(b.id, b);
  }

  const badgesToProcess: Badge[] = INITIAL_BADGES.map((initBadge) => {
    const existing = existingMap.get(initBadge.id);
    if (existing && existing.unlockedAt) {
      return { ...initBadge, unlockedAt: existing.unlockedAt };
    }
    return initBadge;
  });

  const updatedBadges = badgesToProcess.map((badge) => {
    if (badge.unlockedAt) return badge;

    let unlocked = false;

    switch (badge.id) {
      // Marcos de Palavras
      case 'first_log':
        unlocked = sessions.length >= 1;
        break;
      case 'hundred_words':
        unlocked = totalWords >= 100;
        break;
      case 'one_k':
        unlocked = totalWords >= 1000;
        break;
      case 'three_k':
        unlocked = totalWords >= 3000;
        break;
      case 'five_k':
        unlocked = totalWords >= 5000;
        break;
      case 'ten_k':
        unlocked = totalWords >= 10000;
        break;
      case 'fifteen_k':
        unlocked = totalWords >= 15000;
        break;
      case 'twenty_k':
        unlocked = totalWords >= 20000;
        break;
      case 'halfway':
        unlocked = totalWords >= 25000;
        break;
      case 'thirty_k':
        unlocked = totalWords >= 30000;
        break;
      case 'forty_k':
        unlocked = totalWords >= 40000;
        break;
      case 'champion_50k':
        unlocked = totalWords >= 50000;
        break;
      case 'hundred_k':
        unlocked = totalWords >= 100000;
        break;
      case 'two_hundred_k':
        unlocked = totalWords >= 200000;
        break;
      case 'three_hundred_k':
        unlocked = totalWords >= 300000;
        break;
      case 'five_hundred_k':
        unlocked = totalWords >= 500000;
        break;
      case 'one_million':
        unlocked = totalWords >= 1000000;
        break;

      // Foco & Ritmo de Rotina
      case 'sprint_500':
        unlocked = maxSessionWords >= 500;
        break;
      case 'sprint_1000':
        unlocked = maxSessionWords >= 1000;
        break;
      case 'daily_pace':
        unlocked = maxSessionWords >= 1667;
        break;
      case 'sprint_master':
        unlocked = maxSessionWords >= 2000;
        break;
      case 'two_days_streak':
        unlocked = uniqueDays >= 2;
        break;
      case 'three_days_streak':
        unlocked = uniqueDays >= 3;
        break;
      case 'five_days_streak':
        unlocked = uniqueDays >= 5;
        break;
      case 'seven_days_streak':
        unlocked = uniqueDays >= 7;
        break;
      case 'ten_days_streak':
        unlocked = uniqueDays >= 10;
        break;
      case 'fifteen_days_streak':
        unlocked = uniqueDays >= 15;
        break;

      // Tempo de Escrita
      case 'deep_focus_30':
        unlocked = totalMinutes >= 30;
        break;
      case 'deep_focus_60':
        unlocked = totalMinutes >= 60;
        break;
      case 'deep_focus':
        unlocked = totalMinutes >= 120;
        break;

      // Manual do Livro & Arquitetura
      case 'worldbuilder':
        unlocked = books.length >= 1;
        break;
      case 'character_crafter':
        unlocked = totalCharacters >= 2;
        break;
      case 'pantheon_creator':
        unlocked = totalCharacters >= 4;
        break;
      case 'chapter_architect':
        unlocked = totalChapters >= 3;
        break;

      // Criatividade
      case 'word_alchemist':
        unlocked = hasGameSession;
        break;

      // Constância & Semanas Consecutivas sem Conquistas
      case 'weeks_4_constancy':
        unlocked = weeksWithoutBadge >= 4;
        break;
      case 'weeks_52_constancy':
        unlocked = weeksWithoutBadge >= 52;
        break;

      // Publicações e Lançamentos
      case 'pub_first':
        unlocked = totalPublications >= 1;
        break;
      case 'pub_each':
        unlocked = totalPublications >= 2;
        break;
      case 'pub_5':
        unlocked = totalPublications >= 5;
        break;
      case 'pub_10':
        unlocked = totalPublications >= 10;
        break;
      case 'pub_15':
        unlocked = totalPublications >= 15;
        break;
      case 'pub_30':
        unlocked = totalPublications >= 30;
        break;
      case 'pub_50':
        unlocked = totalPublications >= 50;
        break;
      case 'pub_100':
        unlocked = totalPublications >= 100;
        break;

      default:
        unlocked = false;
    }

    if (unlocked) {
      const updated = { ...badge, unlockedAt: now };
      newlyUnlocked.push(updated);
      return updated;
    }

    return badge;
  });

  return { updatedBadges, newlyUnlocked };
};

export interface ConstancyCelebrationInfo {
  eligible: boolean;
  daysWithoutBadge: number;
  activeDaysCount: number;
  title: string;
  subtitle: string;
  celebrationSuggestion: string;
  consistencyReminder: string;
}

export const CONSTANCY_7_DAYS_CELEBRATION = {
  title: 'Celebração da Constância Literária: 7 Dias de Foco Silencioso',
  subtitle: 'Nem só de troféus vive a arte: sua presença contínua é a maior vitória!',
  celebrationSuggestion:
    'Prepare uma bebida reconfortante (um chocolate quente, café especial ou chá aromático), coloque sua música ambiente favorita e releia com carinho a melhor frase que você escreveu esta semana. Você perseverou! ☕✨',
  consistencyReminder:
    'Os maiores clássicos da humanidade foram gerados no silêncio dos dias comuns, não nos confetes das comemorações. A sua perseverança diária é o que constrói um legado verdadeiro.',
};

/**
 * Checks if 7 days have passed without a badge unlock, suggesting a constancy celebration.
 */
export const checkSevenDaysWithoutBadges = (
  badges: Badge[],
  sessions: WritingSession[]
): ConstancyCelebrationInfo => {
  const now = new Date();
  const unlockedBadges = badges.filter((b) => !!b.unlockedAt);
  const uniqueSessionDates = new Set(sessions.map((s) => s.date));
  const activeDaysCount = uniqueSessionDates.size;

  if (sessions.length === 0) {
    return {
      eligible: false,
      daysWithoutBadge: 0,
      activeDaysCount: 0,
      ...CONSTANCY_7_DAYS_CELEBRATION,
    };
  }

  // Calculate days since latest badge unlock
  let daysSinceLastBadge = 7;
  if (unlockedBadges.length > 0) {
    const dates = unlockedBadges
      .map((b) => (b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0))
      .filter((t) => t > 0);
    if (dates.length > 0) {
      const maxUnlockTime = Math.max(...dates);
      const diffMs = now.getTime() - maxUnlockTime;
      daysSinceLastBadge = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  } else {
    // If no badges unlocked yet, check span of sessions
    const sessionTimestamps = sessions.map((s) => new Date(s.date).getTime()).filter((t) => !isNaN(t));
    if (sessionTimestamps.length > 0) {
      const minSessionTime = Math.min(...sessionTimestamps);
      const diffMs = now.getTime() - minSessionTime;
      daysSinceLastBadge = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  }

  // Eligible if at least 7 days without a new badge or 7 active days
  const eligible = daysSinceLastBadge >= 7 || activeDaysCount >= 7;

  return {
    eligible,
    daysWithoutBadge: daysSinceLastBadge,
    activeDaysCount,
    ...CONSTANCY_7_DAYS_CELEBRATION,
  };
};
