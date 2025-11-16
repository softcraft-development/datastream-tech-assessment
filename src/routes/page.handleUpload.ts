import { averageWaterTemperature, begin, type RawData, type Results } from "$lib/averageWaterTemperature"
import { parse } from "csv-parse/browser/esm/sync"

// #1 principle behind this file: keep logic out of the component.
// This code is currently pretty _specific_ to `+page.svelte`,
// so we'll name its file with `+page.svelte` in mind,
// and then keep as much logic here as possible.
// However, this is all subject to change as the app evolves.
// We've already moved the actual data processing out to `averageWaterTemperature`;
// we can further refactor this code as necessary.
// Ultimately, it represents the glue between the uploaded file and the data processing.

// This is customizable; feel free to adjust if you like.
// Ideally we'd be able to stream and not worry about maximum file sizes,
// but see note below.
export const maximumBytes = 1 * 1024 * 1024

// `Results` doesn't have to be going to be the right return value here.
// Using it does leak a bit of the `averageWaterTemperature` implementation past this handler.
// However: it does work fine, so we'll KISS.
// Just don't get too attached to it; we may replace it with some other interface later.
export async function handleUpload(files: FileList | null): Promise<Results> {
  const file = files?.[0]
  if (!file) {
    return {
      ...begin(),
      errors: ["No file provided."],
    }
  }

  // For the purposes of this exercise, we'll cap the size of the file we attempt to process.
  // Theoretically we could stream the file data here,
  // but that would require a CSV parser that can consume a `ReadableStream` on the client side.
  // (csv-parse has a streaming mode but it only consumes Node.js `stream.Readable`.)
  // This is solvable, with enough effort.
  // In the meantime, we'll choose a maximumBytes that accepts some of the supplied test data,
  // but not others -- and thus demonstrates that it can gracefully handle large data.
  // Without the size cap, my own Firefox choked on `doi.org_10.25976_lk09-0b65.csv` with an out-of-memory error.
  if (file.size > maximumBytes) {
    return {
      ...begin(),
      errors: [`File is too large to process. Maximum allowed size is ${(maximumBytes / (1024 * 1024)).toFixed(1)} MB.`]
    }
  }

  const content = await file.text()

  let data: RawData
  try {
    // Avoid rolling your own parsing systems.
    data = parse(content)
  }
  catch (error) {
    // Dumping errors to the console is never ideal, but:
    // 1. KISS for this exercise; we don't need a full logging provider.
    // 2. We have a separate mechanism for reporting high-level errors to the user.
    console.error("Error parsing csv", error)
    // Note that this fails on _any_ parsing error (such as library bugs),
    // not just invalid input.
    // For simplicity here, we'll gloss over this when reporting to the user;
    // ideally we'd be able to tell the difference.
    return {
      ...begin(),
      errors: ["Invalid CSV File."],
    }
  }

  try {
    const results = averageWaterTemperature(data)

    if (files.length > 1) {
      // We could handle multi file uploads, and aggregate the data across them.
      // But KISS for now.
      // Our actual upload control doesn't allow multi-uploads anyway.
      results.warnings.push("Only the first file has been processed.")
    }
    return results
  }
  catch (error) {
    // We want to keep logic, including error handling, out of the component as much as possible.
    // What the user needs to know is that something has failed,
    // and we have a mechanism for reporting that already.
    // We'll gloss over the details in the UI, and (again) dump the real error to the console (for now).
    console.error("Error getting water temperature results", error)
    return {
      ...begin(),
      errors: ["Unexpected error processing file."],
    }
  }
}