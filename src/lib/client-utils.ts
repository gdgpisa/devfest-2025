/**
 * Converts a binary string (string of 0s and 1s) to a short base64 encoded string.
 *
 * @param binaryString A string of 0s and 1s representing binary data
 * @returns A short base64 encoded string
 */
export function binaryStringToBase64(binaryString: string) {
    // Validate input is a binary string
    if (!/^[01]+$/.test(binaryString)) {
        throw new Error('Input must be a string of 0s and 1s')
    }

    // Calculate how many bits we need to pad to make the total a multiple of 6
    // (since each base64 character represents 6 bits)
    const paddingLength = (6 - (binaryString.length % 6)) % 6

    // Pad the binary string to make its length a multiple of 6
    const paddedBinary = binaryString.padStart(binaryString.length + paddingLength, '0')

    // Base64 character set (standard encoding)
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    let result = ''

    // Process 6 bits at a time
    for (let i = 0; i < paddedBinary.length; i += 6) {
        // Extract 6 bits and convert to decimal
        const sixBits = paddedBinary.substring(i, i + 6)
        const index = parseInt(sixBits, 2)

        // Append the corresponding base64 character
        result += base64Chars[index]
    }

    return result
}

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
