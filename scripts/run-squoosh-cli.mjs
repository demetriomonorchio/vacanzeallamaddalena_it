import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const nativeFetch = globalThis.fetch;

globalThis.fetch = async (input, init) => {
  const href =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : typeof input?.url === "string"
          ? input.url
          : null;

  if (href) {
    if (/^[a-zA-Z]:[\\/]/.test(href)) {
      const buffer = await fs.readFile(href);
      return new Response(buffer);
    }

    if (href.startsWith("file://")) {
      const buffer = await fs.readFile(fileURLToPath(href));
      return new Response(buffer);
    }
  }

  return nativeFetch(input, init);
};

await import("@squoosh/cli/src/index.js");
