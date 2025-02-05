import type { ImageMetadata } from 'astro'

export const resolveImageModules = (globImport: Record<string, () => Promise<{ default: ImageMetadata }>>) => {
    return Promise.all(Object.values(globImport).map(module => module()))
}
