export type Entry = {
    name: string
    logo: string
    url?: string
}

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
