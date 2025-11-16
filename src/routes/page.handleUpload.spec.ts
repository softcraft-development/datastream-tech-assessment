import { characteristicColumn, resultColumn, type RawData, type Results } from "$lib/averageWaterTemperature"
import { memo } from "radash"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { handleUpload, maximumBytes } from "./page.handleUpload"

// Same module-level mocking considerations here as in `page.svelte.spec.ts`
vi.mock("$lib/averageWaterTemperature.ts", async () => {
  const actual = await vi.importActual("$lib/averageWaterTemperature.ts")
  return {
    ...actual,
    averageWaterTemperature: vi.fn()
  }
})

import { averageWaterTemperature } from "$lib/averageWaterTemperature"

let fileList: () => FileList | null
let result: () => Promise<Results>

beforeEach(() => {
  vi.resetAllMocks()
  // We're intentionally logging errors to console internally,
  // and intentionally generating these errors in the test.
  // We don't want to clutter the output with logging for intentional & desirable errors,
  // so we'll suppress them here.
  // We could even write tests to prove this occurred as intended.
  vi.spyOn(console, "error").mockImplementation(() => { })
  result = memo(() => handleUpload(fileList()))
})

// Note that these are nearly identical to the ones `averageWaterTemperature.spec.ts`.
// The difference is that `result` is async here,
// so the tests need to be too.
// In a perfect world we'd have tests that handle both,
// but KISS for now by copying and modifying them.
function itReportsErrors() {
  it("reports errors", async () => {
    expect((await result()).errors).not.toEqual([])
  })
}

function itReportsNoErrors() {
  it("reports no errors", async () => {
    expect((await result()).errors).toEqual([])
  })
}

function itReportsNoWarnings() {
  it("reports no warnings", async () => {
    expect((await result()).warnings).toEqual([])
  })
}

function itDoesNotProcessTheFile() {
  it("reports no warnings", async () => {
    await result()
    expect(averageWaterTemperature).not.toHaveBeenCalled()
  })
}

describe("with a null file list", () => {
  beforeEach(() => {
    fileList = () => null
  })

  itReportsErrors()
  itReportsNoWarnings()
  itDoesNotProcessTheFile()
})

describe("with a file", () => {
  let file: () => File
  let fileContent: () => BlobPart[]
  let files: () => File[]

  beforeEach(() => {
    file = memo(() => new File(fileContent(), "file.csv", { type: "text/csv" }))
    files = memo(() => [file()])
    fileList = memo(() => {
      // File[] and FileList aren't quite the same thing, but they are compatible enough for this test.
      return files() as unknown as FileList
    })
  })

  describe("that is too large", () => {
    beforeEach(() => {
      // Note that we're not actually generating large data in our test,
      // just triggering the max size lockout.
      fileContent = memo(() => [])
      vi.spyOn(File.prototype, "size", "get").mockReturnValue(maximumBytes + 1)
    })

    itDoesNotProcessTheFile()
    itReportsErrors()
  })

  describe("that is not actually CSV", () => {
    beforeEach(() => {
      fileContent = memo(() => [JSON.stringify({ message: "Not a CSV" })])
    })

    itReportsErrors()
    itDoesNotProcessTheFile()
  })

  describe("that is a valid CSV", () => {
    let rawData: () => RawData

    beforeEach(() => {
      rawData = memo(() => [
        [characteristicColumn, resultColumn],
      ])
      fileContent = memo(() => {
        // Very quick and dirty implementation of CSV generation.
        // An actual library would be better here, but we'll KISS for now.
        return [
          rawData().map(row => row.join(",")).join("\n")
        ]
      })
      // Note that `handleUpload` doesn't care what _correct_ `Results` are,
      // just that they're _valid_.
      vi.mocked(averageWaterTemperature).mockImplementation((): Results => ({
        average: 3,
        schema: {},
        count: 5,
        errors: [],
        sum: 7,
        warnings: [],
      }))
    })

    function itProcessesTheFile() {
      it("processes the CSV data", async () => {
        await result()
        // This is what lets us avoid rewriting all of tests for valid data;
        // We assume `averageWaterTemperature.spec.ts` covers everything.
        expect(averageWaterTemperature).toHaveBeenCalledExactlyOnceWith(rawData())
      })
    }

    // Note that we're not testing that `average` is correct,
    // but we _are_ testing that the errors and warnings are as we expect.
    // That's because `handleUpload` itself introduces _additional_ errors/warnings
    // that are not covered by `averageWaterTemperature.spec.ts`;
    // we need to test this.
    // Also note: we're not testing for the actual error messages (because KISS),
    // but we could.
    itProcessesTheFile()
    itReportsNoErrors()
    itReportsNoWarnings()

    describe("followed by another file", () => {
      beforeEach(() => {
        files = memo(() => [file(), new File(["Something else"], "two.txt")])
      })

      itProcessesTheFile()
      itReportsNoErrors()
      it("reports warnings", async () => {
        expect((await result()).warnings).not.toEqual([])
      })
    })
  })
})
