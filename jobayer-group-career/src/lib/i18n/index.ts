type TranslationMap = Record<string, string>;

let enTranslations: TranslationMap = {};
let bnTranslations: TranslationMap = {};

export async function loadTranslations(env?: { DB: D1Database }): Promise<void> {
  if (!env?.DB) return;

  const stmt = env.DB.prepare("SELECT translation_key, en_text, bn_text FROM translations WHERE bn_text IS NOT NULL");
  const result = await stmt.all();

  for (const row of (result.results || []) as { translation_key: string; en_text: string; bn_text: string }[]) {
    enTranslations[row.translation_key] = row.en_text;
    bnTranslations[row.translation_key] = row.bn_text;
  }
}

export function setTranslations(en: TranslationMap, bn: TranslationMap) {
  enTranslations = en;
  bnTranslations = bn;
}

export function t(key: string, lang: "en" | "bn" = "bn"): string {
  if (lang === "bn" && bnTranslations[key]) {
    return bnTranslations[key];
  }
  return enTranslations[key] || key;
}

export function getTranslations(lang: "en" | "bn"): TranslationMap {
  return lang === "bn" ? bnTranslations : enTranslations;
}
