# Better Gitignore

A beautiful `.gitignore` editor with quick templates for Obsidian-specific files and live preview of ignored files.

## Features

- **Quick Templates**: One-click toggles for common Obsidian files to ignore
  - `.obsidian/workspace.json`
  - `.obsidian/workspace-mobile.json`
  - `.trash/`
  - `.DS_Store` (macOS)
  - `Thumbs.db` (Windows)
  - And more...
- **Live Editor**: Edit your `.gitignore` directly with syntax highlighting
- **Ignored Files Preview**: See which files are currently being ignored in real-time
- **Auto-Save**: Changes are saved automatically with debouncing
- **Managed Section**: Plugin patterns are kept in a dedicated section, preserving your custom patterns
- **Responsive Design**: Works great on desktop and mobile

## Installation

### From Community Plugins

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Better Gitignore"
4. Install and enable the plugin

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder in your vault: `.obsidian/plugins/better-gitignore/`
3. Copy the files into this folder
4. Restart Obsidian
5. Enable the plugin in Settings → Community Plugins

## Usage

1. Open Settings → Better Gitignore
2. Toggle the templates you want to add/remove from `.gitignore`
3. Use the editor for custom patterns
4. Check the "Ignored Files" section to verify your patterns work

### Templates

| Template | Pattern | Description |
|----------|---------|-------------|
| Workspace | `.obsidian/workspace.json` | Obsidian workspace state |
| Mobile Workspace | `.obsidian/workspace-mobile.json` | Mobile workspace state |
| Trash | `.trash/` | Obsidian trash folder |
| DS_Store | `.DS_Store` | macOS folder metadata |
| Thumbs.db | `Thumbs.db` | Windows thumbnail cache |
| Node Modules | `node_modules/` | NPM dependencies |
| Obsidian Cache | `.obsidian/cache` | Obsidian cache files |
| Graph | `.obsidian/graph.json` | Graph view state |
| Backlinks | `.obsidian/backlink.json` | Backlinks cache |
| Plugins Data | `.obsidian/plugins/*/data.json` | Plugin data files |

## Development

```bash
# Install dependencies
bun install

# Build for development (with watch)
bun run dev

# Build for production
bun run build
```

## Part of the BytesAndParty Plugin Suite

This plugin works great alongside other plugins from the same author:

- [Auto Categories](https://github.com/BytesAndParty/Obsidian_AutoCategories) - Automatically create category pages from frontmatter
- [Command Overview](https://github.com/BytesAndParty/CommandOverview) - Quick command palette with shortcuts
- [Company Knowledge Hub](https://github.com/BytesAndParty/CompanyKnowledgeHub) - Publish notes to a shared knowledge base
- [Customer Tag](https://github.com/BytesAndParty/CustomerTag) - Organize notes by customer tags

## License

MIT License - see [LICENSE](LICENSE) for details.
