import { memo } from "radash"
import { beforeEach, describe, expect, it } from "vitest"
import { handleUpload } from "./page.handleUpload"

describe("handleUpload", () => {
  describe("for a file upload event", () => {
    let files: () => FileList | null
    let result: () => void

    beforeEach(() => {
      files = () => null
      result = memo(() => handleUpload(files()))
    })

    describe("with a single CSV file", () => {
      let data: () => string[][]
      let fileContent: () => string
      beforeEach(() => {
        data = memo(() => [
          ["ResultValue", "CharacteristicName", '"Temperature, water"'],
        ])
        fileContent = memo(() => data().map(line => line.join(",")).join("\n"))
        files = memo(() => {
          // File[] and FileList aren't quite the same thing, but they are compatible enough for this test.
          return [new File([fileContent()], "file.csv", { type: "text/csv" })] as unknown as FileList
        })
      })

      it("does not throw", () => {
        expect(() => result()).not.toThrow()
      })
    })
  })
})
