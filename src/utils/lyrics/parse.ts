import { EOL } from 'os'

/**
 * Processes the lyrics (prompt) from the audio metadata into a more readable format.
 * @param prompt The original lyrics text.
 * @returns The processed lyrics text.
 */
export const parse = (lyrics: string): string =>
  // Assuming the original lyrics are separated by a specific delimiter (e.g., newline), we can convert it into a more readable format.
  // The implementation here can be adjusted according to the actual lyrics format.
  // For example, if the lyrics exist as continuous text, it might be necessary to split them based on specific markers (such as periods, commas, etc.).
  // The following implementation assumes that the lyrics are already separated by newlines.

  // Split the lyrics using newline and ensure to remove empty lines.
  // Reassemble the processed lyrics lines into a single string, separated by newlines between each line.
  // Additional formatting logic can be added here, such as adding specific markers or handling special lines.
  lyrics
    .split('\n')
    .filter((line) => line.trim() !== '')
    .join(EOL)
