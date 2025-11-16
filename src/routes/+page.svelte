<script lang="ts">
  import type { Results } from "$lib/averageWaterTemperature"
  import type { ChangeEventHandler } from "svelte/elements"
  import { handleUpload } from "./page.handleUpload"

  let results = $state<Results | undefined>(undefined)

  const onchange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    event.preventDefault()
    results = await handleUpload(event.currentTarget.files)
  }
</script>

<h1>DataStream Technical Assessment</h1>
<h3>Craig Walker, November 2025</h3>
<section class="mt-12">
  <h2>Data Source</h2>
  <form>
    <div>Upload your CSV for data analysis.</div>
    <input accept="text/csv,.csv" data-testid="file-input" id="file" name="file" type="file" {onchange} />
  </form>
</section>

{#if results}
  {#if results.average !== undefined}
    <section data-testid="average" class="mt-4 rounded border border-green-200 bg-green-50 p-3 text-green-800">
      <h3>Average Water Temperature: {results.average.toFixed(2)}</h3>
    </section>
  {/if}

  {#if results.errors.length}
    <section data-testid="errors" class="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-800">
      <h3>Errors</h3>
      <ul>
        {#each results.errors as error}
          <li>{error}</li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if results.warnings.length}
    <section data-testid="warnings" class="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-yellow-800">
      <h3>Warnings</h3>
      <ul>
        {#each results.warnings as warnings}
          <li>{warnings}</li>
        {/each}
      </ul>
    </section>
  {/if}
{/if}
