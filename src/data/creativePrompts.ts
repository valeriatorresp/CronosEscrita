export interface CreativeChallenge {
  id: string;
  category:
    | 'primeira_frase'
    | 'conflito'
    | 'personagem'
    | 'sensorial'
    | 'dialogo_voz'
    | 'cenario_mundo'
    | 'desafio_restricao';
  categoryLabel: string;
  categoryColor: string;
  title: string;
  statement: string;
  provocation: string;
  suggestedDurationMinutes?: number;
}

export const CREATIVE_CHALLENGES: CreativeChallenge[] = [
  // 1. Primeiras Frases Intrigantes
  {
    id: 'pf_1',
    category: 'primeira_frase',
    categoryLabel: 'Primeira Frase',
    categoryColor: 'purple',
    title: 'A Porta Entreaberta',
    statement: '“A carta havia chegado com dez anos de atraso, mas o remetente sabia que hoje seria o único dia em que ela faria sentido.”',
    provocation: 'Continue esta abertura sem explicar tudo de imediato. Deixe o leitor sentir o peso do envelope nas mãos do personagem.',
    suggestedDurationMinutes: 10,
  },
  {
    id: 'pf_2',
    category: 'primeira_frase',
    categoryLabel: 'Primeira Frase',
    categoryColor: 'purple',
    title: 'O Nome Esquecido',
    statement: '“Ele acordou com a certeza absoluta de que havia deixado algo fundamental na sala de estar, mas a sala de estar já não existia.”',
    provocation: 'Construa a sensação de desorientação. O que é real e o que se transformou?',
    suggestedDurationMinutes: 10,
  },
  {
    id: 'pf_3',
    category: 'primeira_frase',
    categoryLabel: 'Primeira Frase',
    categoryColor: 'purple',
    title: 'O Pacto Silencioso',
    statement: '“Ninguém na cidade falava sobre o sino da torre velha, exceto quando ele tocava à meia-noite sem vento.”',
    provocation: 'Quem é a primeira pessoa a olhar para cima quando o sino soa?',
    suggestedDurationMinutes: 10,
  },
  {
    id: 'pf_4',
    category: 'primeira_frase',
    categoryLabel: 'Primeira Frase',
    categoryColor: 'purple',
    title: 'A Confissão Inevitável',
    statement: '“Prometi a mim mesma que nunca contaria a ninguém sobre aquela tarde de novembro, mas a verdade tem raízes e racha o concreto.”',
    provocation: 'Qual é o detalhe sensorial que finalmente quebrou a promessa?',
    suggestedDurationMinutes: 15,
  },
  {
    id: 'pf_5',
    category: 'primeira_frase',
    categoryLabel: 'Primeira Frase',
    categoryColor: 'purple',
    title: 'O Último Passageiro',
    statement: '“O último trem sempre partia às 23h42, mas naquela noite o maquinista não esperava que o único passageiro recusasse descer na última estação.”',
    provocation: 'O que o passageiro carrega na mala de mão?',
    suggestedDurationMinutes: 10,
  },

  // 2. Conflitos & Enredo
  {
    id: 'conf_1',
    category: 'conflito',
    categoryLabel: 'Conflito & Dilema',
    categoryColor: 'pink',
    title: 'O Segredo Compartilhado',
    statement: 'Dois personagens de longa amizade descobrem que competem pela mesma vaga, herança ou verdade irrevogável. Um deles tem uma prova que destrói a reputação do outro.',
    provocation: 'Escreva a cena em que ambos se encontram para um almoço comum tentando agir como se nada soubessem.',
    suggestedDurationMinutes: 15,
  },
  {
    id: 'conf_2',
    category: 'conflito',
    categoryLabel: 'Conflito & Dilema',
    categoryColor: 'pink',
    title: 'A Promessa Rompida por Amor',
    statement: 'Um personagem jurou solenemente a um ente querido nunca abrir uma determinada caixa ou arquivo. Uma emergência grave torna a quebra desse juramento a única saída.',
    provocation: 'Narre o segundo exato em que a tampa é erguida e o que os olhos encontram lá dentro.',
    suggestedDurationMinutes: 10,
  },
  {
    id: 'conf_3',
    category: 'conflito',
    categoryLabel: 'Conflito & Dilema',
    categoryColor: 'pink',
    title: 'O Testemunho Calado',
    statement: 'Um protagonista presencia uma injustiça cometida pela pessoa que salvou a sua vida anos atrás. Denunciar é ingratidão; silenciar é cumplicidade.',
    provocation: 'Escreva o monólogo interior ou o diálogo tenso entre os dois durante uma caminhada noturna.',
    suggestedDurationMinutes: 15,
  },

  // 3. Desenvolvimento de Personagem
  {
    id: 'pers_1',
    category: 'personagem',
    categoryLabel: 'Personagem',
    categoryColor: 'teal',
    title: 'A Máscara e a Ferida',
    statement: 'Crie uma personagem cuja profissão exige autoridade absoluta e frieza (uma cirurgiã, um juiz, uma diretora rígida), mas que em segredo mantém um ritual infantil de consolo.',
    provocation: 'Mostre esse contraste através de uma ação concreta, sem precisar explicar em prosa expositiva.',
    suggestedDurationMinutes: 15,
  },
  {
    id: 'pers_2',
    category: 'personagem',
    categoryLabel: 'Personagem',
    categoryColor: 'teal',
    title: 'O Hábito Inexplicável',
    statement: 'Um personagem sempre conta os degraus de qualquer escada ou guarda um punhado de sal no bolso do casaco. Há uma história dolorosa ou poética por trás desse costume.',
    provocation: 'Alguém nota esse hábito pela primeira vez e pergunta o motivo. Como o personagem reage?',
    suggestedDurationMinutes: 10,
  },
  {
    id: 'pers_3',
    category: 'personagem',
    categoryLabel: 'Personagem',
    categoryColor: 'teal',
    title: 'A Mentira Cotidiana',
    statement: 'Um personagem mente sobre a sua infância para todos com quem convive. Um dia, alguém da cidade natal aparece de surpresa no seu trabalho.',
    provocation: 'Escreva a troca de olhares de três segundos antes que qualquer palavra seja dita.',
    suggestedDurationMinutes: 12,
  },

  // 4. Sensorial & Atmosfera
  {
    id: 'sens_1',
    category: 'sensorial',
    categoryLabel: 'Sensorial & Clima',
    categoryColor: 'amber',
    title: 'A Tempestade sem Trovões',
    statement: 'Descreva a chegada de um temporal de verão usando apenas sensações táteis e olfativas: o calor do asfalto cedendo à primeira gota grossa, o cheiro de ozônio e terra úmida, os pelos dos braços arrepiados pela eletricidade estática.',
    provocation: 'Proibido usar as palavras: “chuva”, “trovão” e “nuvem”. Faça o leitor sentir a água no ar.',
    suggestedDurationMinutes: 10,
  },
  {
    id: 'sens_2',
    category: 'sensorial',
    categoryLabel: 'Sensorial & Clima',
    categoryColor: 'amber',
    title: 'A Cozinha da Madrugada',
    statement: 'Descreva a solidão serena de uma cozinha às 3 da manhã: o zumbido mecânico da geladeira, o reflexo do azulejo sob a lâmpada fluorescente, o peso de uma colher de metal tocando a louça fria.',
    provocation: 'Qual pensamento não dito ecoa naquele silêncio?',
    suggestedDurationMinutes: 8,
  },
  {
    id: 'sens_3',
    category: 'sensorial',
    categoryLabel: 'Sensorial & Clima',
    categoryColor: 'amber',
    title: 'O Cheiro da Despedida',
    statement: 'Descreva um quarto após alguém ter acabado de empacotar suas coisas e partir para sempre. O vazio não é neutro: ele tem eco, poeira suspensa e a marca onde os quadros costumavam ficar na parede.',
    provocation: 'Mostre o que ficou através dos rastros físicos que a ausência deixou.',
    suggestedDurationMinutes: 10,
  },

  // 5. NOVA CATEGORIA: Diálogo & Voz
  {
    id: 'dial_1',
    category: 'dialogo_voz',
    categoryLabel: 'Diálogo & Voz',
    categoryColor: 'rose',
    title: 'Dizendo Tudo Sem Dizer Nada',
    statement: 'Dois personagens conversam sobre o conserto banal de uma cafeteira quebrada na bancada, mas toda a tensão real é sobre uma traição recente que nenhum dos dois ousa nomear.',
    provocation: 'Trabalhe o subtexto em cada réplica: as pausas, as perguntas secas e o que fica engasgado na garganta.',
    suggestedDurationMinutes: 12,
  },
  {
    id: 'dial_2',
    category: 'dialogo_voz',
    categoryLabel: 'Diálogo & Voz',
    categoryColor: 'rose',
    title: 'O Interrogatório Invertido',
    statement: 'Alguém com autoridade tenta obter uma confissão, mas a pessoa interrogada responde com perguntas tão calmas e desconcertantes que aos poucos inverte a hierarquia da conversa.',
    provocation: 'Mostre o momento em que a certeza de quem interrogava se esfarela pela primeira vez.',
    suggestedDurationMinutes: 15,
  },

  // 6. NOVA CATEGORIA: Cenário & Mundo
  {
    id: 'cen_1',
    category: 'cenario_mundo',
    categoryLabel: 'Cenário & Mundo',
    categoryColor: 'emerald',
    title: 'A Cidade que Nunca Dorme de Verdade',
    statement: 'Descreva um bairro ou vila sob uma luz incomum (o crepúsculo violeta de uma tempestade ou o primeiro raio de sol sobre as telhas molhadas). O lugar deve funcionar quase como um personagem vivo.',
    provocation: 'Dê à arquitetura uma intenção: as janelas que espiam, os becos que engolem o eco ou os postes que piscam cansados.',
    suggestedDurationMinutes: 10,
  },
  {
    id: 'cen_2',
    category: 'cenario_mundo',
    categoryLabel: 'Cenário & Mundo',
    categoryColor: 'emerald',
    title: 'O Lugar Proibido da Infância',
    statement: 'Descreva um espaço abandonado (o sótão com tábuas soltas, o antigo armazém da ferrovia ou um quintal coberto de mato e ferrugem) onde duas crianças costumavam fazer juramentos.',
    provocation: 'Narre pelo contraste de como o lugar parecia imenso na infância e como parece minúsculo ao retornar adulto.',
    suggestedDurationMinutes: 12,
  },

  // 7. Desafio com Restrição Criativa
  {
    id: 'rest_1',
    category: 'desafio_restricao',
    categoryLabel: 'Com Restrição',
    categoryColor: 'indigo',
    title: 'Microconto em 50 Palavras Exatas',
    statement: 'Escreva uma história completa (com começo, virada e desfecho emocional) que contenha EXATAMENTE 50 palavras.',
    provocation: 'Cada adjetivo supérfluo deve ser cortado. Toda palavra precisa carregar a gravidade de uma frase inteira.',
    suggestedDurationMinutes: 15,
  },
  {
    id: 'rest_2',
    category: 'desafio_restricao',
    categoryLabel: 'Com Restrição',
    categoryColor: 'indigo',
    title: 'Apenas Diálogo e Subtexto',
    statement: 'Escreva uma cena entre duas pessoas em um restaurante onde nenhuma narração é permitida (apenas as falas dos personagens). Elas estão terminando um casamento sem que a palavra “separação” ou “divórcio” seja proferida.',
    provocation: 'Deixe o subtexto revelar a dor através de pedidos de sobremesa, comentários sobre o tempo e silêncios implícitos.',
    suggestedDurationMinutes: 12,
  },
  {
    id: 'rest_3',
    category: 'desafio_restricao',
    categoryLabel: 'Com Restrição',
    categoryColor: 'indigo',
    title: 'O Monólogo de um Objeto',
    statement: 'Narre uma cena pelo ponto de vista de um objeto inanimado (um espelho antigo de penteadeira, uma caneta-tinteiro desgastada ou uma chave esquecida no fundo do bolso).',
    provocation: 'O que esse objeto testemunhou que os humanos ao redor fingem não ver?',
    suggestedDurationMinutes: 10,
  },
];

export const getChallengeByCategory = (
  category: CreativeChallenge['category'] | 'todos'
): CreativeChallenge[] => {
  if (category === 'todos') return CREATIVE_CHALLENGES;
  return CREATIVE_CHALLENGES.filter((c) => c.category === category);
};

export const getRandomChallenge = (currentId?: string): CreativeChallenge => {
  const candidates = currentId
    ? CREATIVE_CHALLENGES.filter((c) => c.id !== currentId)
    : CREATIVE_CHALLENGES;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] || CREATIVE_CHALLENGES[0];
};
