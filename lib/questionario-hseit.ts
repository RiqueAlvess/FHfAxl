// Questionário HSE-IT - 35 Perguntas em 7 Dimensões

export type Polaridade = "POSITIVA" | "NEGATIVA";

export interface Pergunta {
  id: number;
  dimensao: string;
  texto: string;
  polaridade: Polaridade;
}

export interface Dimensao {
  nome: string;
  codigo: string;
  polaridade: Polaridade;
  perguntas: number; // quantidade de perguntas
  descricao: string;
}

export const dimensoes: Dimensao[] = [
  {
    nome: "Demandas",
    codigo: "demandas",
    polaridade: "NEGATIVA",
    perguntas: 8,
    descricao: "Carga e ritmo de trabalho",
  },
  {
    nome: "Controle",
    codigo: "controle",
    polaridade: "POSITIVA",
    perguntas: 6,
    descricao: "Autonomia e participação",
  },
  {
    nome: "Apoio Gerencial",
    codigo: "apoioGerencial",
    polaridade: "POSITIVA",
    perguntas: 5,
    descricao: "Suporte da chefia",
  },
  {
    nome: "Apoio de Colegas",
    codigo: "apoioColegas",
    polaridade: "POSITIVA",
    perguntas: 4,
    descricao: "Suporte dos colegas",
  },
  {
    nome: "Relacionamentos",
    codigo: "relacionamentos",
    polaridade: "NEGATIVA",
    perguntas: 4,
    descricao: "Conflitos interpessoais",
  },
  {
    nome: "Papel",
    codigo: "papel",
    polaridade: "POSITIVA",
    perguntas: 5,
    descricao: "Clareza de responsabilidades",
  },
  {
    nome: "Mudanças",
    codigo: "mudancas",
    polaridade: "POSITIVA",
    perguntas: 3,
    descricao: "Gestão de mudanças",
  },
];

export const perguntas: Pergunta[] = [
  // DEMANDAS (8 perguntas - NEGATIVA)
  {
    id: 1,
    dimensao: "demandas",
    texto: "Você tem que trabalhar muito rapidamente?",
    polaridade: "NEGATIVA",
  },
  {
    id: 2,
    dimensao: "demandas",
    texto: "Você tem que trabalhar muito intensamente?",
    polaridade: "NEGATIVA",
  },
  {
    id: 3,
    dimensao: "demandas",
    texto: "Seu trabalho exige muito de você emocionalmente?",
    polaridade: "NEGATIVA",
  },
  {
    id: 4,
    dimensao: "demandas",
    texto: "Você precisa se concentrar por longos períodos de tempo?",
    polaridade: "NEGATIVA",
  },
  {
    id: 5,
    dimensao: "demandas",
    texto: "Seu trabalho exige muito esforço físico?",
    polaridade: "NEGATIVA",
  },
  {
    id: 6,
    dimensao: "demandas",
    texto: "Você é interrompido frequentemente durante suas tarefas?",
    polaridade: "NEGATIVA",
  },
  {
    id: 7,
    dimensao: "demandas",
    texto: "Você tem tempo insuficiente para completar suas tarefas?",
    polaridade: "NEGATIVA",
  },
  {
    id: 8,
    dimensao: "demandas",
    texto: "Você precisa trabalhar horas extras para finalizar o trabalho?",
    polaridade: "NEGATIVA",
  },

  // CONTROLE (6 perguntas - POSITIVA)
  {
    id: 9,
    dimensao: "controle",
    texto: "Você tem influência sobre a quantidade de trabalho que lhe é atribuída?",
    polaridade: "POSITIVA",
  },
  {
    id: 10,
    dimensao: "controle",
    texto: "Você pode decidir quando fazer pausas?",
    polaridade: "POSITIVA",
  },
  {
    id: 11,
    dimensao: "controle",
    texto: "Você tem voz nas decisões relacionadas ao seu trabalho?",
    polaridade: "POSITIVA",
  },
  {
    id: 12,
    dimensao: "controle",
    texto: "Você pode escolher com quem trabalhar?",
    polaridade: "POSITIVA",
  },
  {
    id: 13,
    dimensao: "controle",
    texto: "Você pode definir seu próprio ritmo de trabalho?",
    polaridade: "POSITIVA",
  },
  {
    id: 14,
    dimensao: "controle",
    texto: "Você participa de decisões importantes sobre mudanças no trabalho?",
    polaridade: "POSITIVA",
  },

  // APOIO GERENCIAL (5 perguntas - POSITIVA)
  {
    id: 15,
    dimensao: "apoioGerencial",
    texto: "Seu gestor imediato o encoraja e apoia?",
    polaridade: "POSITIVA",
  },
  {
    id: 16,
    dimensao: "apoioGerencial",
    texto: "Seu gestor fornece feedback útil sobre seu trabalho?",
    polaridade: "POSITIVA",
  },
  {
    id: 17,
    dimensao: "apoioGerencial",
    texto: "Seu gestor está disposto a ouvir seus problemas relacionados ao trabalho?",
    polaridade: "POSITIVA",
  },
  {
    id: 18,
    dimensao: "apoioGerencial",
    texto: "Seu gestor ajuda você a realizar o trabalho quando necessário?",
    polaridade: "POSITIVA",
  },
  {
    id: 19,
    dimensao: "apoioGerencial",
    texto: "Seu gestor respeita você como pessoa e como profissional?",
    polaridade: "POSITIVA",
  },

  // APOIO DE COLEGAS (4 perguntas - POSITIVA)
  {
    id: 20,
    dimensao: "apoioColegas",
    texto: "Seus colegas estão dispostos a ouvir seus problemas relacionados ao trabalho?",
    polaridade: "POSITIVA",
  },
  {
    id: 21,
    dimensao: "apoioColegas",
    texto: "Seus colegas fornecem ajuda e apoio quando necessário?",
    polaridade: "POSITIVA",
  },
  {
    id: 22,
    dimensao: "apoioColegas",
    texto: "Você recebe o respeito que merece de seus colegas?",
    polaridade: "POSITIVA",
  },
  {
    id: 23,
    dimensao: "apoioColegas",
    texto: "Você pode contar com seus colegas em situações difíceis?",
    polaridade: "POSITIVA",
  },

  // RELACIONAMENTOS (4 perguntas - NEGATIVA)
  {
    id: 24,
    dimensao: "relacionamentos",
    texto: "Você é intimidado ou assediado no trabalho?",
    polaridade: "NEGATIVA",
  },
  {
    id: 25,
    dimensao: "relacionamentos",
    texto: "Você experimenta conflitos pessoais ou tensões no trabalho?",
    polaridade: "NEGATIVA",
  },
  {
    id: 26,
    dimensao: "relacionamentos",
    texto: "Você é tratado injustamente no trabalho?",
    polaridade: "NEGATIVA",
  },
  {
    id: 27,
    dimensao: "relacionamentos",
    texto: "Há falta de comunicação ou mal-entendidos com colegas?",
    polaridade: "NEGATIVA",
  },

  // PAPEL (5 perguntas - POSITIVA)
  {
    id: 28,
    dimensao: "papel",
    texto: "Você compreende claramente o que se espera de você no trabalho?",
    polaridade: "POSITIVA",
  },
  {
    id: 29,
    dimensao: "papel",
    texto: "Você sabe exatamente quais são suas responsabilidades?",
    polaridade: "POSITIVA",
  },
  {
    id: 30,
    dimensao: "papel",
    texto: "Você recebe informações claras sobre os objetivos do seu trabalho?",
    polaridade: "POSITIVA",
  },
  {
    id: 31,
    dimensao: "papel",
    texto: "Suas tarefas e objetivos estão bem definidos?",
    polaridade: "POSITIVA",
  },
  {
    id: 32,
    dimensao: "papel",
    texto: "Você sabe como seu trabalho contribui para os objetivos da organização?",
    polaridade: "POSITIVA",
  },

  // MUDANÇAS (3 perguntas - POSITIVA)
  {
    id: 33,
    dimensao: "mudancas",
    texto: "Você é consultado sobre mudanças que afetam seu trabalho?",
    polaridade: "POSITIVA",
  },
  {
    id: 34,
    dimensao: "mudancas",
    texto: "As mudanças organizacionais são comunicadas claramente?",
    polaridade: "POSITIVA",
  },
  {
    id: 35,
    dimensao: "mudancas",
    texto: "Você recebe suporte adequado durante períodos de mudança?",
    polaridade: "POSITIVA",
  },
];

// Escala Likert
export const escalaLikert = [
  { valor: 0, label: "Nunca" },
  { valor: 1, label: "Raramente" },
  { valor: 2, label: "Às vezes" },
  { valor: 3, label: "Frequentemente" },
  { valor: 4, label: "Sempre" },
];

// Validar total de perguntas
if (perguntas.length !== 35) {
  throw new Error(`Erro: Esperadas 35 perguntas, encontradas ${perguntas.length}`);
}
