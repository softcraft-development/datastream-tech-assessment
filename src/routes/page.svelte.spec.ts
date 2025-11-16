import type { Results } from "$lib/averageWaterTemperature"
import { tick } from "svelte"
import { assert, beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-svelte"
import { page } from "vitest/browser"
import Page from "./+page.svelte"

vi.mock("./page.handleUpload.ts", () => ({
  handleUpload: vi.fn()
}))

import { memo } from "radash"
import { handleUpload } from "./page.handleUpload"


beforeEach(() => {
  vi.resetAllMocks()
})

describe("/+page.svelte", () => {
  describe("when it renders", () => {
    beforeEach(() => {
      render(Page)
    })

    it("displays the heading", async () => {
      const heading = page.getByRole("heading", { level: 1 })
      expect(heading.element()).toBeVisible()
    })

    it("displays the file input", async () => {
      const heading = page.getByRole("heading", { level: 1 })
      expect(heading.element()).toBeVisible()
    })

    describe("and a file is provided", () => {
      let file: File
      let uploadFile: () => void
      let results: () => Results
      let average: () => number | undefined
      let errors: () => string[]
      let warnings: () => string[]

      beforeEach(() => {
        uploadFile = () => {
          const fileInput = page.getByTestId("file-input").first().element()
          assert(fileInput, "File Input is missing")
          file = new File(["test data"], "test.csv", { type: "text/csv" })
          Object.defineProperty(fileInput, "files", { value: [file], writable: false })
          fileInput.dispatchEvent(new Event("change", { bubbles: true }))
        }
        average = () => undefined
        errors = memo(() => [])
        warnings = memo(() => [])
        results = memo(() => ({
          average: average(),
          columns: {},
          count: 3,
          errors: errors(),
          sum: 5,
          warnings: warnings()
        }))
        vi.mocked(handleUpload).mockImplementation(() => Promise.resolve(results()))
      })

      it("handles the uploaded file", () => {
        uploadFile()
        expect(handleUpload).toHaveBeenCalledExactlyOnceWith([file])
      })

      it("does not render the average", async () => {
        uploadFile()
        await tick()
        expect(page.getByTestId("average").all()).toEqual([])
      })

      it("does not render errors", async () => {
        uploadFile()
        await tick()
        expect(page.getByTestId("error").all()).toEqual([])
      })

      it("does not render warnings", async () => {
        uploadFile()
        await tick()
        expect(page.getByTestId("warnings").all()).toEqual([])
      })

      describe("when there is an average", () => {
        beforeEach(() => {
          average = () => 10007
        })

        it("renders the average", async () => {
          uploadFile()
          await tick()
          expect(page.getByTestId("average").first().element()).toHaveTextContent(String(average()))
        })
      })

      describe("when there are errors", () => {
        beforeEach(() => {
          errors = memo(() => ["Test Error"])
        })

        it("renders the errors", async () => {
          uploadFile()
          await tick()
          expect(page.getByTestId("errors").first().element()).toHaveTextContent(errors()[0])
        })
      })

      describe("when there are warnings", () => {
        beforeEach(() => {
          warnings = memo(() => ["Test Warning"])
        })

        it("renders the errors", async () => {
          uploadFile()
          await tick()
          expect(page.getByTestId("warnings").first().element()).toHaveTextContent(warnings()[0])
        })
      })
    })
  })
})
