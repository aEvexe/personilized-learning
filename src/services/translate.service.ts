export async function translateWord(
  word: string,
  targetLang: string
): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${targetLang}`
    );
    const data = await res.json();
    return data?.responseData?.translatedText || 'No translation';
  } catch {
    return 'Error loading';
  }
}
