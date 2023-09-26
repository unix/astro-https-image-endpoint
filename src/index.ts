let logged = false
export default function (isDev: boolean, silent?: boolean) {
  if (isDev === undefined) {
    throw new Error(
      `[astro-https-image-endpoint] This plugin can only be used in the DEV mode.
Please pass the environment explicitly when using:

+ endpoint: imageEndpoint(import.meta.env.DEV)
`,
    )
  }
  if (!silent && !logged) {
    logged = true
    console.log(
      `[astro-https-image-endpoint] (only for local): ${
        isDev ? 'enabled' : 'disabled'
      }`,
    )
  }

  return isDev ? 'node_modules/astro-https-image-endpoint/dist/image.js' : undefined
}
