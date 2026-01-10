import {
  App,
  PluginSettingTab,
  Setting,
  TextAreaComponent,
  debounce,
} from "obsidian";
import BetterGitignorePlugin from "./main";
import { OBSIDIAN_TEMPLATES, GitignoreTemplate } from "./templates";
import { GitignoreParser } from "./gitignoreParser";
import { FileScanner } from "./fileScanner";

export interface BetterGitignoreSettings {
  templates: Record<string, boolean>;
}

export const DEFAULT_SETTINGS: BetterGitignoreSettings = {
  templates: {},
};

export class BetterGitignoreSettingTab extends PluginSettingTab {
  plugin: BetterGitignorePlugin;
  parser: GitignoreParser;
  scanner: FileScanner;
  ignoredFilesEl: HTMLElement | null = null;
  editorTextarea: TextAreaComponent | null = null;
  checkboxes: Map<string, HTMLInputElement> = new Map();

  constructor(app: App, plugin: BetterGitignorePlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.parser = new GitignoreParser(app.vault);
    this.scanner = new FileScanner(app.vault);
  }

  async display(): Promise<void> {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("better-gitignore-settings");

    // Header
    containerEl.createEl("h1", { text: "Better Gitignore" });
    containerEl.createEl("p", {
      text: "Manage your .gitignore file with quick templates and see which files are being ignored.",
      cls: "setting-item-description",
    });

    // Quick Templates Section
    await this.createTemplatesSection(containerEl);

    // Editable .gitignore
    await this.createGitignoreEditor(containerEl);

    // Ignored Files Preview
    await this.createIgnoredFilesPreview(containerEl);
  }

  private async createTemplatesSection(containerEl: HTMLElement): Promise<void> {
    const section = containerEl.createDiv({ cls: "templates-section" });

    new Setting(section)
      .setName("Quick Templates")
      .setDesc("Toggle common .gitignore patterns for Obsidian")
      .setHeading();

    const grid = section.createDiv({ cls: "templates-grid" });

    // Read current gitignore to check which patterns are already present
    const currentContent = await this.parser.read();

    for (const template of OBSIDIAN_TEMPLATES) {
      await this.createTemplateToggle(grid, template, currentContent);
    }
  }

  private async createTemplateToggle(
    container: HTMLElement,
    template: GitignoreTemplate,
    currentContent: string
  ): Promise<void> {
    const item = container.createDiv({ cls: "template-item" });

    const toggle = item.createEl("label", { cls: "template-toggle" });
    const checkbox = toggle.createEl("input", { type: "checkbox" });

    // Check if pattern exists in current gitignore
    const isPatternPresent = this.isPatternInContent(template.pattern, currentContent);
    checkbox.checked = isPatternPresent;

    // Store checkbox reference for later updates
    this.checkboxes.set(template.id, checkbox);

    checkbox.addEventListener("change", async () => {
      await this.togglePattern(template.pattern, checkbox.checked);
    });

    const content = toggle.createDiv({ cls: "template-content" });
    content.createDiv({ cls: "template-name", text: template.name });
    content.createDiv({ cls: "template-pattern", text: template.pattern });
    content.createDiv({
      cls: "template-description",
      text: template.description,
    });
  }

  private isPatternInContent(pattern: string, content: string): boolean {
    const lines = content.split("\n").map(l => l.trim());
    return lines.includes(pattern);
  }

  private async togglePattern(pattern: string, add: boolean): Promise<void> {
    if (!this.editorTextarea) return;

    let content = this.editorTextarea.getValue();
    const lines = content.split("\n");

    if (add) {
      // Add pattern if not already present
      if (!this.isPatternInContent(pattern, content)) {
        // Add to end, but before any trailing empty lines
        let insertIndex = lines.length;
        while (insertIndex > 0 && lines[insertIndex - 1].trim() === "") {
          insertIndex--;
        }
        lines.splice(insertIndex, 0, pattern);
      }
    } else {
      // Remove pattern
      const filteredLines = lines.filter(line => line.trim() !== pattern);
      lines.length = 0;
      lines.push(...filteredLines);
    }

    content = lines.join("\n");

    // Update textarea
    this.editorTextarea.setValue(content);

    // Save to file
    await this.parser.write(content);

    // Refresh ignored files preview
    await this.updateIgnoredFilesPreview();
  }

  private async createGitignoreEditor(containerEl: HTMLElement): Promise<void> {
    const section = containerEl.createDiv({ cls: "gitignore-editor-section" });

    new Setting(section)
      .setName(".gitignore Editor")
      .setDesc("Edit your .gitignore file directly. Changes are saved automatically.")
      .setHeading();

    const editorContainer = section.createDiv({ cls: "gitignore-editor-container" });

    this.editorTextarea = new TextAreaComponent(editorContainer);

    // Load current content
    const content = await this.parser.read();
    this.editorTextarea.setValue(content);
    this.editorTextarea.setPlaceholder(
      "# Add patterns to ignore\n.DS_Store\nnode_modules/\n*.log"
    );
    this.editorTextarea.inputEl.addClass("gitignore-editor");
    this.editorTextarea.inputEl.rows = 12;

    // Debounced save on input
    const debouncedSave = debounce(async () => {
      if (!this.editorTextarea) return;
      const newContent = this.editorTextarea.getValue();
      await this.parser.write(newContent);
      await this.syncCheckboxesWithContent(newContent);
      await this.updateIgnoredFilesPreview();
    }, 500, true);

    this.editorTextarea.inputEl.addEventListener("input", () => {
      debouncedSave();
    });

    // Status indicator
    const statusBar = section.createDiv({ cls: "editor-status" });
    statusBar.createSpan({ text: "Auto-saves as you type", cls: "status-text" });
  }

  private async syncCheckboxesWithContent(content: string): Promise<void> {
    for (const template of OBSIDIAN_TEMPLATES) {
      const checkbox = this.checkboxes.get(template.id);
      if (checkbox) {
        const isPresent = this.isPatternInContent(template.pattern, content);
        checkbox.checked = isPresent;
      }
    }
  }

  private async createIgnoredFilesPreview(
    containerEl: HTMLElement
  ): Promise<void> {
    const section = containerEl.createDiv({ cls: "ignored-files-section" });

    const header = new Setting(section)
      .setName("Ignored Files")
      .setDesc("Files currently matched by your .gitignore patterns")
      .setHeading();

    header.addButton((btn) =>
      btn.setButtonText("Refresh").onClick(async () => {
        await this.updateIgnoredFilesPreview();
      })
    );

    this.ignoredFilesEl = section.createDiv({ cls: "ignored-files-list" });
    await this.updateIgnoredFilesPreview();
  }

  private async updateIgnoredFilesPreview(): Promise<void> {
    if (!this.ignoredFilesEl) return;

    this.ignoredFilesEl.empty();
    this.ignoredFilesEl.createDiv({
      cls: "loading",
      text: "Scanning files...",
    });

    try {
      const content = await this.parser.read();
      const patterns = content
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"));

      const ignoredFiles = await this.scanner.getIgnoredFiles(patterns);

      this.ignoredFilesEl.empty();

      if (ignoredFiles.length === 0) {
        this.ignoredFilesEl.createDiv({
          cls: "empty-state",
          text: "No files are currently being ignored.",
        });
        return;
      }

      const list = this.ignoredFilesEl.createEl("ul", { cls: "files-list" });
      const maxDisplay = 50;

      for (let i = 0; i < Math.min(ignoredFiles.length, maxDisplay); i++) {
        list.createEl("li", { text: ignoredFiles[i] });
      }

      if (ignoredFiles.length > maxDisplay) {
        this.ignoredFilesEl.createDiv({
          cls: "more-files",
          text: `... and ${ignoredFiles.length - maxDisplay} more files`,
        });
      }
    } catch (e) {
      this.ignoredFilesEl.empty();
      this.ignoredFilesEl.createDiv({
        cls: "error",
        text: "Error scanning files",
      });
    }
  }
}
