import { parse } from "csv-parse/browser/esm/sync"
import type { ChangeEventHandler } from "svelte/elements"

// See node_modules/.pnpm/svelte@5.43.7/node_modules/svelte/elements.d.ts
export type ChangeEvent =
  Parameters<ChangeEventHandler<HTMLInputElement>>[0]


export async function handleUpload(files: FileList | null): Promise<void> {
  const file = files?.[0]
  if (!file) {
    throw new Error("Missing file")
  }

  const content = await file.text()
  try {
    parse(content)
  }
  catch (cause) {
    throw new Error("Invalid CSV", {
      cause
    })
  }
}