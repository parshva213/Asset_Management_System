/**
 * Generates a random alphanumeric key of a specified length
 * @param {number} length - Length of the key (default: 5)
 * @returns {string} - Randomly generated key
 */
export const generateKey = (length = 5) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
