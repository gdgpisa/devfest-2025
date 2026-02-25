export type Entry = {
    name: string
    logo: string
    url?: string
}

/**
 * Unifies the entries with the image modules by matching the logo field with the image file name.
 * Throws an error if an image is missing for an entry.
 */
export const unifyImages = (
    entries: Entry[] | undefined,
    imageModules: { default: ImageMetadata }[],
): {
    name: string
    logo: string
    url?: string
    image: ImageMetadata
}[] => {
    if (!entries) {
        return []
    }

    const imageDict: Record<string, ImageMetadata> = Object.fromEntries(
        imageModules.map(image => {
            // Extract the file name and extension from the image src
            // For reasons, Astro also adds a query string to the image src, so we need to split it out first
            const ext = image.default.src.split('?')[0].split('.').at(-1)
            const name = image.default.src.split('/').at(-1)?.split('?').at(0)?.split('.').at(0)

            const logoShortPath = name + '.' + ext

            console.log(`- ${logoShortPath} (${image.default.src})`)

            if (!logoShortPath) {
                console.warn(`Image name not found for ${image.default.src}`)
            }

            return [logoShortPath, image.default]
        }),
    )

    return entries.map(entry => {
        const image = imageDict[entry.logo]
        if (!image) {
            throw new Error(`Image not found for ${entry.logo}`)
        }

        return {
            ...entry,
            image,
        }
    })
}
