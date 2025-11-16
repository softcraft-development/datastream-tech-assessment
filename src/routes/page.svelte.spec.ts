import { beforeEach, describe, expect, it } from "vitest"
import { render } from "vitest-browser-svelte"
import { page } from "vitest/browser"
import Page from "./+page.svelte"

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
  })
})
