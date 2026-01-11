// Questionário HSE-IT - 35 Perguntas em 7 Dimensões

export type Polaridade = "POSITIVA" | "NEGATIVA";

export interface Pergunta {
  id: number;
  dimensao: string;
  texto: string;
  polaridade: Polaridade;
  ordem: number;
}

export interface Dimensao {
  nome: string;
  codigo: string;
  polaridade: Polaridade;
  perguntas: number; // quantidade de perguntas
  descricao: string;
  ordem: number;
}

export const dimensoes: Dimensao[] = [
  {
    nome: "Demandas",
    codigo: "demandas",
    polaridade: "NEGATIVA",
    perguntas: 7,
    descricao: "Carga de trabalho, ritmo e horários",
    ordem: 1,
  },
  {
    nome: "Controle",
    codigo: "controle",
    polaridade: "POSITIVA",
    perguntas: 6,
    descricao: "Autonomia e influência sobre o trabalho",
    ordem: 2,
  },
  {
    nome: "Apoio Gerencial",
    codigo: "apoioGerencial",
    polaridade: "POSITIVA",
    perguntas: 5,
    descricao: "Suporte e incentivo dos supervisores",
    ordem: 3,
  },
  {
    nome: "Apoio de Colegas",
    codigo: "apoioColegas",
    polaridade: "POSITIVA",
    perguntas: 4,
    descricao: "Suporte e cooperação entre colegas",
    ordem: 4,
  },
  {
    nome: "Relacionamentos",
    codigo: "relacionamentos",
    polaridade: "NEGATIVA",
    perguntas: 4,
    descricao: "Conflitos e tensões interpessoais",
    ordem: 5,
  },
  {
    nome: "Papel",
    codigo: "papel",
    polaridade: "POSITIVA",
    perguntas: 6,
    descricao: "Clareza sobre responsabilidades e expectativas",
    ordem: 6,
  },
  {
    nome: "Mudanças",
    codigo: "mudancas",
    polaridade: "POSITIVA",
    perguntas: 3,
    descricao: "Como as mudanças são geridas e comunicadas",
    ordem: 7,
  },
];

export const perguntas: Pergunta[] = [
  // Pergunta 1 - Papel
  {
    id: 1,
    dimensao: "papel",
    texto: "Tenho clareza sobre o que se espera do meu trabalho",
    polaridade: "POSITIVA",
    ordem: 1,
  },
  // Pergunta 2 - Controle
  {
    id: 2,
    dimensao: "controle",
    texto: "Posso decidir quando fazer uma pausa",
    polaridade: "POSITIVA",
    ordem: 2,
  },
  // Pergunta 3 - Demandas
  {
    id: 3,
    dimensao: "demandas",
    texto: "As exigências de trabalho feitas por colegas e supervisores são difíceis de combinar",
    polaridade: "NEGATIVA",
    ordem: 3,
  },
  // Pergunta 4 - Papel
  {
    id: 4,
    dimensao: "papel",
    texto: "Eu sei como fazer o meu trabalho",
    polaridade: "POSITIVA",
    ordem: 4,
  },
  // Pergunta 5 - Relacionamentos
  {
    id: 5,
    dimensao: "relacionamentos",
    texto: "Falam ou se comportam comigo de forma dura",
    polaridade: "NEGATIVA",
    ordem: 5,
  },
  // Pergunta 6 - Demandas
  {
    id: 6,
    dimensao: "demandas",
    texto: "Tenho prazos inatingíveis",
    polaridade: "NEGATIVA",
    ordem: 6,
  },
  // Pergunta 7 - Apoio de Colegas
  {
    id: 7,
    dimensao: "apoioColegas",
    texto: "Quando o trabalho se torna difícil, posso contar com ajuda dos colegas",
    polaridade: "POSITIVA",
    ordem: 7,
  },
  // Pergunta 8 - Apoio Gerencial
  {
    id: 8,
    dimensao: "apoioGerencial",
    texto: "Recebo informações e suporte que me ajudam no trabalho que eu faço",
    polaridade: "POSITIVA",
    ordem: 8,
  },
  // Pergunta 9 - Demandas
  {
    id: 9,
    dimensao: "demandas",
    texto: "Devo trabalhar muito intensamente",
    polaridade: "NEGATIVA",
    ordem: 9,
  },
  // Pergunta 10 - Controle
  {
    id: 10,
    dimensao: "controle",
    texto: "Consideram a minha opinião sobre a velocidade do meu trabalho",
    polaridade: "POSITIVA",
    ordem: 10,
  },
  // Pergunta 11 - Papel
  {
    id: 11,
    dimensao: "papel",
    texto: "Estão claras as minhas tarefas e responsabilidades",
    polaridade: "POSITIVA",
    ordem: 11,
  },
  // Pergunta 12 - Demandas
  {
    id: 12,
    dimensao: "demandas",
    texto: "Eu não faço algumas tarefas porque tenho muita coisa para fazer",
    polaridade: "NEGATIVA",
    ordem: 12,
  },
  // Pergunta 13 - Papel
  {
    id: 13,
    dimensao: "papel",
    texto: "Os objetivos e metas do meu setor são claros para mim",
    polaridade: "POSITIVA",
    ordem: 13,
  },
  // Pergunta 14 - Relacionamentos
  {
    id: 14,
    dimensao: "relacionamentos",
    texto: "Existem conflitos entre os colegas",
    polaridade: "NEGATIVA",
    ordem: 14,
  },
  // Pergunta 15 - Controle
  {
    id: 15,
    dimensao: "controle",
    texto: "Tenho liberdade de escolha de como fazer meu trabalho",
    polaridade: "POSITIVA",
    ordem: 15,
  },
  // Pergunta 16 - Demandas
  {
    id: 16,
    dimensao: "demandas",
    texto: "Não tenho possibilidade de fazer pausas suficientes",
    polaridade: "NEGATIVA",
    ordem: 16,
  },
  // Pergunta 17 - Papel
  {
    id: 17,
    dimensao: "papel",
    texto: "Eu vejo como o meu trabalho se encaixa nos objetivos da empresa",
    polaridade: "POSITIVA",
    ordem: 17,
  },
  // Pergunta 18 - Demandas
  {
    id: 18,
    dimensao: "demandas",
    texto: "Recebo pressão para trabalhar em outro horário",
    polaridade: "NEGATIVA",
    ordem: 18,
  },
  // Pergunta 19 - Controle
  {
    id: 19,
    dimensao: "controle",
    texto: "Tenho liberdade de escolha para decidir o que fazer no meu trabalho",
    polaridade: "POSITIVA",
    ordem: 19,
  },
  // Pergunta 20 - Demandas
  {
    id: 20,
    dimensao: "demandas",
    texto: "Tenho que fazer meu trabalho com muita rapidez",
    polaridade: "NEGATIVA",
    ordem: 20,
  },
  // Pergunta 21 - Relacionamentos
  {
    id: 21,
    dimensao: "relacionamentos",
    texto: "Sinto que sou perseguido no trabalho",
    polaridade: "NEGATIVA",
    ordem: 21,
  },
  // Pergunta 22 - Demandas (REMOVIDA - pergunta duplicada/confusa)
  // Nota: A pergunta 22 original "As pausas temporárias são impossíveis de cumprir" foi removida
  // pois é muito similar à pergunta 16 e não faz sentido

  // Pergunta 23 - Apoio Gerencial
  {
    id: 23,
    dimensao: "apoioGerencial",
    texto: "Posso confiar no meu chefe quando eu tiver problemas no trabalho",
    polaridade: "POSITIVA",
    ordem: 23,
  },
  // Pergunta 24 - Apoio de Colegas
  {
    id: 24,
    dimensao: "apoioColegas",
    texto: "Meus colegas me ajudam e me dão apoio quando eu preciso",
    polaridade: "POSITIVA",
    ordem: 24,
  },
  // Pergunta 25 - Controle
  {
    id: 25,
    dimensao: "controle",
    texto: "Minhas sugestões são consideradas sobre como fazer meu trabalho",
    polaridade: "POSITIVA",
    ordem: 25,
  },
  // Pergunta 26 - Mudanças
  {
    id: 26,
    dimensao: "mudancas",
    texto: "Tenho oportunidades para pedir explicações ao chefe sobre as mudanças relacionadas ao meu trabalho",
    polaridade: "POSITIVA",
    ordem: 26,
  },
  // Pergunta 27 - Apoio de Colegas
  {
    id: 27,
    dimensao: "apoioColegas",
    texto: "No trabalho os meus colegas demonstram o respeito que mereço",
    polaridade: "POSITIVA",
    ordem: 27,
  },
  // Pergunta 28 - Mudanças
  {
    id: 28,
    dimensao: "mudancas",
    texto: "As pessoas são sempre consultadas sobre as mudanças no trabalho",
    polaridade: "POSITIVA",
    ordem: 28,
  },
  // Pergunta 29 - Apoio Gerencial
  {
    id: 29,
    dimensao: "apoioGerencial",
    texto: "Quando algo no trabalho me perturba ou irrita posso falar com meu chefe",
    polaridade: "POSITIVA",
    ordem: 29,
  },
  // Pergunta 30 - Controle
  {
    id: 30,
    dimensao: "controle",
    texto: "O meu horário de trabalho pode ser flexível",
    polaridade: "POSITIVA",
    ordem: 30,
  },
  // Pergunta 31 - Apoio de Colegas
  {
    id: 31,
    dimensao: "apoioColegas",
    texto: "Os colegas estão disponíveis para escutar os meus problemas de trabalho",
    polaridade: "POSITIVA",
    ordem: 31,
  },
  // Pergunta 32 - Mudanças
  {
    id: 32,
    dimensao: "mudancas",
    texto: "Quando há mudanças, faço o meu trabalho com o mesmo carinho",
    polaridade: "POSITIVA",
    ordem: 32,
  },
  // Pergunta 33 - Apoio Gerencial
  {
    id: 33,
    dimensao: "apoioGerencial",
    texto: "Tenho suportado trabalhos emocionalmente exigentes",
    polaridade: "POSITIVA",
    ordem: 33,
  },
  // Pergunta 34 - Relacionamentos
  {
    id: 34,
    dimensao: "relacionamentos",
    texto: "As relações no trabalho são tensas",
    polaridade: "NEGATIVA",
    ordem: 34,
  },
  // Pergunta 35 - Apoio Gerencial
  {
    id: 35,
    dimensao: "apoioGerencial",
    texto: "Meu chefe me incentiva no trabalho",
    polaridade: "POSITIVA",
    ordem: 35,
  },
];

// Escala Likert
export const escalaLikert = [
  { valor: 0, label: "Nunca", emoji: "😌", cor: "emerald" },
  { valor: 1, label: "Raramente", emoji: "🙂", cor: "green" },
  { valor: 2, label: "Às vezes", emoji: "😐", cor: "yellow" },
  { valor: 3, label: "Frequentemente", emoji: "😟", cor: "orange" },
  { valor: 4, label: "Sempre", emoji: "😰", cor: "red" },
];

// Validar total de perguntas
if (perguntas.length !== 35) {
  throw new Error(`Erro: Esperadas 35 perguntas, encontradas ${perguntas.length}`);
}

// Agrupar perguntas por dimensão
export function getPerguntasPorDimensao(codigoDimensao: string): Pergunta[] {
  return perguntas
    .filter((p) => p.dimensao === codigoDimensao)
    .sort((a, b) => a.ordem - b.ordem);
}

// Obter dimensão por código
export function getDimensao(codigo: string): Dimensao | undefined {
  return dimensoes.find((d) => d.codigo === codigo);
}

// Obter progresso (percentual de perguntas respondidas)
export function calcularProgresso(respostas: Record<number, number>): number {
  const totalRespondidas = Object.keys(respostas).length;
  return Math.round((totalRespondidas / perguntas.length) * 100);
}

// Obter pergunta por ID
export function getPergunta(id: number): Pergunta | undefined {
  return perguntas.find((p) => p.id === id);
}
