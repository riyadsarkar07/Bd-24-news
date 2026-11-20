/** Called on editorial writes only. Reuse saved translations for unchanged fields. */
export async function englishFields(source: string[], supplied: string[]): Promise<string[]> {
  const bengali = /[\u0980-\u09ff]/u;
  const result = supplied.map((value, i) => {
    const english = value.trim();
    if (english && !bengali.test(english)) return english;
    const original = source[i] ?? "";
    return bengali.test(original) ? "" : original;
  });
  const missing = result.map((v, i) => v || !source[i]?.trim() ? -1 : i).filter((i) => i >= 0);
  if (!missing.length) return result;
  const worker = new Worker("/workers/news-translation.mjs", { type: "module" });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const translated = await new Promise<string[]>((resolve, reject) => {
      timer = setTimeout(() => reject(new Error("Translation timed out. Retry, enter the English text, or save a draft.")), 300_000);
      worker.onerror = () => reject(new Error("Translation unavailable. Retry, enter the English text, or save a draft."));
      worker.onmessage = ({ data }) => {
        if (!Array.isArray(data.output) || data.output.length !== missing.length || data.output.some((v: unknown) => typeof v !== "string" || !v.trim() || bengali.test(v))) {
          reject(new Error("Translation failed. Retry or enter the English text."));
        } else resolve(data.output);
      };
      worker.postMessage(missing.map((i) => source[i]));
    });
    missing.forEach((index, i) => { result[index] = translated[i]!; });
    return result;
  } finally {
    clearTimeout(timer);
    worker.terminate();
  }
}
