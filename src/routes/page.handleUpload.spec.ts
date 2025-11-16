import { characteristicColumn, resultColumn, type RawData, type Results } from "$lib/averageWaterTemperature"
import { memo } from "radash"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { handleUpload, maximumBytes } from "./page.handleUpload"

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
  result = memo(() => handleUpload(fileList()))
  vi.resetAllMocks()
  vi.spyOn(console, "error").mockImplementation(() => { })
})


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
        return [
          rawData().map(row => row.join(",")).join("\n")
        ]
      })
      vi.mocked(averageWaterTemperature).mockImplementation((): Results => ({
        average: 3,
        columns: {},
        count: 5,
        errors: [],
        sum: 7,
        warnings: [],
      }))
    })

    function itProcessesTheFile() {
      it("processes the CSV data", async () => {
        await result()
        expect(averageWaterTemperature).toHaveBeenCalledExactlyOnceWith(rawData())
      })
    }

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
