# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static GitHub Pages personal site using the "Time Machine" theme (Jon Rohan, 2012). There is no build system, no package manager, and no compilation step — changes to files are deployed directly via `git push`.

## Development

No build, lint, or test tooling exists. To preview locally, serve the root directory with any static HTTP server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Site Structure

- `index.html` — sole HTML page; all content is hardcoded here
- `stylesheets/stylesheet.css` — primary theme styles
- `stylesheets/pygment_trac.css` — syntax-highlight styles for code blocks
- `javascripts/script.js` — jQuery 1.7.1 logic (line-number injection for `<pre>` blocks, scroll-spy back-to-top button)
- `javascripts/main.js` — empty boilerplate; not used
- `images/` — theme sprite/icon assets (PNG)
- `params.json` — GitHub Pages generator metadata (site name, tagline, Google Analytics placeholder)

## Key Conventions

- jQuery 1.7.1 is loaded from a Google CDN (`ajax.googleapis.com`). Do not replace it with a local copy or a newer version without testing `script.js` compatibility.
- `main.js` is included by the HTML but contains no code; new JavaScript should go there or in `script.js`.
- `params.json` is consumed by the GitHub Pages generator — keep its keys intact if modifying.
- Deployment happens automatically on push to the default branch (`master`) via GitHub Pages.
