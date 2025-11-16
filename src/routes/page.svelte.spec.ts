import { assert, beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-svelte"
import { page } from "vitest/browser"
import Page from "./+page.svelte"
import { handleUpload } from "./page.handleUpload"

vi.mock("./page.handleUpload.ts", () => ({
  handleUpload: vi.fn()
}))

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
      beforeEach(() => {
        const fileInput = page.getByTestId("file-input").first().element()
        assert(fileInput, "File Input is missing")
        file = new File(["test data"], "test.csv", { type: "text/csv" })
        Object.defineProperty(fileInput, "files", { value: [file], writable: false })
        fileInput.dispatchEvent(new Event("change", { bubbles: true }))
      })

      it("should pass the file to handleFile", () => {
        expect(handleUpload).toHaveBeenCalledExactlyOnceWith([file])
      })
    })
  })
})
