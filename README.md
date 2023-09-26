## astro-https-image-endpoint

### Why

Astro's [image optimization service](https://docs.astro.build/en/guides/images/#images-in-astro-files) will not work when TLS enabled on localhost,
This issue has been on the back burner for a while,
but there is no consistent official solution, and the current issue is [low priority](https://github.com/withastro/astro/issues/8395) (and probably won't be fixed for some time).

It's a simple tool to help you take a break from TLS + Astro Image.

### Usage

- Install: `npm i astro-https-image-endpoint -D`
- Add to your `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config'
import imageEndpoint from 'astro-https-image-endpoint'

export default defineConfig({
  image: {
    // Pass "import.meta.env.DEV" to ensure it is only enabled on development.
    endpoint: imageEndpoint(import.meta.env.DEV),
  },
})
```

### Effects

- _**Production safe**_: Only be loaded in development mode;
- _**Performance safe**_: Only the read files (stay compatible with the original API);
- _**No caches**_: Usually, this will reduce your burden and do not require debugging due to issues with caching;

> If your site really does have 1k+ images on one page that load slowly due to disk I/O during development,
> then that's not relevant to this plugin and you may need a CDN or other cloud service.

### How to set HTTPS in Astro

This has nothing to do with this plugin.
But if you haven't started for Astro to enable TLS for local development, here's the reference configuration:

```ts
import { defineConfig } from 'astro/config'
import mkcert from 'vite-plugin-mkcert'
import imageEndpoint from 'astro-https-image-endpoint'

export default defineConfig({
  server: {
    host: 'my-domain.com',
    port: 3000,
  },
  image: {
    endpoint: imageEndpoint(import.meta.env.DEV),
  },
  vite: {
    plugins: [mkcert({ hosts: ['my-domain.com'] })],
  },
})
```

### License

[MIT](LICENSE)
