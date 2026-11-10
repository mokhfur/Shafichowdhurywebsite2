# Shafi Chowdhury — personal website

Static website (HTML, CSS, vanilla JavaScript). No build step is needed to host it:
upload the contents of this folder to any static host (Hostinger, Netlify, cPanel, S3, etc.).

## Before launch
1. Replace `https://www.shafichowdhury.com` with the final domain in every .html file,
   `sitemap.xml`, `robots.txt` and `llms.txt` (search and replace).
2. Replace every item marked with a dashed gold "◇ … to be supplied" tag (search for `class="ph"`).
3. Contact form: set `FORM_ENDPOINT` at the top of `assets/js/site.js` to a form service URL
   (e.g. Formspree). Until then the form validates but tells visitors their message was not sent.
4. Have `privacy.html` reviewed.

## Editing
- Career milestones (Home and About): `assets/js/timeline.js`
- Styles and the strict colour palette: `assets/css/site.css` (palette documented at the top; do not add colours)
- New article: copy a file in `/insights/`, add a card to `insights.html`, add the URL to `sitemap.xml`.
- `artifact-home.html` is only for the Claude preview and can be deleted.
