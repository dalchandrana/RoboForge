/**
 * Typed storage abstraction and repository layer.
 * All UI reads and writes go through this package, never raw SQL in React components.
 */

export * from './motivation';

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
  onboardingCompleted?: boolean;
  learnerNickname?: string;
  learnerLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export const DEFAULT_SETTINGS: SettingsRecord = {
  theme: 'dark',
  fontSize: 'md',
  language: 'en',
  reducedMotion: false,
  aiTier: 'balanced',
  aiOffMode: false,
  lowSpecMode: false,
  onboardingCompleted: false,
  learnerNickname: 'Cadet Spark',
  learnerLevel: 'beginner',
};

export interface ProjectLog {
  id: string;
  projectId: string;
  title: string;
  notes: string;
  observations: string;
  photoUrl?: string;
  createdAt: string;
  completed: boolean;
}

export interface RoboforgeExportBundle {
  version: 1;
  exportedAt: string;
  appName: string;
  data: {
    profile?: Record<string, unknown>;
    settings: SettingsRecord;
    lessonProgress: LessonProgressRecord[];
    projectLogs?: ProjectLog[];
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
  private activeDays = new Set<string>();
  private badges = new Map<string, string>();
  private milestones = new Set<string>();
  private projectLogs = new Map<string, ProjectLog>();

  /** Save or update a workshop build log entry (FR-PRJ-05). */
  public async saveProjectLog(log: ProjectLog): Promise<void> {
    this.projectLogs.set(log.id, { ...log });
  }

  /** Retrieve all workshop build logs, optionally filtered by projectId. */
  public async getProjectLogs(projectId?: string): Promise<ProjectLog[]> {
    const logs = Array.from(this.projectLogs.values());
    if (projectId) {
      return logs.filter(l => l.projectId === projectId);
    }
    return logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** Delete a workshop build log entry. */
  public async deleteProjectLog(id: string): Promise<boolean> {
    return this.projectLogs.delete(id);
  }

  /** Record learner activity for a YYYY-MM-DD day (used for streaks). */
  public async recordActivity(day: string): Promise<void> {
    this.activeDays.add(day);
  }

  public async getActiveDays(): Promise<string[]> {
    return Array.from(this.activeDays).sort();
  }

  /** Award a badge once; returns true only the first time. */
  public async awardBadge(badgeId: string): Promise<boolean> {
    if (this.badges.has(badgeId)) return false;
    this.badges.set(badgeId, new Date().toISOString());
    return true;
  }

  public async getBadges(): Promise<{ id: string; earnedAt: string }[]> {
    return Array.from(this.badges, ([id, earnedAt]) => ({ id, earnedAt }));
  }

  /** Simple named milestones, e.g. 'ran-arduino-sim' or 'project:p3-...'. */
  public async setMilestone(name: string): Promise<void> {
    this.milestones.add(name);
  }

  public async getMilestones(): Promise<string[]> {
    return Array.from(this.milestones);
  }

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
    this.activeDays.clear();
    this.badges.clear();
    this.milestones.clear();
    this.projectLogs.clear();
  }

  public async exportBundle(): Promise<RoboforgeExportBundle> {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      appName: 'RoboForge',
      data: {
        settings: await this.getSettings(),
        lessonProgress: await this.getAllProgress(),
        projectLogs: await this.getProjectLogs(),
        streaks: (await this.getActiveDays()).map(day => ({ day })),
        badges: await this.getBadges(),
        profile: { milestones: await this.getMilestones() },
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
    this.projectLogs.clear();
    if (Array.isArray(bundle.data.projectLogs)) {
      for (const log of bundle.data.projectLogs) {
        if (log && typeof log.id === 'string') {
          this.projectLogs.set(log.id, log);
        }
      }
    }
    this.activeDays.clear();
    for (const s of bundle.data.streaks ?? []) {
      if (typeof s['day'] === 'string') this.activeDays.add(s['day']);
    }
    this.badges.clear();
    for (const b of bundle.data.badges ?? []) {
      if (typeof b['id'] === 'string') this.badges.set(b['id'], String(b['earnedAt'] ?? ''));
    }
    this.milestones.clear();
    const ms = bundle.data.profile?.['milestones'];
    if (Array.isArray(ms)) for (const m of ms) this.milestones.add(String(m));
    return true;
  }
}
