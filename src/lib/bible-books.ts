export interface BibleBook {
  id: number;       // bolls.life book ID (1–66)
  name: string;     // Portuguese name
  chapters: number;
  testament: "AT" | "NT";
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Antigo Testamento
  { id: 1,  name: "Gênesis",           chapters: 50,  testament: "AT" },
  { id: 2,  name: "Êxodo",             chapters: 40,  testament: "AT" },
  { id: 3,  name: "Levítico",          chapters: 27,  testament: "AT" },
  { id: 4,  name: "Números",           chapters: 36,  testament: "AT" },
  { id: 5,  name: "Deuteronômio",      chapters: 34,  testament: "AT" },
  { id: 6,  name: "Josué",             chapters: 24,  testament: "AT" },
  { id: 7,  name: "Juízes",            chapters: 21,  testament: "AT" },
  { id: 8,  name: "Rute",              chapters: 4,   testament: "AT" },
  { id: 9,  name: "1 Samuel",          chapters: 31,  testament: "AT" },
  { id: 10, name: "2 Samuel",          chapters: 24,  testament: "AT" },
  { id: 11, name: "1 Reis",            chapters: 22,  testament: "AT" },
  { id: 12, name: "2 Reis",            chapters: 25,  testament: "AT" },
  { id: 13, name: "1 Crônicas",        chapters: 29,  testament: "AT" },
  { id: 14, name: "2 Crônicas",        chapters: 36,  testament: "AT" },
  { id: 15, name: "Esdras",            chapters: 10,  testament: "AT" },
  { id: 16, name: "Neemias",           chapters: 13,  testament: "AT" },
  { id: 17, name: "Ester",             chapters: 10,  testament: "AT" },
  { id: 18, name: "Jó",               chapters: 42,  testament: "AT" },
  { id: 19, name: "Salmos",            chapters: 150, testament: "AT" },
  { id: 20, name: "Provérbios",        chapters: 31,  testament: "AT" },
  { id: 21, name: "Eclesiastes",       chapters: 12,  testament: "AT" },
  { id: 22, name: "Cânticos",          chapters: 8,   testament: "AT" },
  { id: 23, name: "Isaías",            chapters: 66,  testament: "AT" },
  { id: 24, name: "Jeremias",          chapters: 52,  testament: "AT" },
  { id: 25, name: "Lamentações",       chapters: 5,   testament: "AT" },
  { id: 26, name: "Ezequiel",          chapters: 48,  testament: "AT" },
  { id: 27, name: "Daniel",            chapters: 12,  testament: "AT" },
  { id: 28, name: "Oseias",            chapters: 14,  testament: "AT" },
  { id: 29, name: "Joel",              chapters: 3,   testament: "AT" },
  { id: 30, name: "Amós",             chapters: 9,   testament: "AT" },
  { id: 31, name: "Obadias",           chapters: 1,   testament: "AT" },
  { id: 32, name: "Jonas",             chapters: 4,   testament: "AT" },
  { id: 33, name: "Miqueias",          chapters: 7,   testament: "AT" },
  { id: 34, name: "Naum",             chapters: 3,   testament: "AT" },
  { id: 35, name: "Habacuque",         chapters: 3,   testament: "AT" },
  { id: 36, name: "Sofonias",          chapters: 3,   testament: "AT" },
  { id: 37, name: "Ageu",             chapters: 2,   testament: "AT" },
  { id: 38, name: "Zacarias",          chapters: 14,  testament: "AT" },
  { id: 39, name: "Malaquias",         chapters: 4,   testament: "AT" },
  // Novo Testamento
  { id: 40, name: "Mateus",            chapters: 28,  testament: "NT" },
  { id: 41, name: "Marcos",            chapters: 16,  testament: "NT" },
  { id: 42, name: "Lucas",             chapters: 24,  testament: "NT" },
  { id: 43, name: "João",             chapters: 21,  testament: "NT" },
  { id: 44, name: "Atos",             chapters: 28,  testament: "NT" },
  { id: 45, name: "Romanos",           chapters: 16,  testament: "NT" },
  { id: 46, name: "1 Coríntios",       chapters: 16,  testament: "NT" },
  { id: 47, name: "2 Coríntios",       chapters: 13,  testament: "NT" },
  { id: 48, name: "Gálatas",           chapters: 6,   testament: "NT" },
  { id: 49, name: "Efésios",           chapters: 6,   testament: "NT" },
  { id: 50, name: "Filipenses",        chapters: 4,   testament: "NT" },
  { id: 51, name: "Colossenses",       chapters: 4,   testament: "NT" },
  { id: 52, name: "1 Tessalonicenses", chapters: 5,   testament: "NT" },
  { id: 53, name: "2 Tessalonicenses", chapters: 3,   testament: "NT" },
  { id: 54, name: "1 Timóteo",         chapters: 6,   testament: "NT" },
  { id: 55, name: "2 Timóteo",         chapters: 4,   testament: "NT" },
  { id: 56, name: "Tito",             chapters: 3,   testament: "NT" },
  { id: 57, name: "Filemom",           chapters: 1,   testament: "NT" },
  { id: 58, name: "Hebreus",           chapters: 13,  testament: "NT" },
  { id: 59, name: "Tiago",            chapters: 5,   testament: "NT" },
  { id: 60, name: "1 Pedro",           chapters: 5,   testament: "NT" },
  { id: 61, name: "2 Pedro",           chapters: 3,   testament: "NT" },
  { id: 62, name: "1 João",           chapters: 5,   testament: "NT" },
  { id: 63, name: "2 João",           chapters: 1,   testament: "NT" },
  { id: 64, name: "3 João",           chapters: 1,   testament: "NT" },
  { id: 65, name: "Judas",            chapters: 1,   testament: "NT" },
  { id: 66, name: "Apocalipse",        chapters: 22,  testament: "NT" },
];

export function findBookByName(name: string): BibleBook | undefined {
  return BIBLE_BOOKS.find((b) => b.name === name);
}

export function findBookById(id: number): BibleBook | undefined {
  return BIBLE_BOOKS.find((b) => b.id === id);
}

export function toApiBookName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function readerUrl(
  bookName: string,
  chapter: number,
  translation = "ARC"
): string {
  const book = findBookByName(bookName);
  if (!book) return "/app/reader";
  return `/app/reader?book=${book.id}&chapter=${chapter}&tr=${translation}`;
}
