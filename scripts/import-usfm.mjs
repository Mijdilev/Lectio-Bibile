/**
 * USFM to JSON importer
 * Parses USFM files into per-book JSON files conforming to Lectio's scripture schema.
 * Keeps paragraphs (\p), poetry lines (\q), section headings (\s), and superscriptions (\d).
 * Strips footnotes (\f...\f*) and cross-references (\x...\x*).
 * Outputs { n, text } for verses.
 */

import fs from 'node:fs';
import path from 'node:path';

export function parseUSFM(usfmContent, bookId, slug, bookName, translationId) {
  const lines = usfmContent.split(/\r?\n/);
  const chapters = {};
  let currentChapterNum = 0;
  let currentBlocks = [];
  let currentBlock = null;

  function flushBlock() {
    if (currentBlock) {
      if (currentBlock.verses && currentBlock.verses.length > 0) {
        currentBlocks.push(currentBlock);
      } else if (currentBlock.heading) {
        currentBlocks.push(currentBlock);
      }
      currentBlock = null;
    }
  }

  function flushChapter() {
    flushBlock();
    if (currentChapterNum > 0) {
      chapters[currentChapterNum] = {
        chapter: currentChapterNum,
        blocks: currentBlocks,
      };
      currentBlocks = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Clean footnotes \f ...\f* and \x ...\x*
    const cleanedLine = line
      .replace(/\\f\s+.*?\\f\*/g, '')
      .replace(/\\x\s+.*?\\x\*/g, '')
      .replace(/\\add\s+(.*?)\\add\*/g, '$1')
      .replace(/\\wj\s+(.*?)\\wj\*/g, '$1')
      .replace(/\\nd\s+(.*?)\\nd\*/g, '$1')
      .trim();

    // Chapter \c 1
    const chapterMatch = cleanedLine.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      flushChapter();
      currentChapterNum = parseInt(chapterMatch[1], 10);
      continue;
    }

    if (currentChapterNum === 0) continue;

    // Section heading \s or \s1
    const headingMatch = cleanedLine.match(/^\\s\d?\s*(.*)$/);
    if (headingMatch) {
      flushBlock();
      currentBlocks.push({
        type: 's',
        heading: headingMatch[1].trim(),
      });
      continue;
    }

    // Descriptive title / superscription \d
    const descMatch = cleanedLine.match(/^\\d\s*(.*)$/);
    if (descMatch) {
      flushBlock();
      currentBlocks.push({
        type: 'd',
        heading: descMatch[1].trim(),
      });
      continue;
    }

    // Paragraph \p or poetry line \q / \q1 / \q2
    const pMatch = cleanedLine.match(/^\\p(?:\s+(.*))?$/);
    const qMatch = cleanedLine.match(/^\\q\d?(?:\s+(.*))?$/);

    if (pMatch || qMatch) {
      flushBlock();
      const type = qMatch ? 'q' : 'p';
      currentBlock = {
        type,
        verses: [],
      };
      const rest = (pMatch ? pMatch[1] : qMatch[1]) || '';
      if (rest) {
        parseVersesIntoBlock(rest, currentBlock);
      }
      continue;
    }

    // Line with verse \v 1 text
    if (cleanedLine.startsWith('\\v ')) {
      if (!currentBlock) {
        currentBlock = { type: 'p', verses: [] };
      }
      parseVersesIntoBlock(cleanedLine, currentBlock);
      continue;
    }

    // Continuation of verse text
    if (currentBlock && currentBlock.verses && currentBlock.verses.length > 0) {
      const lastVerse = currentBlock.verses[currentBlock.verses.length - 1];
      lastVerse.text += ' ' + cleanedLine;
    }
  }

  flushChapter();

  return {
    id: bookId,
    slug,
    name: bookName,
    translation: translationId,
    chapters,
  };
}

function parseVersesIntoBlock(text, block) {
  const parts = text.split(/\\v\s+(\d+)\s*/);
  for (let i = 1; i < parts.length; i += 2) {
    const verseNum = parseInt(parts[i], 10);
    const verseText = (parts[i + 1] || '').trim();
    if (verseText) {
      block.verses.push({
        n: verseNum,
        text: verseText,
      });
    }
  }
}

// CLI usage if run directly
if (process.argv[1]?.endsWith('import-usfm.mjs')) {
  console.log('Lectio USFM Importer initialized.');
}
