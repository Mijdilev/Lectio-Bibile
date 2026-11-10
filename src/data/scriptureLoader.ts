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

  let bookData: BookData = {
    id: bookMeta.id,
    slug: bookMeta.slug,
    name: getBookDisplayName(normTrans, bookMeta),
    translation: normTrans,
    chapters: {}
  };

  const url = `/data/bibles/${normTrans}/${bookMeta.slug}.json`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data: BookData = await res.json();
      bookData = data;
    }
  } catch {
    // Bundled JSON may not exist for all 66 books, which is expected
  }

  bookCache.set(cacheKey, bookData);
  return bookData;
}

export async function loadChapter(
  translation: string,
  slug: string,
  chapter: number
): Promise<{ book: BookData; chapterData: ChapterData }> {
  const book = await loadBook(translation, slug);
  const bookMeta = findBookBySlug(slug) || CANON[0];

  // 1. Check in-memory book data
  if (book.chapters && book.chapters[chapter]) {
    return { book, chapterData: book.chapters[chapter] };
  }

  // 2. Check localStorage cached chapter
  const normTrans = translation.toLowerCase();
  const localCacheKey = `lectio_chapter_${normTrans}_${bookMeta.slug}_${chapter}`;
  try {
    const saved = localStorage.getItem(localCacheKey);
    if (saved) {
      const parsed: ChapterData = JSON.parse(saved);
      if (parsed && parsed.blocks && parsed.blocks.length > 0) {
        book.chapters[chapter] = parsed;
        return { book, chapterData: parsed };
      }
    }
  } catch {}

  // 3. Fetch real biblical scripture online
  const fetched = await fetchRealChapter(normTrans, bookMeta, chapter);
  if (fetched) {
    book.chapters[chapter] = fetched;
    return { book, chapterData: fetched };
  }

  // 4. Graceful fallback notice for offline use
  const offlineNotice = generateOfflineNoticeChapter(normTrans, bookMeta, chapter);
  book.chapters[chapter] = offlineNotice;
  return { book, chapterData: offlineNotice };
}

function getBookDisplayName(translation: string, meta: BookMeta): string {
  if (translation === 'segond') return meta.nameFr;
  if (translation === 'synodal') return meta.nameRu;
  return meta.name;
}

async function fetchRealChapter(
  translation: string,
  meta: BookMeta,
  chapter: number
): Promise<ChapterData | null> {
  const normTrans = translation.toLowerCase();
  const isPoetry = meta.slug === 'psalms' || meta.slug === 'proverbs' || meta.slug === 'songofsolomon';
  const localCacheKey = `lectio_chapter_${normTrans}_${meta.slug}_${chapter}`;

  let verses: VerseItem[] = [];

  try {
    if (normTrans === 'segond') {
      // Bolls.life Bible Segond 1910 (FRLSG) using 1-based canon index
      const bookIndex = CANON.findIndex(b => b.slug === meta.slug) + 1;
      if (bookIndex > 0) {
        const res = await fetch(`https://bolls.life/get-chapter/FRLSG/${bookIndex}/${chapter}/`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            verses = list.map((item: any) => ({
              n: Number(item.verse),
              text: String(item.text || '').replace(/<[^>]*>/g, '').trim()
            }));
          }
        }
      }
    } else {
      // bible-api.com for KJV, WEB, and Russian Synodal
      let apiTrans = 'kjv';
      if (normTrans === 'web') apiTrans = 'web';
      if (normTrans === 'synodal') apiTrans = 'synodal';

      // First attempt: direct USFM structured query (e.g. /data/kjv/MRK/4)
      const res = await fetch(`https://bible-api.com/data/${apiTrans}/${meta.id}/${chapter}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.verses) && data.verses.length > 0) {
          verses = data.verses.map((v: any) => ({
            n: Number(v.verse),
            text: String(v.text || '').trim()
          }));
        }
      }

      // Second attempt if USFM query returned nothing: English book name query
      if (verses.length === 0) {
        const fallbackRes = await fetch(
          `https://bible-api.com/${encodeURIComponent(meta.name)}+${chapter}?translation=${apiTrans}`
        );
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          if (Array.isArray(fbData.verses) && fbData.verses.length > 0) {
            verses = fbData.verses.map((v: any) => ({
              n: Number(v.verse),
              text: String(v.text || '').trim()
            }));
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Could not load online scripture for ${meta.name} ${chapter}:`, err);
  }

  if (verses.length > 0) {
    const bookTitle = getBookDisplayName(normTrans, meta);
    const blocks: ScriptureBlock[] = [];

    // Header block
    blocks.push({
      type: 's',
      heading: `${bookTitle} ${chapter}`
    });

    if (isPoetry) {
      for (const v of verses) {
        blocks.push({
          type: 'q',
          verses: [v]
        });
      }
    } else {
      // Prose paragraphs of 3-4 verses for aesthetic reading
      for (let i = 0; i < verses.length; i += 4) {
        blocks.push({
          type: 'p',
          verses: verses.slice(i, i + 4)
        });
      }
    }

    const chapterData: ChapterData = {
      chapter,
      blocks
    };

    // Cache locally in localStorage for instant offline access
    try {
      localStorage.setItem(localCacheKey, JSON.stringify(chapterData));
    } catch {}

    return chapterData;
  }

  return null;
}

function generateOfflineNoticeChapter(
  translation: string,
  meta: BookMeta,
  chapter: number
): ChapterData {
  const bookTitle = getBookDisplayName(translation, meta);

  let message = 'This chapter has not been downloaded yet. Connect to the internet to load and save it locally for offline reading.';
  if (translation === 'segond') {
    message = 'Ce chapitre n’a pas encore été téléchargé. Connectez-vous à Internet pour le charger et l’enregistrer pour une lecture hors-ligne.';
  } else if (translation === 'synodal') {
    message = 'Эта глава еще не загружена. Подключитесь к интернету для загрузки и сохранения для автономного чтения.';
  }

  return {
    chapter,
    blocks: [
      {
        type: 's',
        heading: `${bookTitle} ${chapter}`
      },
      {
        type: 'p',
        verses: [
          {
            n: 1,
            text: message
          }
        ]
      }
    ]
  };
}
