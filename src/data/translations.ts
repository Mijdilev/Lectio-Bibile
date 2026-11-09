export interface TranslationMeta {
  id: string; // 'kjv' | 'web' | 'synodal' | 'segond'
  name: string; // 'King James Version'
  shortName: string; // 'KJV'
  pillCode: string; // 'ENG', 'RUS', 'FR'
  language: string; // 'English', 'Russian', 'Français'
  usfmCode: string; // 'eng-kjv', 'engwebp', etc.
  psalmSystem: 'masoretic' | 'septuagint';
}

export const TRANSLATIONS: TranslationMeta[] = [
  {
    id: 'kjv',
    name: 'King James Version',
    shortName: 'KJV',
    pillCode: 'ENG',
    language: 'English',
    usfmCode: 'eng-kjv',
    psalmSystem: 'masoretic'
  },
  {
    id: 'web',
    name: 'World English Bible',
    shortName: 'WEB',
    pillCode: 'ENG',
    language: 'English',
    usfmCode: 'engwebp',
    psalmSystem: 'masoretic'
  },
  {
    id: 'segond',
    name: 'Louis Segond 1910',
    shortName: 'LSG',
    pillCode: 'FR',
    language: 'Français',
    usfmCode: 'fra-lsg',
    psalmSystem: 'masoretic'
  },
  {
    id: 'synodal',
    name: 'Синодальный перевод',
    shortName: 'SYN',
    pillCode: 'RUS',
    language: 'Русский',
    usfmCode: 'rus-syn',
    psalmSystem: 'septuagint'
  }
];

export function getTranslation(id: string): TranslationMeta {
  const found = TRANSLATIONS.find(t => t.id === id.toLowerCase());
  return found || TRANSLATIONS[0];
}
