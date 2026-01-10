import { Vault, TFile, TFolder, TAbstractFile } from "obsidian";

export class FileScanner {
  private vault: Vault;

  constructor(vault: Vault) {
    this.vault = vault;
  }

  async getAllFiles(): Promise<string[]> {
    const files: string[] = [];

    const processFolder = async (folder: TFolder) => {
      for (const child of folder.children) {
        if (child instanceof TFile) {
          files.push(child.path);
        } else if (child instanceof TFolder) {
          files.push(child.path + "/");
          await processFolder(child);
        }
      }
    };

    await processFolder(this.vault.getRoot());

    // Also include hidden files via adapter
    try {
      const hiddenFiles = await this.scanHiddenFiles("");
      files.push(...hiddenFiles);
    } catch (e) {
      // Ignore errors for hidden files
    }

    return files;
  }

  private async scanHiddenFiles(path: string): Promise<string[]> {
    const files: string[] = [];
    const basePath = path || ".";

    try {
      const items = await this.vault.adapter.list(basePath);

      for (const file of items.files) {
        if (file.startsWith(".") || file.includes("/.")) {
          files.push(file);
        }
      }

      for (const folder of items.folders) {
        if (folder.startsWith(".") || folder.includes("/.")) {
          files.push(folder + "/");
          const subFiles = await this.scanHiddenFiles(folder);
          files.push(...subFiles);
        }
      }
    } catch (e) {
      // Ignore access errors
    }

    return files;
  }

  matchesPattern(filePath: string, pattern: string): boolean {
    // Normalize paths
    const normalizedPath = filePath.replace(/\\/g, "/");
    const normalizedPattern = pattern.replace(/\\/g, "/");

    // Handle negation patterns
    if (normalizedPattern.startsWith("!")) {
      return false; // We don't handle negation in matching, only in filtering
    }

    // Handle directory patterns
    if (normalizedPattern.endsWith("/")) {
      const dirPattern = normalizedPattern.slice(0, -1);
      return (
        normalizedPath.startsWith(dirPattern + "/") ||
        normalizedPath === dirPattern + "/"
      );
    }

    // Handle glob patterns
    const regexPattern = this.globToRegex(normalizedPattern);
    return regexPattern.test(normalizedPath);
  }

  private globToRegex(pattern: string): RegExp {
    let regex = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape special regex chars
      .replace(/\*\*/g, "{{GLOBSTAR}}") // Temporarily replace **
      .replace(/\*/g, "[^/]*") // * matches anything except /
      .replace(/\?/g, "[^/]") // ? matches single char except /
      .replace(/{{GLOBSTAR}}/g, ".*"); // ** matches anything

    // If pattern doesn't start with /, it can match anywhere
    if (!pattern.startsWith("/")) {
      regex = "(^|/)" + regex;
    } else {
      regex = "^" + regex.slice(2); // Remove leading /
    }

    return new RegExp(regex + "$");
  }

  async getIgnoredFiles(patterns: string[]): Promise<string[]> {
    const allFiles = await this.getAllFiles();
    const ignoredFiles: string[] = [];

    for (const file of allFiles) {
      let isIgnored = false;

      for (const pattern of patterns) {
        if (pattern.startsWith("!")) {
          // Negation pattern
          if (this.matchesPattern(file, pattern.slice(1))) {
            isIgnored = false;
          }
        } else if (this.matchesPattern(file, pattern)) {
          isIgnored = true;
        }
      }

      if (isIgnored) {
        ignoredFiles.push(file);
      }
    }

    return ignoredFiles.sort();
  }
}
