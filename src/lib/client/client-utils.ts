/**
 * Generates a short hash from a string using a simple hashing algorithm (djb2)
 * and encodes it in base36 to make it shorter.
 */
export function hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash |= 0 // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36)
}
