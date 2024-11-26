import { PlatformExtensions } from './platform-interface';

// Define platform constants
export const PLATFORM_NODE = process.env.NODE_ENV !== 'test';
export const PLATFORM_NODE_JEST = process.env.NODE_ENV === 'test';

// Re-export the interface
export type { PlatformExtensions };

export class Platform implements PlatformExtensions {
  private static instance: Platform;
  private platformImpl: PlatformExtensions | null = null;

  private constructor() {}

  public static getInstance(): Platform {
    if (!Platform.instance) {
      Platform.instance = new Platform();
    }
    return Platform.instance;
  }

  private static async importPlatform(): Promise<null | PlatformExtensions> {
    if (PLATFORM_NODE) {
      const { platform } = await import('./node');
      return platform as PlatformExtensions;
    } else if (PLATFORM_NODE_JEST) {
      const { platform } = await import('../__mocks__/platform');
      return platform as PlatformExtensions;
    }
    return null;
  }

  public async randomizeCiphers(): Promise<void> {
    if (!this.platformImpl) {
      this.platformImpl = await Platform.importPlatform();
    }
    return this.platformImpl?.randomizeCiphers() ?? Promise.resolve();
  }
}
