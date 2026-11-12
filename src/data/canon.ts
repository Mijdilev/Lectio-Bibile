export interface BookMeta {
  id: string; // 3-letter USFM code (e.g. "JHN", "PSA")
  slug: string; // url friendly identifier (e.g. "john", "psalms")
  name: string; // English
  nameFr: string; // French
  nameRu: string; // Russian
  short: string; // Short code for pill (e.g. "J", "Ps", "Gen")
  testament: 'OT' | 'NT';
  chapters: number;
}

export const CANON: BookMeta[] = [
  // Old Testament (39 books)
  { id: 'GEN', slug: 'genesis', name: 'Genesis', nameFr: 'Genèse', nameRu: 'Бытие', short: 'Gen', testament: 'OT', chapters: 50 },
  { id: 'EXO', slug: 'exodus', name: 'Exodus', nameFr: 'Exode', nameRu: 'Исход', short: 'Ex', testament: 'OT', chapters: 40 },
  { id: 'LEV', slug: 'leviticus', name: 'Leviticus', nameFr: 'Lévitique', nameRu: 'Левит', short: 'Lev', testament: 'OT', chapters: 27 },
  { id: 'NUM', slug: 'numbers', name: 'Numbers', nameFr: 'Nombres', nameRu: 'Числа', short: 'Num', testament: 'OT', chapters: 36 },
  { id: 'DEU', slug: 'deuteronomy', name: 'Deuteronomy', nameFr: 'Deutéronome', nameRu: 'Второзаконие', short: 'Deut', testament: 'OT', chapters: 34 },
  { id: 'JOS', slug: 'joshua', name: 'Joshua', nameFr: 'Josué', nameRu: 'Иисус Навин', short: 'Josh', testament: 'OT', chapters: 24 },
  { id: 'JDG', slug: 'judges', name: 'Judges', nameFr: 'Juges', nameRu: 'Судьи', short: 'Judg', testament: 'OT', chapters: 21 },
  { id: 'RUT', slug: 'ruth', name: 'Ruth', nameFr: 'Ruth', nameRu: 'Руфь', short: 'Ruth', testament: 'OT', chapters: 4 },
  { id: '1SA', slug: '1samuel', name: '1 Samuel', nameFr: '1 Samuel', nameRu: '1 Царств', short: '1Sam', testament: 'OT', chapters: 31 },
  { id: '2SA', slug: '2samuel', name: '2 Samuel', nameFr: '2 Samuel', nameRu: '2 Царств', short: '2Sam', testament: 'OT', chapters: 24 },
  { id: '1KI', slug: '1kings', name: '1 Kings', nameFr: '1 Rois', nameRu: '3 Царств', short: '1Kgs', testament: 'OT', chapters: 22 },
  { id: '2KI', slug: '2kings', name: '2 Kings', nameFr: '2 Rois', nameRu: '4 Царств', short: '2Kgs', testament: 'OT', chapters: 25 },
  { id: '1CH', slug: '1chronicles', name: '1 Chronicles', nameFr: '1 Chroniques', nameRu: '1 Паралипоменон', short: '1Chr', testament: 'OT', chapters: 29 },
  { id: '2CH', slug: '2chronicles', name: '2 Chronicles', nameFr: '2 Chroniques', nameRu: '2 Паралипоменон', short: '2Chr', testament: 'OT', chapters: 36 },
  { id: 'EZR', slug: 'ezra', name: 'Ezra', nameFr: 'Esdras', nameRu: 'Ездра', short: 'Ezra', testament: 'OT', chapters: 10 },
  { id: 'NEH', slug: 'nehemiah', name: 'Nehemiah', nameFr: 'Néhémie', nameRu: 'Неемия', short: 'Neh', testament: 'OT', chapters: 13 },
  { id: 'EST', slug: 'esther', name: 'Esther', nameFr: 'Esther', nameRu: 'Есфирь', short: 'Esth', testament: 'OT', chapters: 10 },
  { id: 'JOB', slug: 'job', name: 'Job', nameFr: 'Job', nameRu: 'Иов', short: 'Job', testament: 'OT', chapters: 42 },
  { id: 'PSA', slug: 'psalms', name: 'Psalms', nameFr: 'Psaumes', nameRu: 'Псалтирь', short: 'Ps', testament: 'OT', chapters: 150 },
  { id: 'PRO', slug: 'proverbs', name: 'Proverbs', nameFr: 'Proverbes', nameRu: 'Притчи', short: 'Prov', testament: 'OT', chapters: 31 },
  { id: 'ECC', slug: 'ecclesiastes', name: 'Ecclesiastes', nameFr: 'Ecclésiaste', nameRu: 'Екклесиаст', short: 'Eccl', testament: 'OT', chapters: 12 },
  { id: 'SNG', slug: 'songofsolomon', name: 'Song of Solomon', nameFr: 'Cantique', nameRu: 'Песнь песней', short: 'Song', testament: 'OT', chapters: 8 },
  { id: 'ISA', slug: 'isaiah', name: 'Isaiah', nameFr: 'Ésaïe', nameRu: 'Исаия', short: 'Isa', testament: 'OT', chapters: 66 },
  { id: 'JER', slug: 'jeremiah', name: 'Jeremiah', nameFr: 'Jérémie', nameRu: 'Иеремия', short: 'Jer', testament: 'OT', chapters: 52 },
  { id: 'LAM', slug: 'lamentations', name: 'Lamentations', nameFr: 'Lamentations', nameRu: 'Плач Иеремии', short: 'Lam', testament: 'OT', chapters: 5 },
  { id: 'EZK', slug: 'ezekiel', name: 'Ezekiel', nameFr: 'Ézéchiel', nameRu: 'Иезекииль', short: 'Ezek', testament: 'OT', chapters: 48 },
  { id: 'DAN', slug: 'daniel', name: 'Daniel', nameFr: 'Daniel', nameRu: 'Даниил', short: 'Dan', testament: 'OT', chapters: 12 },
  { id: 'HOS', slug: 'hosea', name: 'Hosea', nameFr: 'Osée', nameRu: 'Осия', short: 'Hos', testament: 'OT', chapters: 14 },
  { id: 'JOL', slug: 'joel', name: 'Joel', nameFr: 'Joël', nameRu: 'Иоиль', short: 'Joel', testament: 'OT', chapters: 3 },
  { id: 'AMO', slug: 'amos', name: 'Amos', nameFr: 'Amos', nameRu: 'Амос', short: 'Amos', testament: 'OT', chapters: 9 },
  { id: 'OBA', slug: 'obadiah', name: 'Obadiah', nameFr: 'Abdias', nameRu: 'Авдий', short: 'Obad', testament: 'OT', chapters: 1 },
  { id: 'JON', slug: 'jonah', name: 'Jonah', nameFr: 'Jonas', nameRu: 'Иона', short: 'Jon', testament: 'OT', chapters: 4 },
  { id: 'MIC', slug: 'micah', name: 'Micah', nameFr: 'Michée', nameRu: 'Михей', short: 'Mic', testament: 'OT', chapters: 7 },
  { id: 'NAM', slug: 'nahum', name: 'Nahum', nameFr: 'Nahum', nameRu: 'Наум', short: 'Nah', testament: 'OT', chapters: 3 },
  { id: 'HAB', slug: 'habakkuk', name: 'Habakkuk', nameFr: 'Habacuc', nameRu: 'Аввакум', short: 'Hab', testament: 'OT', chapters: 3 },
  { id: 'ZEP', slug: 'zephaniah', name: 'Zephaniah', nameFr: 'Sophonie', nameRu: 'Софония', short: 'Zeph', testament: 'OT', chapters: 3 },
  { id: 'HAG', slug: 'haggai', name: 'Haggai', nameFr: 'Aggée', nameRu: 'Аггей', short: 'Hag', testament: 'OT', chapters: 2 },
  { id: 'ZEC', slug: 'zechariah', name: 'Zechariah', nameFr: 'Zacharie', nameRu: 'Захария', short: 'Zech', testament: 'OT', chapters: 14 },
  { id: 'MAL', slug: 'malachi', name: 'Malachi', nameFr: 'Malachie', nameRu: 'Малахия', short: 'Mal', testament: 'OT', chapters: 4 },

  // New Testament (27 books)
  { id: 'MAT', slug: 'matthew', name: 'Matthew', nameFr: 'Matthieu', nameRu: 'Матфей', short: 'Mt', testament: 'NT', chapters: 28 },
  { id: 'MRK', slug: 'mark', name: 'Mark', nameFr: 'Marc', nameRu: 'Марк', short: 'Mk', testament: 'NT', chapters: 16 },
  { id: 'LUK', slug: 'luke', name: 'Luke', nameFr: 'Luc', nameRu: 'Лука', short: 'Lk', testament: 'NT', chapters: 24 },
  { id: 'JHN', slug: 'john', name: 'John', nameFr: 'Jean', nameRu: 'Иоанн', short: 'J', testament: 'NT', chapters: 21 },
  { id: 'ACT', slug: 'acts', name: 'Acts', nameFr: 'Actes', nameRu: 'Деяния', short: 'Acts', testament: 'NT', chapters: 28 },
  { id: 'ROM', slug: 'romans', name: 'Romans', nameFr: 'Romains', nameRu: 'Римлянам', short: 'Rom', testament: 'NT', chapters: 16 },
  { id: '1CO', slug: '1corinthians', name: '1 Corinthians', nameFr: '1 Corinthiens', nameRu: '1 Коринфянам', short: '1Cor', testament: 'NT', chapters: 16 },
  { id: '2CO', slug: '2corinthians', name: '2 Corinthians', nameFr: '2 Corinthiens', nameRu: '2 Коринфянам', short: '2Cor', testament: 'NT', chapters: 13 },
  { id: 'GAL', slug: 'galatians', name: 'Galatians', nameFr: 'Galates', nameRu: 'Галатам', short: 'Gal', testament: 'NT', chapters: 6 },
  { id: 'EPH', slug: 'ephesians', name: 'Ephesians', nameFr: 'Éphésiens', nameRu: 'Ефесянам', short: 'Eph', testament: 'NT', chapters: 6 },
  { id: 'PHP', slug: 'philippians', name: 'Philippians', nameFr: 'Philippiens', nameRu: 'Филиппийцам', short: 'Phil', testament: 'NT', chapters: 4 },
  { id: 'COL', slug: 'colossians', name: 'Colossians', nameFr: 'Colossiens', nameRu: 'Колоссянам', short: 'Col', testament: 'NT', chapters: 4 },
  { id: '1TH', slug: '1thessalonians', name: '1 Thessalonians', nameFr: '1 Thessaloniciens', nameRu: '1 Фессалоникийцам', short: '1Thess', testament: 'NT', chapters: 5 },
  { id: '2TH', slug: '2thessalonians', name: '2 Thessalonians', nameFr: '2 Thessaloniciens', nameRu: '2 Фессалоникийцам', short: '2Thess', testament: 'NT', chapters: 3 },
  { id: '1TI', slug: '1timothy', name: '1 Timothy', nameFr: '1 Timothée', nameRu: '1 Тимофею', short: '1Tim', testament: 'NT', chapters: 6 },
  { id: '2TI', slug: '2timothy', name: '2 Timothy', nameFr: '2 Timothée', nameRu: '2 Тимофею', short: '2Tim', testament: 'NT', chapters: 4 },
  { id: 'TIT', slug: 'titus', name: 'Titus', nameFr: 'Tite', nameRu: 'Титу', short: 'Titus', testament: 'NT', chapters: 3 },
  { id: 'PHM', slug: 'philemon', name: 'Philemon', nameFr: 'Philémon', nameRu: 'Филимону', short: 'Phlm', testament: 'NT', chapters: 1 },
  { id: 'HEB', slug: 'hebrews', name: 'Hebrews', nameFr: 'Hébreux', nameRu: 'Евреям', short: 'Heb', testament: 'NT', chapters: 13 },
  { id: 'JAS', slug: 'james', name: 'James', nameFr: 'Jacques', nameRu: 'Иакова', short: 'Jas', testament: 'NT', chapters: 5 },
  { id: '1PE', slug: '1peter', name: '1 Peter', nameFr: '1 Pierre', nameRu: '1 Петра', short: '1Pet', testament: 'NT', chapters: 5 },
  { id: '2PE', slug: '2peter', name: '2 Peter', nameFr: '2 Pierre', nameRu: '2 Петра', short: '2Pet', testament: 'NT', chapters: 3 },
  { id: '1JN', slug: '1john', name: '1 John', nameFr: '1 Jean', nameRu: '1 Иоанна', short: '1Jn', testament: 'NT', chapters: 5 },
  { id: '2JN', slug: '2john', name: '2 John', nameFr: '2 Jean', nameRu: '2 Иоанна', short: '2Jn', testament: 'NT', chapters: 1 },
  { id: '3JN', slug: '3john', name: '3 John', nameFr: '3 Jean', nameRu: '3 Иоанна', short: '3Jn', testament: 'NT', chapters: 1 },
  { id: 'JUD', slug: 'jude', name: 'Jude', nameFr: 'Jude', nameRu: 'Иуды', short: 'Jude', testament: 'NT', chapters: 1 },
  { id: 'REV', slug: 'revelation', name: 'Revelation', nameFr: 'Apocalypse', nameRu: 'Откровение', short: 'Rev', testament: 'NT', chapters: 22 },
];

export function findBookBySlug(slug: string): BookMeta | undefined {
  const s = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return CANON.find(b => b.slug === s || b.id.toLowerCase() === s);
}

export function findBookById(id: string): BookMeta | undefined {
  return CANON.find(b => b.id.toUpperCase() === id.toUpperCase());
}

export function getNextChapter(
  bookSlug: string,
  chapter: number
): { bookSlug: string; chapter: number } | null {
  const norm = bookSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
  const idx = CANON.findIndex(b => b.slug === norm || b.id.toLowerCase() === norm);
  if (idx === -1) return null;
  const current = CANON[idx];
  if (chapter < current.chapters) {
    return { bookSlug: current.slug, chapter: chapter + 1 };
  }
  if (idx < CANON.length - 1) {
    return { bookSlug: CANON[idx + 1].slug, chapter: 1 };
  }
  return null;
}

export function getPrevChapter(
  bookSlug: string,
  chapter: number
): { bookSlug: string; chapter: number } | null {
  const norm = bookSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
  const idx = CANON.findIndex(b => b.slug === norm || b.id.toLowerCase() === norm);
  if (idx === -1) return null;
  if (chapter > 1) {
    return { bookSlug: CANON[idx].slug, chapter: chapter - 1 };
  }
  if (idx > 0) {
    const prev = CANON[idx - 1];
    return { bookSlug: prev.slug, chapter: prev.chapters };
  }
  return null;
}
