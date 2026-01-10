import { Plugin } from "obsidian";
import {
  BetterGitignoreSettings,
  BetterGitignoreSettingTab,
  DEFAULT_SETTINGS,
} from "./settings";
import { getDefaultTemplateSettings } from "./templates";

export default class BetterGitignorePlugin extends Plugin {
  settings: BetterGitignoreSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    // Add settings tab
    this.addSettingTab(new BetterGitignoreSettingTab(this.app, this));

    // Add command to open settings
    this.addCommand({
      id: "open-gitignore-settings",
      name: "Open .gitignore editor",
      callback: () => {
        // Open settings tab
        const setting = (this.app as any).setting;
        setting.open();
        setting.openTabById(this.manifest.id);
      },
    });
  }

  onunload(): void {
    // Cleanup if needed
  }

  async loadSettings(): Promise<void> {
    const data = await this.loadData();
    const defaultTemplates = getDefaultTemplateSettings();

    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      { templates: defaultTemplates },
      data
    );
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
