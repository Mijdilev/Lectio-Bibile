/**
 * Psalms Correspondence Table
 * Maps Psalm and verse numbering between Masoretic (KJV, WEB, Louis Segond)
 * and Septuagint/Synodal (Russian Synodal) traditions.
 */

// Psalms where the Hebrew / Synodal tradition counts the title/superscription as verse 1,
// shifting verse n in KJV to verse n + 1 in Synodal.
const PSALMS_WITH_TITLE_AS_V1 = new Set([
  3, 4, 5, 6, 7, 8, 9, 12, 13, 18, 19, 20, 21, 22, 30, 31, 34, 36, 38, 39, 40,
  41, 42, 44, 45, 46, 47, 48, 49, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
  62, 63, 64, 65, 66, 67, 68, 69, 70, 75, 76, 77, 80, 81, 83, 84, 85, 88, 89,
  92, 102, 108, 140, 142
]);

// Translation system classification
export type PsalmSystem = 'masoretic' | 'septuagint';

export function getPsalmSystem(translation: string): PsalmSystem {
  const t = translation.toLowerCase();
  if (t === 'synodal' || t === 'rus' || t === 'syn') {
    return 'septuagint';
  }
  return 'masoretic'; // KJV, WEB, Segond
}

/**
 * Convert Masoretic (Hebrew/English) Psalm & Verse coordinates to Septuagint (Synodal)
 */
export function masoreticToSeptuagint(psalm: number, verse: number): { psalm: number; verse: number } {
  const hasTitleOffset = PSALMS_WITH_TITLE_AS_V1.has(psalm);
  const vOffset = hasTitleOffset ? 1 : 0;

  if (psalm >= 1 && psalm <= 8) {
    return { psalm, verse: verse + vOffset };
  }

  if (psalm === 9) {
    return { psalm: 9, verse: verse + vOffset };
  }

  if (psalm === 10) {
    // Hebrew 10 is the second half of Septuagint 9 (approx 21 verses in Hebrew 9)
    return { psalm: 9, verse: verse + 21 };
  }

  if (psalm >= 11 && psalm <= 113) {
    return { psalm: psalm - 1, verse: verse + vOffset };
  }

  if (psalm === 114) {
    return { psalm: 113, verse };
  }

  if (psalm === 115) {
    // Hebrew 115 continues Septuagint 113 (after ~8 verses of Hebrew 114)
    return { psalm: 113, verse: verse + 8 };
  }

  if (psalm === 116) {
    if (verse <= 9) {
      return { psalm: 114, verse };
    } else {
      return { psalm: 115, verse: verse - 9 };
    }
  }

  if (psalm >= 117 && psalm <= 146) {
    return { psalm: psalm - 1, verse: verse + vOffset };
  }

  if (psalm === 147) {
    if (verse <= 11) {
      return { psalm: 146, verse };
    } else {
      return { psalm: 147, verse: verse - 11 };
    }
  }

  if (psalm >= 148 && psalm <= 150) {
    return { psalm, verse };
  }

  return { psalm, verse };
}

/**
 * Convert Septuagint (Synodal) Psalm & Verse coordinates to Masoretic (KJV/WEB/Segond)
 */
export function septuagintToMasoretic(psalm: number, verse: number): { psalm: number; verse: number } {
  if (psalm >= 1 && psalm <= 8) {
    const hasTitle = PSALMS_WITH_TITLE_AS_V1.has(psalm);
    const vOffset = hasTitle ? 1 : 0;
    return { psalm, verse: Math.max(1, verse - vOffset) };
  }

  if (psalm === 9) {
    if (verse > 21) {
      return { psalm: 10, verse: verse - 21 };
    } else {
      const hasTitle = PSALMS_WITH_TITLE_AS_V1.has(9);
      const vOffset = hasTitle ? 1 : 0;
      return { psalm: 9, verse: Math.max(1, verse - vOffset) };
    }
  }

  if (psalm >= 10 && psalm <= 112) {
    const hebrewPsalm = psalm + 1;
    const hasTitle = PSALMS_WITH_TITLE_AS_V1.has(hebrewPsalm);
    const vOffset = hasTitle ? 1 : 0;
    return { psalm: hebrewPsalm, verse: Math.max(1, verse - vOffset) };
  }

  if (psalm === 113) {
    if (verse > 8) {
      return { psalm: 115, verse: verse - 8 };
    } else {
      return { psalm: 114, verse };
    }
  }

  if (psalm === 114) {
    return { psalm: 116, verse };
  }

  if (psalm === 115) {
    return { psalm: 116, verse: verse + 9 };
  }

  if (psalm >= 116 && psalm <= 145) {
    const hebrewPsalm = psalm + 1;
    const hasTitle = PSALMS_WITH_TITLE_AS_V1.has(hebrewPsalm);
    const vOffset = hasTitle ? 1 : 0;
    return { psalm: hebrewPsalm, verse: Math.max(1, verse - vOffset) };
  }

  if (psalm === 146) {
    return { psalm: 147, verse };
  }

  if (psalm === 147) {
    return { psalm: 147, verse: verse + 11 };
  }

  if (psalm >= 148 && psalm <= 150) {
    return { psalm, verse };
  }

  return { psalm, verse };
}

/**
 * Universal Psalm mapping between any two translations
 */
export function mapPsalmReference(
  sourceTranslation: string,
  targetTranslation: string,
  psalm: number,
  verse: number = 1
): { psalm: number; verse: number } {
  const srcSys = getPsalmSystem(sourceTranslation);
  const tgtSys = getPsalmSystem(targetTranslation);

  if (srcSys === tgtSys) {
    return { psalm, verse };
  }

  if (srcSys === 'masoretic' && tgtSys === 'septuagint') {
    return masoreticToSeptuagint(psalm, verse);
  }

  if (srcSys === 'septuagint' && tgtSys === 'masoretic') {
    return septuagintToMasoretic(psalm, verse);
  }

  return { psalm, verse };
}
