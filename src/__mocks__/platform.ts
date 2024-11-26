// Mock platform implementation for testing
export const platform = {
  async randomizeCiphers(): Promise<void> {
    return Promise.resolve();
  }
}; 