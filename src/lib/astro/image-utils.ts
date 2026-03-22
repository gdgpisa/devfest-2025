export interface GridSpan {
    rows: number
    cols: number
}

/**
 * Parses grid span dimensions from image filename using the @RxC convention.
 * Example: "photo@2x3.jpg" → { rows: 2, cols: 3 }
 * Falls back to { rows: 1, cols: 1 } if no @RxC pattern found.
 *
 * @param src - Image src URL (may contain query params)
 * @returns Grid span object with rows and cols
 * @throws Error if filename cannot be parsed
 */
export function parseGridSpan(src: string): GridSpan {
    const filename = src.split('/').at(-1)?.split('?').at(0)?.split('.').at(0)

    if (!filename) {
        throw new Error(`Invalid filename: unable to extract filename from src "${src}"`)
    }

    if (!filename.includes('@')) {
        return { rows: 1, cols: 1 }
    }

    const gridPart = filename.split('@').at(-1)

    if (!gridPart) {
        throw new Error(`Invalid filename: missing grid dimensions after @ in "${filename}"`)
    }

    const parts = gridPart.split('x')

    if (parts.length !== 2) {
        throw new Error(`Invalid filename: expected format @RxC but got "${gridPart}" in "${filename}"`)
    }

    const rows = parseInt(parts[0], 10)
    const cols = parseInt(parts[1], 10)

    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
        throw new Error(
            `Invalid filename: rows and cols must be positive integers, got rows=${parts[0]}, cols=${parts[1]} in "${filename}"`,
        )
    }

    return { rows, cols }
}
