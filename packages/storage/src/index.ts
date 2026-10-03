/**
 * Typed storage abstraction and repository layer.
 * All UI reads and writes go through this package, never raw SQL in React components.
 */

export interface LessonProgressRecord {
  lessonId: string;
  status: 'none' | 'viewed' | 'completed';
  lastPosition: number;
  updatedAt: string;
}

export interface SettingsRecord {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'md' | 'lg';
  language: string;
  reducedMotion: boolean;
  aiTier: 'small' | 'balanced' | 'best';
  aiOffMode: boolean;
  lowSpecMode: boolean;
}

export const DEFAULT_SETTINGS: SettingsRecord = {
  theme: 'dark',
  fontSize: 'md',
  language: 'en',
  reducedMotion: false,
  aiTier: 'balanced',
  aiOffMode: false,
  lowSpecMode: false,
};

export interface RoboforgeExportBundle {
  version: 1;
  exportedAt: string;
  appName: string;
  data: {
    profile?: Record<string, unknown>;
    settings: SettingsRecord;
    lessonProgress: LessonProgressRecord[];
    exerciseAttempts?: Record<string, unknown>[];
    quizAttempts?: Record<string, unknown>[];
    circuits?: Record<string, unknown>[];
    sketches?: Record<string, unknown>[];
    streaks?: Record<string, unknown>[];
    badges?: Record<string, unknown>[];
  };
}

/**
 * In-memory state store for Node tests and offline client state.
 * Implements the full persistence contract.
 */
export class StorageService {
  private progress = new Map<string, LessonProgressRecord>();
  private settings: SettingsRecord = { ...DEFAULT_SETTINGS };

  public async getProgress(lessonId: string): Promise<LessonProgressRecord | null> {
    return this.progress.get(lessonId) ?? null;
  }

  public async getAllProgress(): Promise<LessonProgressRecord[]> {
    return Array.from(this.progress.values());
  }

  public async setProgress(
    lessonId: string,
    status: 'none' | 'viewed' | 'completed',
    lastPosition = 0,
  ): Promise<LessonProgressRecord> {
    const record: LessonProgressRecord = {
      lessonId,
      status,
      lastPosition,
      updatedAt: new Date().toISOString(),
    };
    this.progress.set(lessonId, record);
    return record;
  }

  public async getSettings(): Promise<SettingsRecord> {
    return { ...this.settings };
  }

  public async updateSettings(partial: Partial<SettingsRecord>): Promise<SettingsRecord> {
    this.settings = { ...this.settings, ...partial };
    return { ...this.settings };
  }

  public async resetAll(): Promise<void> {
    this.progress.clear();
    this.settings = { ...DEFAULT_SETTINGS };
  }

  public async exportBundle(): Promise<RoboforgeExportBundle> {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      appName: 'RoboForge',
      data: {
        settings: await this.getSettings(),
        lessonProgress: await this.getAllProgress(),
      },
    };
  }

  public async importBundle(bundle: RoboforgeExportBundle): Promise<boolean> {
    if (!bundle || bundle.version !== 1 || !bundle.data) {
      throw new Error('Invalid .roboforge bundle format');
    }
    if (bundle.data.settings) {
      this.settings = { ...DEFAULT_SETTINGS, ...bundle.data.settings };
    }
    if (Array.isArray(bundle.data.lessonProgress)) {
      this.progress.clear();
      for (const item of bundle.data.lessonProgress) {
        this.progress.set(item.lessonId, item);
      }
    }
    return true;
  }
}
