/**
 * Simulates an API call delay for development purposes
 * @param delay - Delay in milliseconds
 */
export const simulateAPIDelay = (delay: number = 500) => 
  new Promise(resolve => setTimeout(resolve, delay));
