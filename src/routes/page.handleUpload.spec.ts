import { memo } from "radash"
import { beforeEach, describe, expect, it } from "vitest"
import { handleUpload } from "./page.handleUpload"

describe("handleUpload", () => {
  describe("for a file upload event", () => {
    let files: () => FileList | null
    let result: () => Promise<void>

    beforeEach(() => {
      result = memo(async () => {
        await handleUpload(files())
      })
    })

    describe("with no file", () => {
      beforeEach(() => {
        files = () => null
      })

      it("throws an error", () => {
        expect(result()).rejects.toThrow()
      })
    })

    describe("with a single file", () => {
      let fileContent: () => BlobPart[]
      beforeEach(() => {
        files = memo(() => {
          // File[] and FileList aren't quite the same thing, but they are compatible enough for this test.
          return [new File(fileContent(), "file.csv", { type: "text/csv" })] as unknown as FileList
        })
      })

      describe("that is a valid CSV", () => {
        let data: () => string[][]
        beforeEach(() => {
          data = memo(() => [
            ["ResultValue", "CharacteristicName", '"Temperature, water"'],
          ])
          fileContent = memo(() => [data().map(line => line.join(",")).join("\n")])

        })

        it("does not throw", () => {
          expect(result()).resolves.not.toThrow()
        })
      })

      describe("that is not a CSV", () => {
        beforeEach(() => {
          fileContent = memo(() => [JSON.stringify({ message: "Not a CSV" })])
        })

        it("throws an error", () => {
          expect(result()).rejects.toThrow()
        })
      })
    })
  })
})
