export interface GitignoreTemplate {
  id: string;
  name: string;
  description: string;
  pattern: string;
  defaultEnabled: boolean;
}

export const OBSIDIAN_TEMPLATES: GitignoreTemplate[] = [
  {
    id: "workspaceJson",
    name: "Workspace",
    description: "Current workspace layout",
    pattern: ".obsidian/workspace.json",
    defaultEnabled: true,
  },
  {
    id: "workspaceMobileJson",
    name: "Mobile Workspace",
    description: "Mobile workspace layout",
    pattern: ".obsidian/workspace-mobile.json",
    defaultEnabled: true,
  },
  {
    id: "trash",
    name: "Trash Folder",
    description: "Obsidian trash folder",
    pattern: ".trash/",
    defaultEnabled: false,
  },
  {
    id: "pluginData",
    name: "Plugin Data",
    description: "Plugin settings and cache",
    pattern: ".obsidian/plugins/*/data.json",
    defaultEnabled: false,
  },
  {
    id: "hotkeys",
    name: "Hotkeys",
    description: "Custom keyboard shortcuts",
    pattern: ".obsidian/hotkeys.json",
    defaultEnabled: false,
  },
  {
    id: "appJson",
    name: "App Settings",
    description: "Application preferences",
    pattern: ".obsidian/app.json",
    defaultEnabled: false,
  },
  {
    id: "appearanceJson",
    name: "Appearance",
    description: "Theme and appearance settings",
    pattern: ".obsidian/appearance.json",
    defaultEnabled: false,
  },
  {
    id: "graphJson",
    name: "Graph Settings",
    description: "Graph view configuration",
    pattern: ".obsidian/graph.json",
    defaultEnabled: false,
  },
  {
    id: "dsStore",
    name: ".DS_Store",
    description: "macOS folder metadata",
    pattern: ".DS_Store",
    defaultEnabled: true,
  },
  {
    id: "thumbsDb",
    name: "Thumbs.db",
    description: "Windows thumbnail cache",
    pattern: "Thumbs.db",
    defaultEnabled: true,
  },
];

export function getDefaultTemplateSettings(): Record<string, boolean> {
  const settings: Record<string, boolean> = {};
  for (const template of OBSIDIAN_TEMPLATES) {
    settings[template.id] = template.defaultEnabled;
  }
  return settings;
}
