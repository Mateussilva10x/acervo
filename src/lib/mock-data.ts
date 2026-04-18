export interface BibleRef {
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  themes: string[];
  bibleRefs: BibleRef[];
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export const THEMES = [
  "Adoração",
  "Santificação",
  "Comunhão",
  "Células",
  "Fé",
  "Família",
  "Liderança",
  "Ansiedade",
  "Missões",
  "Escatologia",
  "Mordomia",
  "Retiro Homens",
  "Conferência 2026",
  "Aconselhamento",
];

export const MOCK_NOTES: Note[] = [
  {
    id: "1",
    title: "O Homem Segundo o Coração de Deus",
    content:
      "Retiro de homens: A vida de Davi. 1 Samuel 13:14. Características: coração adorador, coragem, arrependimento genuíno, liderança do lar. Workshop prático sobre como ser o sacerdote da família moderna.",
    themes: ["Retiro Homens", "Liderança"],
    bibleRefs: [{ book: "1 Samuel", chapter: 13, verseStart: 14 }],
    location: "Retiro de Homens - Águas de Lindóia",
    createdAt: "2026-04-09",
    updatedAt: "2026-04-09",
  },
  {
    id: "2",
    title: "Adoração em Espírito e Verdade",
    content:
      "Sermão profundo sobre João 4:23-24. Adoração não é estilo musical, é postura do coração. Três dimensões: adoração pessoal, comunitária e escatológica. Salmos 95:1-7 como modelo de liturgia.",
    themes: ["Adoração"],
    bibleRefs: [
      { book: "João", chapter: 4, verseStart: 23, verseEnd: 24 },
      { book: "Salmos", chapter: 95, verseStart: 1, verseEnd: 7 },
    ],
    createdAt: "2026-04-09",
    updatedAt: "2026-04-09",
  },
  {
    id: "3",
    title: "O Processo da Santificação",
    content:
      "Série em 3 partes sobre santificação progressiva. Parte 1: Justificação (posicional). Romanos 6:1-14. Não somos mais escravos do pecado. A santificação como cooperação com o Espírito Santo.",
    themes: ["Santificação"],
    bibleRefs: [{ book: "Romanos", chapter: 6, verseStart: 1, verseEnd: 14 }],
    createdAt: "2026-04-09",
    updatedAt: "2026-04-09",
  },
  {
    id: "4",
    title: "Ide Por Todo o Mundo",
    content:
      "A Grande Comissão não é opcional. Mateus 28:19-20. A Grande Comissão não é opcional. Missões começa na vizinhança. Estratégias práticas para evangelismo local e apoio a missionários.",
    themes: ["Missões"],
    bibleRefs: [
      { book: "Mateus", chapter: 28, verseStart: 19, verseEnd: 20 },
    ],
    createdAt: "2026-04-07",
    updatedAt: "2026-04-07",
  },
  {
    id: "5",
    title: "Sinais dos Tempos",
    content:
      "Estudo escatológico equilibrado. Mateus 24, 2 Tessalonicenses 2. Não se apoiar em sensacionalismo, mas sim em motivação para o evangelismo. Esperança que purifica.",
    themes: ["Escatologia"],
    bibleRefs: [
      { book: "Mateus", chapter: 24 },
      { book: "2 Tessalonicenses", chapter: 2 },
    ],
    createdAt: "2026-04-05",
    updatedAt: "2026-04-05",
  },
  {
    id: "6",
    title: "A Família Conforme o Projeto de Deus",
    content:
      "Gênesis 2:18-25. O casamento como aliança, não contrato. Papéis complementares. Criação de filhos com disciplina e ternura. Efésios 5:22-33 como modelo.",
    themes: ["Família"],
    bibleRefs: [
      { book: "Gênesis", chapter: 2, verseStart: 18, verseEnd: 25 },
      { book: "Efésios", chapter: 5, verseStart: 22, verseEnd: 33 },
    ],
    createdAt: "2026-04-02",
    updatedAt: "2026-04-02",
  },
  {
    id: "7",
    title: "Vencendo a Ansiedade pela Fé",
    content:
      "Filipenses 4:6-7 - A paz que excede todo entendimento. Diferença entre preocupação saudável e ansiedade patológica. Práticas espirituais: oração, ação de graças, meditação nas promessas.",
    themes: ["Ansiedade", "Fé"],
    bibleRefs: [
      { book: "Filipenses", chapter: 4, verseStart: 6, verseEnd: 7 },
    ],
    createdAt: "2026-03-28",
    updatedAt: "2026-03-28",
  },
  {
    id: "8",
    title: "Células: A Igreja em Forma de Rede",
    content:
      "Atos 2:42-47. A igreja primitiva se reunia de casa em casa. Células não são programa, são estilo de vida. Liderança de célula: facilitador, não pastor. Multiplicação orgânica.",
    themes: ["Células", "Comunhão"],
    bibleRefs: [{ book: "Atos", chapter: 2, verseStart: 42, verseEnd: 47 }],
    createdAt: "2026-03-25",
    updatedAt: "2026-03-25",
  },
  {
    id: "9",
    title: "Mordomia Cristã e Finanças",
    content:
      "2 Coríntios 9:6-8. Deus ama o doador alegre. Mordomia não é apenas dízimo, é gestão de tempo, talentos e recursos. Princípios bíblicos para vida financeira.",
    themes: ["Mordomia"],
    bibleRefs: [
      { book: "2 Coríntios", chapter: 9, verseStart: 6, verseEnd: 8 },
    ],
    createdAt: "2026-03-20",
    updatedAt: "2026-03-20",
  },
  {
    id: "10",
    title: "Liderança Serva",
    content:
      "Marcos 10:42-45. Jesus redefiniu liderança. Líderes do mundo dominam, líderes do Reino servem. Características: integridade, visão, serviço, capacitação de outros. Exemplos: Neemias, Paulo.",
    themes: ["Liderança"],
    bibleRefs: [
      { book: "Marcos", chapter: 10, verseStart: 42, verseEnd: 45 },
    ],
    createdAt: "2026-03-15",
    updatedAt: "2026-03-15",
  },
  {
    id: "11",
    title: "O Espírito Santo como Consolador",
    content:
      "João 14:16-17, 26. Paráclito: aquele que é chamado ao lado. Funções do Espírito: consolar, ensinar, guiar, convencer. Como abrir espaço para a obra do Espírito na vida prática.",
    themes: ["Adoração", "Santificação"],
    bibleRefs: [
      { book: "João", chapter: 14, verseStart: 16, verseEnd: 17 },
    ],
    createdAt: "2026-03-10",
    updatedAt: "2026-03-10",
  },
  {
    id: "12",
    title: "Comunhão dos Santos",
    content:
      "1 João 1:3-7. Koinonia - participação, partilha, comunhão. Comunhão vertical (com Deus) gera comunhão horizontal (uns com outros). Perigos do individualismo cristão.",
    themes: ["Comunhão", "Células"],
    bibleRefs: [{ book: "1 João", chapter: 1, verseStart: 3, verseEnd: 7 }],
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  {
    id: "13",
    title: "Fé que Move Montanhas",
    content:
      "Hebreus 11 - o hall da fé. Fé não é sentimento, é obediência à Palavra de Deus. Exemplos: Abraão, Moisés, Rahab. Fé como dom e como exercício. Crescimento na fé.",
    themes: ["Fé"],
    bibleRefs: [
      { book: "Hebreus", chapter: 11 },
      { book: "Mateus", chapter: 17, verseStart: 20 },
    ],
    createdAt: "2026-02-28",
    updatedAt: "2026-02-28",
  },
  {
    id: "14",
    title: "Aconselhamento Bíblico: Bases",
    content:
      "Diferenças entre aconselhamento cristão e psicologia secular. Papel do conselheiro pastoral. Escuta ativa. Quando encaminhar para profissional de saúde. Casos de depressão e crise espiritual.",
    themes: ["Aconselhamento"],
    bibleRefs: [{ book: "Gálatas", chapter: 6, verseStart: 1, verseEnd: 5 }],
    location: "Conferência Pastoral",
    createdAt: "2026-02-20",
    updatedAt: "2026-02-20",
  },
  {
    id: "15",
    title: "Conferência 2026: Visão da Igreja",
    content:
      "Habacuque 2:2-3. Escreva a visão. A importância de documentar e comunicar a visão da igreja. Planejamento estratégico à luz do Reino. Métricas espirituais x numéricas.",
    themes: ["Conferência 2026", "Liderança"],
    bibleRefs: [
      { book: "Habacuque", chapter: 2, verseStart: 2, verseEnd: 3 },
    ],
    location: "Conferência de Pastores 2026",
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
  {
    id: "16",
    title: "Oração Intercessória",
    content:
      "1 Timóteo 2:1-4. Tipos de oração: súplica, intercessão, ação de graças. Como organizar um grupo de intercessão. A oração como guerra espiritual. Daniel como modelo.",
    themes: ["Adoração", "Comunhão"],
    bibleRefs: [
      { book: "1 Timóteo", chapter: 2, verseStart: 1, verseEnd: 4 },
    ],
    createdAt: "2026-02-10",
    updatedAt: "2026-02-10",
  },
  {
    id: "17",
    title: "Jovens: Identidade e Propósito",
    content:
      "Jeremias 1:4-10. Antes de te formar no ventre, eu te conhecia. A crise de identidade na geração Z. Como a igreja pode ser âncora. Discipulado de jovens através das redes sociais.",
    themes: ["Família", "Aconselhamento"],
    bibleRefs: [
      { book: "Jeremias", chapter: 1, verseStart: 4, verseEnd: 10 },
    ],
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
  },
  {
    id: "18",
    title: "O Sermão do Monte: Bem-aventuranças",
    content:
      "Mateus 5:1-12. Os valores invertidos do Reino. Pobres de espírito, mansos, misericordiosos. Como as bem-aventuranças descrevem o caráter de Jesus e o caráter que devemos ter.",
    themes: ["Santificação", "Fé"],
    bibleRefs: [
      { book: "Mateus", chapter: 5, verseStart: 1, verseEnd: 12 },
    ],
    createdAt: "2026-01-28",
    updatedAt: "2026-01-28",
  },
  {
    id: "19",
    title: "Dons Espirituais e Ministério",
    content:
      "1 Coríntios 12:4-11. Variedade de dons, mesmo Espírito. Cada membro tem um dom para o bem comum. Perigos: comparação, subestimação, orgulho. Descoberta e uso dos dons.",
    themes: ["Células", "Liderança"],
    bibleRefs: [
      { book: "1 Coríntios", chapter: 12, verseStart: 4, verseEnd: 11 },
    ],
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
  },
  {
    id: "20",
    title: "Graça: Mais que um Tema Teológico",
    content:
      "Efésios 2:8-9. Graça não é licença para pecar, é poder para não pecar. A graça que salva também transforma. Como pregar graça sem cair no antinomismo ou no legalismo.",
    themes: ["Santificação", "Fé"],
    bibleRefs: [
      { book: "Efésios", chapter: 2, verseStart: 8, verseEnd: 9 },
    ],
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
  {
    id: "21",
    title: "A Segunda Vinda de Cristo",
    content:
      "Apocalipse 1:7. Toda olho o verá. Implicações práticas da escatologia: vigilância, evangelismo, perseverança, esperança. Diferenças entre posições teológicas — ênfase no ponto de consenso.",
    themes: ["Escatologia"],
    bibleRefs: [{ book: "Apocalipse", chapter: 1, verseStart: 7 }],
    createdAt: "2026-01-10",
    updatedAt: "2026-01-10",
  },
  {
    id: "22",
    title: "Conflitos no Casamento",
    content:
      "Efésios 4:26-27. Não deixeis o sol se pôr sobre a vossa ira. Conflito não é necessariamente pecado, a forma de resolver pode ser. Ferramentas de comunicação não violenta aplicadas ao casamento cristão.",
    themes: ["Família", "Aconselhamento"],
    bibleRefs: [
      { book: "Efésios", chapter: 4, verseStart: 26, verseEnd: 27 },
    ],
    createdAt: "2026-01-05",
    updatedAt: "2026-01-05",
  },
  {
    id: "23",
    title: "Perseverança na Tribulação",
    content:
      "Romanos 5:3-5. A tribulação produz perseverança. Sofrimento não é sinal de abandono divino. A teologia da cruz versus teologia da prosperidade. Casos bíblicos: Jó, Paulo, Pedro.",
    themes: ["Fé", "Ansiedade"],
    bibleRefs: [
      { book: "Romanos", chapter: 5, verseStart: 3, verseEnd: 5 },
    ],
    createdAt: "2025-12-20",
    updatedAt: "2025-12-20",
  },
  {
    id: "24",
    title: "Conferência 2026: Culto e Liturgia",
    content:
      "Êxodo 25:8-9. O modelo de Deus para o culto. Liturgia como narração da história da redenção. Como conduzir um culto que ensina e encontra Deus. Elementos essenciais.",
    themes: ["Conferência 2026", "Adoração"],
    bibleRefs: [{ book: "Êxodo", chapter: 25, verseStart: 8, verseEnd: 9 }],
    location: "Conferência de Pastores 2026",
    createdAt: "2025-12-15",
    updatedAt: "2025-12-15",
  },
  {
    id: "25",
    title: "Páscoa: O Cordeiro que Tira o Pecado",
    content:
      "João 1:29. Eis o Cordeiro de Deus. A Páscoa judaica como tipo e prefiguração. O cumprimento em Cristo. Significado da Ceia do Senhor. Como celebrar a Páscoa com a família.",
    themes: ["Adoração", "Santificação"],
    bibleRefs: [
      { book: "João", chapter: 1, verseStart: 29 },
      { book: "1 Coríntios", chapter: 11, verseStart: 23, verseEnd: 26 },
    ],
    createdAt: "2025-12-10",
    updatedAt: "2025-12-10",
  },
];

export function getThemeCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const note of MOCK_NOTES) {
    for (const theme of note.themes) {
      counts[theme] = (counts[theme] || 0) + 1;
    }
  }
  return counts;
}

export function getNotesByTheme(theme: string): Note[] {
  return MOCK_NOTES.filter((n) => n.themes.includes(theme));
}

export function searchNotes(query: string): Note[] {
  const q = query.toLowerCase();
  return MOCK_NOTES.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.themes.some((t) => t.toLowerCase().includes(q)) ||
      n.bibleRefs.some((r) => r.book.toLowerCase().includes(q))
  );
}
