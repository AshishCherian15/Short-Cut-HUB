# ShortcutHub

ShortcutHub is a practical and visually polished browser start page that helps you launch your most-used websites in seconds.

It is designed to be:

- Fast for daily use
- Easy to customize
- Clean in appearance
- Lightweight with no build step

## Why This Project Exists

### Idea
A single place for your most important websites, with a modern look and easy editing.

### Problem
Default browser start pages and bookmark bars become cluttered quickly. It gets hard to organize links by context (AI, work, social, daily) and even harder to personalize appearance.

### Solution
ShortcutHub provides:

- Grouped shortcuts with drag-and-drop ordering
- Fast search by name, URL, or group
- Inline edit and delete actions for every shortcut
- Persistent themes and custom backgrounds
- Import and export for backup and migration

## Features

- Multi-file structure for easier maintenance:
  - index.html
  - styles.css
  - app.js
- Editable shortcuts with validation
- Default shortcuts preloaded:
  - YouTube
  - Gmail
  - Claude
  - ChatGPT
  - Gemini
  - Instagram
  - WhatsApp
  - LinkedIn
  - Discord
- Group support for better organization
- Drag-and-drop reordering of shortcuts
- Search across name, URL, and group
- Background options:
  - Image URL
  - Video URL
  - YouTube URL
- Theme toggle (dark/light)
- Export and import backup file (JSON)
- About section that explains the project story

## Project Structure

- index.html: page markup and sections
- styles.css: design system, responsive layout, components, dialogs, animations
- app.js: data model, rendering, state persistence, handlers, and utility functions

## Getting Started

### 1. Download or clone

Use either:

- Download ZIP from repository and extract
- Or clone with Git if this is in a remote repo

### 2. Open project folder

Open the folder in VS Code.

### 3. Run locally in any browser

No install required.

You can open index.html directly in any modern browser:

- Google Chrome
- Microsoft Edge
- Firefox
- Brave

For best behavior in development, use a local static server (optional):

- VS Code Live Server extension
- Any local server command you already use

## Offline Setup for All Users

If you want everyone to use this fully offline with their own saved data:

1. Share a ZIP that includes at least these files:
  - index.html
  - styles.css
  - app.js
  - about.html
2. Each user extracts the ZIP on their own computer.
3. Each user opens index.html in their own browser.

How storage works offline:

- ShortcutHub uses browser localStorage.
- Storage is per browser profile and per device.
- One user's shortcuts/settings do not affect another user.
- Clearing site data/local storage in that browser will reset saved data.

## Deploy on Vercel (Creator Setup)

This project is static and works perfectly on Vercel.

### Option A: Deploy from GitHub (recommended)

1. Push your latest code to GitHub.
2. Go to vercel.com and sign in.
3. Click Add New Project.
4. Import your repository.
5. Framework preset: Other.
6. Build command: leave empty.
7. Output directory: leave empty.
8. Click Deploy.

### Option B: Deploy using Vercel CLI

1. Install CLI:
  - npm i -g vercel
2. In project folder, run:
  - vercel
3. For production deployment, run:
  - vercel --prod

After deployment:

- Vercel gives you a live URL.
- Every visitor gets their own browser localStorage.
- Import/Export backup still works per user.

## How to Use

### Add a shortcut

1. Click Add Shortcut.
2. Fill Name, URL, Group, optional Custom Icon URL.
3. Click Save Shortcut.

### Edit a shortcut

1. Hover a card.
2. Click E button.
3. Update values and save.

### Delete a shortcut

1. Click X on a card.
2. Confirm deletion.

### Reorder shortcuts

Drag one shortcut card and drop it over another.

### Search quickly

Use the search box to filter by:

- Name
- URL
- Group

### Change background

1. Click Background.
2. Choose type (Image / Video / YouTube).
3. Paste source URL.
4. Apply.

### Switch theme

Click Theme to toggle dark and light modes.

### Backup data

Click Export to download a JSON backup.

### Restore data

1. Click Import.
2. Select your exported JSON file.

## Data Storage

ShortcutHub stores data in browser localStorage under:

- shortcuthub_data_v5

Stored fields include:

- shortcuts
- theme
- background
- settings

Default experience for new users:

- Background: YouTube video https://youtu.be/kf4MH987TrI?si=h64zyfxgZIjPlmDy
- Background audio: enabled
- Default audio volume: 50%

## Customization Guide

### Change title and tagline

Edit top panel text in index.html.

### Change color style

Update CSS variables in styles.css under :root and body.light.

### Modify default shortcuts

Edit DEFAULT_SHORTCUTS array in app.js.

### Extend with new widgets

Recommended approach:

1. Add section markup in index.html.
2. Add styles in styles.css.
3. Add state + rendering in app.js.

## Practical Roadmap Ideas

- Folder support (nested shortcuts)
- Per-group reorder persistence
- Keyboard shortcuts for add/edit actions
- Notes widget
- Weather widget
- Pomodoro widget
- Browser extension packaging

## About the Author

Built by Ashish.

## License

This project is licensed under the MIT License.
See LICENSE for details.
