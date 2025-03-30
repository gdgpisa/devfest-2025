import type { ImageMetadata } from 'astro'

export const resolveImageModules = (
    globImport: Record<string, () => Promise<{ default: ImageMetadata }>>,
): Promise<{ default: ImageMetadata }[]> => Promise.all(Object.values(globImport).map(module => module()))
