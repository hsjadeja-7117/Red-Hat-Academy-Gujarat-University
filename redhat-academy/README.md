# Red Hat Academy - Chapter Website

A static, no-build-tools website for our Red Hat Academy student chapter.
Plain HTML, CSS, and JavaScript only - no frameworks, no `npm install`,
nothing to compile. Open `index.html` in a browser and it works.

## File structure

```
├── index.html          Home page
├── team.html            Leadership & Team page
├── faq.html              FAQ page
├── contact.html         Contact page
├── data.json            ALL editable text, emails, and image paths live here
├── vercel.json           Tells Vercel to serve clean URLs (no ".html" in the address bar)
├── css/
│   └── style.css        The one stylesheet used by every page
├── js/
│   └── script.js        The one script used by every page
└── assets/               Logos, photos, and the QR code image
```

## The most important idea: edit `data.json`, not the HTML

Every page is mostly empty `<div>`/`<section>` containers in the HTML.
When a page loads, `js/script.js` fetches `data.json` and fills those
containers in with real text and image paths.

**This means: to change a name, an email, an FAQ answer, or a photo, you
only ever need to edit `data.json`.** You should not need to touch
`index.html`, `team.html`, `faq.html`, `contact.html`, `style.css`, or
`script.js` for routine content updates.

`data.json` is plain JSON, so a couple of rules matter:
- Every piece of text must be wrapped in double quotes `"like this"`.
- There is never a comma after the *last* item in a list `[ ]` or object `{ }`.
- If you're not sure the file is still valid after editing it, paste it
  into an online "JSON validator" before committing - a single missing
  comma or quote will stop the whole site from loading its content.

## Replacing the placeholder images

Everything in `/assets` right now is an intentional placeholder (see the
comment at the top of each `.svg` file for specifics):

| File | Replace with |
|---|---|
| `assets/university-logo.svg` | Your real university logo |
| `assets/redhat-logo.svg` | The **official** Red Hat Academy logo file Red Hat gave you (this placeholder is an original design, not Red Hat's real trademarked logo, since we can't ship a copy of that here) |
| `assets/avatar-placeholder.svg` | Real photos of the HOD, Faculty, Ambassador, and each core team member |
| `assets/whatsapp-qr-placeholder.svg` | A real, generated QR code pointing at your WhatsApp community invite link |
| `assets/hero-illustration.svg` | Optional - a real photo, if you'd rather use one than the illustration |

After adding a new image file to `/assets`, update the matching path in
`data.json` (e.g. `"universityLogo": "assets/your-new-logo.png"`). No code
changes needed - the pages read that path automatically.

## How the "clean URLs" work

The brief asks for URLs like `/team` instead of `/team.html`. We handle
this with `vercel.json`, using Vercel's built-in `"cleanUrls": true`
setting: Vercel automatically serves `team.html` when a visitor requests
`/team`, and redirects anyone who types `/team.html` to `/team`. Nothing
else in the project needs to know about this - it's handled entirely by
Vercel at hosting time.

## Deploying

1. Commit and push this whole folder to a GitHub repository.
2. In Vercel, choose "Import Project" and select that repository.
3. Framework preset: choose "Other" (this is a plain static site - no
   build command or output directory is needed).
4. Deploy. Vercel will pick up `vercel.json` automatically.

## Running it locally before deploying

Because the pages use `fetch()` to load `data.json`, opening `index.html`
directly as a `file://` URL will fail in some browsers (fetch requests to
local files are blocked for security reasons). Instead, serve the folder
with a tiny local web server, for example:

```bash
# From inside this project folder, if you have Python installed:
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```
