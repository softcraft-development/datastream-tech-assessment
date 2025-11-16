import type { Results } from "$lib/averageWaterTemperature"
import { memo } from "radash"
import { tick } from "svelte"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-svelte"
import { page } from "vitest/browser"
import Page from "./+page.svelte"

// Testing principle: try to avoid testing the same logic twice.
// `handleUpload` itself has its own tests,
// so here we only need to know that it's being _called_ as expected.
vi.mock("./page.handleUpload.ts", () => ({
  handleUpload: vi.fn()
}))

// We need to import this _after_ we mock it,
// because Vitest hoists all module mocks to the top of the file.
import { handleUpload } from "./page.handleUpload"

beforeEach(() => {
  // We need to reset the `handleUpload` mock between each test.
  vi.resetAllMocks()
})

describe("/+page.svelte", () => {
  describe("when it renders", () => {
    beforeEach(() => {
      // This is one place where I'm _not_ lazily & dynamically initializing all of my test setup,
      // mostly because I'm not as familiar with the nuances of Svelte,
      // and I want to get this done quickly.
      // Ideally, even the rendering would be lazy.
      render(Page)
    })

    // Testing for content can go on ad infinitum.
    // Focus on the most important things.
    it("displays the heading", async () => {
      const heading = page.getByTestId("title")
      expect(heading.element()).toBeVisible()
    })

    it("displays the file input", async () => {
      const fileInput = page.getByTestId("file-input")
      expect(fileInput.element()).toBeVisible()
    })

    describe("and a file is provided", () => {
      let file: () => File
      let uploadFile: () => void
      let results: () => Results
      let average: () => number | undefined
      let errors: () => string[]
      let warnings: () => string[]

      beforeEach(() => {
        file = memo(() => new File(["test data"], "test.csv", { type: "text/csv" }))
        uploadFile = () => {
          const fileInput = page.getByTestId("file-input").first().element()
          // It's a bit of a hack to get the files set correctly.
          Object.defineProperty(fileInput, "files", { value: [file()], writable: false })
          // bubbles: true ends up being crucial here because `currentTarget` doesn't get set properly without it.
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
        // This is what lets us avoid rewriting all of tests for file contents;
        // We assume `handleUpload.spec.ts` covers everything.
        expect(handleUpload).toHaveBeenCalledExactlyOnceWith([file()])
      })

      it("does not render the average", async () => {
        uploadFile()
        // `tick` is necessary to wait for SvelteKit to update the page.
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
          // This is a (prime) value that is unlikely to coincidentally exist for any other reason
          average = () => 10007
        })

        it("renders the average", async () => {
          uploadFile()
          await tick()
          // We could definitely test for more specific formatting, but KISS for now.
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
