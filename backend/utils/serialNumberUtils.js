/**
 * Generates an array of serial numbers based on a prefix and starting sequence.
 * Format: [Prefix]/[Seq]
 * 
 * @param {string} prefix - The pre-generated prefix (e.g., APPLE-MP-HW-001-001)
 * @param {number} count - Quantity of assets to generate
 * @param {number} startSeq - Starting sequence number
 * @returns {string[]} Array of generated serial numbers
 */
export const generateSerialNumbers = (prefix, count, startSeq) => {
    const serials = [];
    for (let i = 0; i < count; i++) {
        const seqCode = String(startSeq + i).padStart(4, '0');
        serials.push(`${prefix}/${seqCode}`);
    }
    
    return serials;
};
