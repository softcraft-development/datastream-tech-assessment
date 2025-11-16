// Copied from node_modules/.pnpm/svelte@5.43.7/node_modules/svelte/elements.d.ts,

import type { ChangeEventHandler } from "svelte/elements"

// See node_modules/.pnpm/svelte@5.43.7/node_modules/svelte/elements.d.ts
export type ChangeEvent =
  Parameters<ChangeEventHandler<HTMLInputElement>>[0]

export function handleUpload(files: FileList | null) {

}