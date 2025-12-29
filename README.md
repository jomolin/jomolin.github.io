# Newtab Homepage

A customizable browser homepage with 90s terminal aesthetics built on [terminal.css](https://terminalcss.xyz/).

![Terminal Homepage](https://img.shields.io/badge/style-terminal-green?style=flat-square)

## Features

- **Speed Dial** - Quick access to your favorite sites
- **Weather Display** - Current conditions via wttr.in
- **RSS Feed Reader** - Aggregates your feeds with previews
- **Google Calendar** - Today's agenda view
- **Internet Radio** - Lightweight streaming player
- **iMood Integration** - Display and update your mood
- **Dark/Light Themes** - Toggle between themes
- **Local Storage** - All settings stored in your browser
- **Privacy-First** - No tracking, no server-side data

## Quick Start

### 1. Deploy to GitHub Pages

Fork this repo or create a new repository with these files:
- `index.html`
- `style.css`
- `script.js`
- `config.js`
- `setup-sidebar.js`
- `setup.html` (optional standalone setup page)

Enable GitHub Pages in your repository settings.

### 2. Configure Your Homepage

Visit your deployed site and click the ⚙ (gear icon) in the bottom-right corner.

The settings sidebar will open where you can configure:

**Personal Info:**
- Username (displayed in header)
- City (for weather)
- iMood username

**Speed Dial Links:**
Format: `name|url` (one per line)
```
github|https://github.com
reddit|https://reddit.com
```

**RSS Feeds:**
One URL per line
```
https://example.com/feed.xml
https://another-site.com/rss
```

**Google Calendar:**
- API Key (optional, for real-time sync)
- Calendar IDs (one per line)
- Public iCal URLs (alternative to API)

**Radio Stations:**
Format: `name|stream_url` (one per line)
```
Jazz FM|https://stream.example.com/jazz.mp3
Classical|https://stream.example.com/classical.aac
```

Click **Save Configuration** to apply changes (page will reload automatically).

## Configuration Details

### Google Calendar Setup

You have two options for calendar integration:

**Option 1: Public Calendar URLs** (Simple, Free)
1. Make your Google Calendar public
2. Get the public iCal URL from calendar settings
3. Paste into "Public iCal URLs" field
4. Note: Has 12-24 hour sync delay

**Option 2: Google Calendar API** (Real-time, Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google Calendar API"
4. Create an API Key
5. **Restrict the API key:**
   - Edit the API key
   - Under "Application restrictions" → select "HTTP referrers"
   - Add: `https://YOURUSERNAME.github.io/*`
   - Add: `http://localhost`
   - Add: `http://127.0.0.1`
6. Paste the restricted API key into settings

**Important:** Once restricted to your domain, the API key is safe to commit to your public repository - it only works on your specific domain.

### Finding Radio Stream URLs

- Look for direct stream URLs (`.mp3`, `.aac`, `.ogg`)
- Use browser DevTools (Network tab) while playing a station
- Check station websites for stream URLs
- Note: Some streams may not work due to CORS restrictions

### Import/Export Settings

- **Export:** Downloads your config as a JSON file for backup
- **Import:** Load a previously saved config
- Share configs between devices or browsers

## Privacy & Security

**Your data stays local:**
- All settings stored in browser localStorage
- No server-side storage
- API keys never leave your browser
- Each visitor configures their own instance

**Bot protection:**
- Empty config = no API calls
- Bots won't trigger requests to your APIs
- Your API quota is only used when you use the site

## Customization

### Changing Colors

Terminal.css uses CSS variables. Override them in `style.css`:

```css
:root {
  --primary-color: #33ff33;  /* Green terminal */
  --background-color: #000000;
  --font-color: #33ff33;
}
```

Popular terminal themes:
- **Classic Green:** `#33ff33`
- **Amber:** `#ffb000`
- **Cyan** (default): `#62c4ff`
- **White/Gray:** `#c0c0c0`

### Refresh Intervals

Edit `config.js`:
```javascript
refresh: {
  clock: 1000,        // 1 second
  weather: 1800000,   // 30 minutes
  rss: 600000,        // 10 minutes
  calendar: 600000    // 10 minutes
}
```

## Browser Extension

### Chrome/Edge
Create `manifest.json`:
```json
{
  "manifest_version": 3,
  "name": "Terminal Homepage",
  "version": "1.0",
  "chrome_url_overrides": {
    "newtab": "https://yourusername.github.io"
  }
}
```
Load as unpacked extension.

### Firefox
Use an extension like "New Tab Override" and set your GitHub Pages URL.

## Local Development

**Don't open `index.html` directly in your browser** - localStorage and fetch() won't work with `file://` protocol.

Instead, run a local server:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server -p 8000
```

Then visit: `http://localhost:8000`

## Troubleshooting

**Speed dial/calendar not loading:**
- Are you running on `http://localhost` or `https://` (not `file://`)?
- Check browser console for errors
- Verify settings are saved (open settings sidebar)

**Weather not displaying:**
- Check city name spelling
- Try coordinates: `40.7128,-74.0060`
- wttr.in may be slow - wait 30 seconds

**Calendar not syncing:**
- **Public URLs:** Can take 12-24 hours to reflect new events
- **API Key:** Verify it's restricted to your domain
- **API Key:** Wait 5-10 minutes after creating for activation
- Check calendar IDs are correct

**RSS feeds not loading:**
- Some feeds block CORS
- corsproxy.io may have rate limits
- Try fewer feeds if hitting limits

**Radio not playing:**
- Verify stream URL is direct (`.mp3`, `.aac`)
- Some streams require CORS headers
- Try different streams

**Settings not saving:**
- Running on local server (not `file://`)?
- Check browser console for errors
- Try clearing localStorage and re-configuring

## Credits

- Built with [terminal.css](https://terminalcss.xyz/) by Emergent Works
- Weather by [wttr.in](https://wttr.in/)
- iMood by [imood.com](https://www.imood.com/)

## License

MIT License - feel free to fork and customize!

## Contributing

Issues and pull requests welcome! This is a personal project but improvements are appreciated.

---

**Enjoy your retro terminal homepage!** 🖥️✨
