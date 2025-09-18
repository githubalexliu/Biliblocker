## Biliblocker (Firefox MV3 Extension)

Minimal Firefox Manifest V3 extension scaffold with popup, background, and content script.

### Prerequisites
- Node.js 18+
- Firefox Desktop

### Install
```bash
npm install
```

### Run in Firefox
```bash
npm run start
```

### Build
```bash
npm run build
```

### Structure
```
manifest.json
background/background.js
content/content.js
popup/popup.html
popup/popup.css
popup/popup.js
```

### Notes
- Popup toggle sends a message to the content script to toggle a highlight outline.
- Reduce `<all_urls>` and requested permissions for production.



