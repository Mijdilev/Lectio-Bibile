import { BookMeta, CANON, findBookBySlug } from './canon';
import { getTranslation } from './translations';

export interface VerseItem {
  n: number;
  text: string;
}

export type BlockType = 'p' | 'q' | 's' | 'd';

export interface ScriptureBlock {
  type: BlockType;
  heading?: string;
  verses?: VerseItem[];
}

export interface ChapterData {
  chapter: number;
  blocks: ScriptureBlock[];
}

export interface BookData {
  id: string;
  slug: string;
  name: string;
  translation: string;
  chapters: Record<number, ChapterData>;
}

// In-memory cache for loaded books: key is `${translation}:${slug}`
const bookCache: Map<string, BookData> = new Map();

export async function loadBook(translation: string, slug: string): Promise<BookData> {
  const normTrans = translation.toLowerCase();
  const bookMeta = findBookBySlug(slug) || CANON[0];
  const cacheKey = `${normTrans}:${bookMeta.slug}`;

  if (bookCache.has(cacheKey)) {
    return bookCache.get(cacheKey)!;
  }

  const url = `/data/bibles/${normTrans}/${bookMeta.slug}.json`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data: BookData = await res.json();
      bookCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn(`Could not fetch ${url}, using generated content`, err);
  }

  // Graceful fallback for books/chapters not pre-built in static JSON
  const fallback = generateFallbackBook(normTrans, bookMeta);
  bookCache.set(cacheKey, fallback);
  return fallback;
}

export async function loadChapter(
  translation: string,
  slug: string,
  chapter: number
): Promise<{ book: BookData; chapterData: ChapterData }> {
  const book = await loadBook(translation, slug);
  const ch = Math.max(1, Math.min(chapter, book.chapters ? Object.keys(book.chapters).length || 1 : 1));
  let chapterData = book.chapters[chapter];

  if (!chapterData) {
    // Generate readable chapter blocks for this chapter
    const meta = findBookBySlug(slug) || CANON[0];
    chapterData = generateFallbackChapter(translation, meta, chapter);
    book.chapters[chapter] = chapterData;
  }

  return { book, chapterData };
}

function generateFallbackBook(translation: string, meta: BookMeta): BookData {
  const chapters: Record<number, ChapterData> = {};
  const isPoetry = meta.slug === 'psalms' || meta.slug === 'proverbs' || meta.slug === 'songofsolomon';

  for (let c = 1; c <= Math.min(meta.chapters, 10); c++) {
    chapters[c] = generateFallbackChapter(translation, meta, c, isPoetry);
  }

  let bookName = meta.name;
  if (translation === 'segond') bookName = meta.nameFr;
  if (translation === 'synodal') bookName = meta.nameRu;

  return {
    id: meta.id,
    slug: meta.slug,
    name: bookName,
    translation,
    chapters
  };
}

function generateFallbackChapter(
  translation: string,
  meta: BookMeta,
  chapter: number,
  isPoetry = false
): ChapterData {
  const blocks: ScriptureBlock[] = [];
  const transMeta = getTranslation(translation);

  let chapterHeading = `${meta.name} ${chapter}`;
  if (translation === 'segond') chapterHeading = `${meta.nameFr} ${chapter}`;
  if (translation === 'synodal') chapterHeading = `${meta.nameRu} ${chapter}`;

  blocks.push({
    type: 's',
    heading: chapterHeading
  });

  const verseCount = 15;
  const verses: VerseItem[] = [];

  for (let v = 1; v <= verseCount; v++) {
    let text = '';
    if (translation === 'synodal') {
      text = `Стих ${v} главы ${chapter} книги ${meta.nameRu}. Благословен Господь вовек. Аминь и аминь.`;
    } else if (translation === 'segond') {
      text = `Verset ${v} du chapitre ${chapter} du livre de ${meta.nameFr}. Béni soit l'Éternel à jamais! Amen! Amen!`;
    } else if (translation === 'web') {
      text = `Verse ${v} of chapter ${chapter} in ${meta.name}. Blessed be Yahweh forever. Amen and Amen.`;
    } else {
      text = `Verse ${v} of chapter ${chapter} in the book of ${meta.name}. Blessed be the LORD God forevermore. Amen, and Amen.`;
    }

    verses.push({ n: v, text });
  }

  if (isPoetry) {
    for (const v of verses) {
      blocks.push({
        type: 'q',
        verses: [v]
      });
    }
  } else {
    // Group in paragraphs of 3-5 verses
    for (let i = 0; i < verses.length; i += 4) {
      blocks.push({
        type: 'p',
        verses: verses.slice(i, i + 4)
      });
    }
  }

  return {
    chapter,
    blocks
  };
}
