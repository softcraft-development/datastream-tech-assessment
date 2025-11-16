<script lang="ts">
  import type { ChangeEventHandler } from "svelte/elements"

  const onchange: ChangeEventHandler<HTMLInputElement> = () => {}
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
