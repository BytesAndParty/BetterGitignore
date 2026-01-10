import { Vault, TFile } from "obsidian";

const MANAGED_SECTION_START = "# === BetterGitignore Managed ===";
const MANAGED_SECTION_END = "# === End BetterGitignore ===";

export interface ParsedGitignore {
  beforeManaged: string;
  managedPatterns: string[];
  afterManaged: string;
  raw: string;
}

export class GitignoreParser {
  private vault: Vault;

  constructor(vault: Vault) {
    this.vault = vault;
  }

  async exists(): Promise<boolean> {
    return await this.vault.adapter.exists(".gitignore");
  }

  async read(): Promise<string> {
    if (await this.exists()) {
      return await this.vault.adapter.read(".gitignore");
    }
    return "";
  }

  async write(content: string): Promise<void> {
    await this.vault.adapter.write(".gitignore", content);
  }

  parse(content: string): ParsedGitignore {
    const startIdx = content.indexOf(MANAGED_SECTION_START);
    const endIdx = content.indexOf(MANAGED_SECTION_END);

    if (startIdx === -1 || endIdx === -1) {
      return {
        beforeManaged: content,
        managedPatterns: [],
        afterManaged: "",
        raw: content,
      };
    }

    const beforeManaged = content.substring(0, startIdx).trim();
    const managedSection = content.substring(
      startIdx + MANAGED_SECTION_START.length,
      endIdx
    );
    const afterManaged = content
      .substring(endIdx + MANAGED_SECTION_END.length)
      .trim();

    const managedPatterns = managedSection
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    return {
      beforeManaged,
      managedPatterns,
      afterManaged,
      raw: content,
    };
  }

  build(patterns: string[], customContent: string): string {
    const lines: string[] = [];

    // Add managed section
    if (patterns.length > 0) {
      lines.push(MANAGED_SECTION_START);
      lines.push(...patterns);
      lines.push(MANAGED_SECTION_END);
    }

    // Add custom content
    if (customContent.trim()) {
      if (lines.length > 0) {
        lines.push("");
      }
      lines.push(customContent.trim());
    }

    return lines.join("\n") + "\n";
  }

  async updateManagedPatterns(patterns: string[]): Promise<void> {
    const content = await this.read();
    const parsed = this.parse(content);

    // Combine before and after as custom content
    let customContent = "";
    if (parsed.beforeManaged) {
      customContent += parsed.beforeManaged;
    }
    if (parsed.afterManaged) {
      if (customContent) {
        customContent += "\n\n";
      }
      customContent += parsed.afterManaged;
    }

    const newContent = this.build(patterns, customContent);
    await this.write(newContent);
  }

  async getCustomContent(): Promise<string> {
    const content = await this.read();
    const parsed = this.parse(content);

    let customContent = "";
    if (parsed.beforeManaged) {
      customContent += parsed.beforeManaged;
    }
    if (parsed.afterManaged) {
      if (customContent) {
        customContent += "\n\n";
      }
      customContent += parsed.afterManaged;
    }

    return customContent;
  }

  async setCustomContent(customContent: string): Promise<void> {
    const content = await this.read();
    const parsed = this.parse(content);
    const newContent = this.build(parsed.managedPatterns, customContent);
    await this.write(newContent);
  }
}
