// Model inference runs only in the editor's worker. Article text stays on this device.
import { env, pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6/dist/transformers.min.js";
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;
let model;
async function translate(text) {
  const lines = [];
  for (const line of text.split("\n")) {
    if (!/[\u0980-\u09ff]/u.test(line)) { lines.push(line); continue; }
    const translated = [];
    for (const sentence of line.match(/[^।!?]+[।!?]*|[।!?]+/gu) ?? []) {
      const words = sentence.trim().split(/\s+/u);
      let part = "";
      async function flush() {
        if (!part) return;
        const [result] = await model(part, { max_new_tokens: 384, num_beams: 3 });
        const output = result.translation_text.trim();
        if (!output) throw new Error("The translator returned an empty sentence.");
        translated.push(output);
        part = "";
      }
      for (const word of words) {
        if (part.length + word.length > 260) await flush();
        part += (part ? " " : "") + word;
      }
      await flush();
    }
    lines.push(translated.join(" "));
  }
  return lines.join("\n");
}
self.onmessage = async ({ data }) => {
  try {
    model ??= await pipeline("translation", "fintutto/opus-mt-bn-en", {
      revision: "48aa28b71a66432f5224021cefd2c0742c3b2a40", device: "wasm", dtype: "q8",
    });
    const output = [];
    for (const field of data) output.push(await translate(field));
    self.postMessage({ output });
  } catch (error) { self.postMessage({ error: String(error) }); }
};
