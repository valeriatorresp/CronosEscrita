export interface InspirationalQuote {
  text: string;
  author: string;
}

export const INSPIRATIONAL_QUOTES: InspirationalQuote[] = [
  {
    text: 'Não espere pela inspiração. Ela só vem quando você já está com as mãos sobre as teclas.',
    author: 'Reflexão Literária',
  },
  {
    text: 'Você pode consertar qualquer coisa já escrita, menos uma página em branco.',
    author: 'Nora Roberts',
  },
  {
    text: 'A escrita não é sobre pressa, mas sobre a coragem diária de dar voz ao que pulsa em silêncio.',
    author: 'Valéria Torres',
  },
  {
    text: 'Renda-se ao desconhecido. Mergulhe na história com a coragem de quem descobre um novo continente.',
    author: 'Clarice Lispector',
  },
  {
    text: 'Cada página rascunhada com sinceridade guarda o poder de transformar a alma de quem lê.',
    author: 'Valéria Torres',
  },
  {
    text: 'O que a vida quer da gente é coragem. E a coragem do escritor é dar o primeiro traço.',
    author: 'Guimarães Rosa',
  },
  {
    text: 'O livro nasce no instante em que decidimos que a nossa voz merece existir no papel.',
    author: 'Valéria Torres',
  },
  {
    text: 'A água só começa a jorrar depois que abrimos a torneira. Escreva mesmo quando a mente parecer quieta.',
    author: 'Louis L’Amour',
  },
  {
    text: 'Uma palavra após a outra, compassadamente. É assim que os universos ganham vida.',
    author: 'Margaret Atwood',
  },
  {
    text: 'Não há maior agonia do que carregar uma história não contada guardada no peito.',
    author: 'Maya Angelou',
  },
  {
    text: 'Escreva primeiro com a porta fechada, entregue-se à imaginação; depois reescreva para o mundo.',
    author: 'Stephen King',
  },
  {
    text: 'Cada frase que você escreve hoje é um tijolo a mais na catedral da sua obra-prima.',
    author: 'CronosEscrita',
  },
  {
    text: 'O primeiro rascunho serve para você contar a história para si mesmo.',
    author: 'Terry Pratchett',
  },
  {
    text: 'As palavras têm o poder de erguer pontes invisíveis entre almas separadas pelo tempo.',
    author: 'Virginia Woolf',
  },
];

export const getRandomQuote = (previousIndex?: number): { quote: InspirationalQuote; index: number } => {
  let index = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
  if (previousIndex !== undefined && INSPIRATIONAL_QUOTES.length > 1 && index === previousIndex) {
    index = (index + 1) % INSPIRATIONAL_QUOTES.length;
  }
  return { quote: INSPIRATIONAL_QUOTES[index], index };
};
