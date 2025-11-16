// Whether to do SSR and/or prerender (or not) is highly dependent on the use case for the app.
// For this _particular_ app, it's largely irrelevant.
// But: disabling SSR and prerender by default is _safer_,
// and thus is preferable in the absence of any other consideration.
// You can always opt-in to these options per-route if necessary.
export const ssr = false
export const prerender = false
export const csr = true