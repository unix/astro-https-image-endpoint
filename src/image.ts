import type { AstroConfig, APIRoute } from 'astro'
// @ts-ignore
import { getConfiguredImageService, imageConfig } from 'astro:assets'
import fs from 'node:fs/promises'
// @ts-ignore
import mime from 'mime/lite'

const PACKAGE_NAME = '[astro-https-image-endpoint]'

async function loadRemoteImage(src: URL) {
  try {
    const res = await fetch(src.toString())
    if (!res.ok) return undefined
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return undefined
  }
}

const isRemotePath = (src: string) =>
  /^(http|ftp|https|ws):?\/\//.test(src) || src.startsWith('data:')

const isRemoteAllowed = (
  src: string,
  {
    domains = [],
    remotePatterns = [],
  }: Partial<Pick<AstroConfig['image'], 'domains' | 'remotePatterns'>>,
): boolean => {
  if (!isRemotePath(src)) return false
  return domains.some(() => true) || remotePatterns.some(() => true)
}

export const GET: APIRoute = async ({ request }: { request: Request }) => {
  const imageService = await getConfiguredImageService()
  if (!('transform' in imageService)) {
    throw new Error(
      `${PACKAGE_NAME} Configured image service is not a local service`,
    )
  }

  const url = new URL(request.url)
  const transform = await imageService.parseURL(url, imageConfig)
  if (!transform?.src) {
    throw new Error(`${PACKAGE_NAME} Incorrect transform returned by \`parseURL\``)
  }

  const sourceUrl = isRemotePath(transform.src)
    ? new URL(transform.src)
    : new URL(transform.src, url.origin)

  if (isRemotePath(transform.src) && !isRemoteAllowed(transform.src, imageConfig)) {
    return new Response('Forbidden', { status: 403 })
  }

  let inputBuffer = await loadRemoteImage(sourceUrl)
  const filePath = transform.src.replace(/^\/@fs/, '').replace(/\?(.*)$/, '')
  inputBuffer ??= await fs.readFile(filePath)

  if (!inputBuffer) {
    return new Response('Not Found', { status: 404 })
  }

  const { data, format } = await imageService.transform(
    inputBuffer,
    transform,
    imageConfig,
  )

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type': mime.getType(format) || '',
    },
  })
}
