/**
 * Pause for a specified number of seconds.
 * @param x Minimum number of seconds.
 * @param y Maximum number of seconds (optional).
 */
export const sleep = (x: number, y?: number): Promise<void> => {
  let timeout = x * 1000
  if (y !== undefined && y !== x) {
    const min = Math.min(x, y)
    const max = Math.max(x, y)
    timeout = Math.floor(Math.random() * (max - min + 1) + min) * 1000
  }

  return new Promise((resolve) => setTimeout(resolve, timeout))
}
