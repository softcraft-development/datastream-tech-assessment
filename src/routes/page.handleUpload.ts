import { averageWaterTemperature, begin, type RawData, type Results } from "$lib/averageWaterTemperature"
import { parse } from "csv-parse/browser/esm/sync"
import type { ChangeEventHandler } from "svelte/elements"

// See node_modules/.pnpm/svelte@5.43.7/node_modules/svelte/elements.d.ts
export type ChangeEvent =
  Parameters<ChangeEventHandler<HTMLInputElement>>[0]

export const maximumBytes = 1 * 1024 * 1024

export async function handleUpload(files: FileList | null): Promise<Results> {
  const file = files?.[0]
  if (!file) {
    return {
      ...begin(),
      errors: ["No file provided"],
    }
  }

  if (file.size > maximumBytes) {
    return {
      ...begin(),
      errors: [`File is too large to process. Maximum allowed size is ${(maximumBytes / (1024 * 1024)).toFixed(1)} MB`]
    }
  }

  const content = await file.text()

  let data: RawData
  try {
    data = parse(content)
  }
  catch (error) {
    console.error("Error parsing csv", error)
    return {
      ...begin(),
      errors: ["Invalid CSV File"],
    }
  }

  try {
    const results = averageWaterTemperature(data)

    if (files.length > 1) {
      results.warnings.push("Only the first file has been processed.")
    }
    return results
  }
  catch (error) {
    console.error("Error getting water temperature results", error)
    return {
      ...begin(),
      errors: [String(error)],
    }
  }
}