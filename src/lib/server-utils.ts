import type { ImageMetadata } from 'astro'

/**
 * `import.meta.glob` returns an object of type `Record<string, () => Promise<...>>`,
 * this is an helper function to resolve the promises and return the values
 */
export const resolveImageModules = (
    importMetaGlobRecord: Record<string, () => Promise<{ default: ImageMetadata }>>,
): Promise<{ default: ImageMetadata }[]> => Promise.all(Object.values(importMetaGlobRecord).map(module => module()))
