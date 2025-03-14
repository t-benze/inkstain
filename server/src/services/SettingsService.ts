import path from 'path';
import fs from 'fs/promises';
import { Settings } from '~/server/types';
import { directories } from '../settings';

const DEFAULT_SETTINGS: Settings = {
  ocrService: 'default',
};
type SettingsCallback = (settings: Partial<Settings>) => Promise<void>;

const settingsFile = path.join(directories.configDir, 'settings.json');
export class SettingsService {
  private settingsData: Settings | null = null;
  private callbacks: SettingsCallback[] = [];
  public onSettingsChanged(callback: SettingsCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  private async notifyCallbacks(settings: Partial<Settings>): Promise<void> {
    for (const callback of this.callbacks) {
      await callback(settings);
    }
  }
  public async getSettings(): Promise<Settings> {
    if (this.settingsData) {
      return this.settingsData;
    }
    try {
      const settingsData = await fs.readFile(settingsFile, 'utf8');
      this.settingsData = JSON.parse(settingsData) as Settings;
      return this.settingsData;
    } catch (err) {
      await fs.writeFile(
        settingsFile,
        JSON.stringify(DEFAULT_SETTINGS, null, 2)
      );
      return DEFAULT_SETTINGS;
    }
  }

  public async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    await this.notifyCallbacks(updates);
    this.settingsData = { ...this.settingsData, ...updates };
    await fs.writeFile(
      settingsFile,
      JSON.stringify(this.settingsData, null, 2)
    );
    return this.settingsData;
  }
}
