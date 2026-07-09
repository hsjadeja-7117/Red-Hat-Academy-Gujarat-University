# Red Hat Academy - Chapter Website

A static, no-build-tools website for our Red Hat Academy student chapter.
Plain HTML, CSS, and JavaScript only - no frameworks, no `npm install`,
nothing to compile.

## File structure

```
├── index.html          Home page (all text is written directly here)
├── team.html             Leadership & Team page (loads people from data.json)
├── faq.html               FAQ page (all 10 Q&As are written directly here)
├── contact.html          Contact page (all text is written directly here)
├── data.json              ONLY the team roster - photo/name/role/description
├── vercel.json             Tells Vercel to serve clean URLs (no ".html")
├── css/
│   └── style.css          The one stylesheet used by every page
├── js/
│   └── script.js          Menu, accordion, and active-link behavior + team loading
└── assets/
    ├── WHERE_TO_PUT_IMAGES.txt   Exact filenames the site is looking for
    └── team/                      Team member photos go here
```

## Where does content live?

**Most page text lives directly inside its own HTML file.** Open
`index.html`, `faq.html`, or `contact.html` in a text editor and you'll
find real sentences, headings, and email addresses - not placeholders.
To change any of that content, edit the text directly in that file
(use Ctrl+F / Cmd+F to jump to what you're looking for).

**The Leadership & Team page is the one exception.** Because the team
roster changes every year, `team.html` fetches `data.json` on page load
and uses it to fill in each person's **photo, name, role, and
description**. To add, remove, or edit a team member, edit `data.json` -
you don't need to touch `team.html` for that.

`data.json` is plain JSON, so a couple of rules matter if you edit it:
- Every piece of text must be wrapped in double quotes `"like this"`.
- There is never a comma after the *last* item in a list `[ ]` or object `{ }`.
- If you're not sure the file is still valid after editing it, paste it
  into an online "JSON validator" before committing.

## How images work (no placeholder image files are shipped)

Every spot where a photo, logo, or QR code goes uses the same pattern,
called a "media frame" (see `css/style.css`, section 5, for the full
explanation with comments). In short:

```html
<div class="media-frame media-frame--avatar-lg">
  <span class="media-frame__placeholder">Photo will go here</span>
  <img class="media-frame__img" src="assets/team/hod.jpg"
       alt="Photo of Dr. Full Name" onerror="this.style.display='none'">
</div>
```

- If the image at `src` loads successfully, it covers the placeholder
  text completely - visitors just see the photo.
- If the image is missing, or the path/filename is wrong, the browser
  can't load it, so the placeholder text stays visible instead of an
  ugly broken-image icon.

**This means you can safely commit this project before you have real
photos** - every image slot will just show clear instructional text
until you add the real file. See `assets/WHERE_TO_PUT_IMAGES.txt` for
the exact filenames each page is already looking for.

### If you added an image and it's still not showing up

1. **Check the filename matches exactly**, including the extension. The
   code looks for `assets/university-logo.jpg` - a file named
   `University-Logo.PNG` will NOT match, even though it looks similar to
   a human. Either rename your file to match exactly, or update the
   `src` (for logos/hero/QR - edit the relevant `.html` file) or `photo`
   field (for team members - edit `data.json`) to match your file's real
   name.
2. **Check capitalization.** Your own computer usually ignores whether a
   filename is uppercase or lowercase, but the live Vercel server does
   NOT. `Hero.jpg` and `hero.jpg` are different files on Vercel.
3. **Check the file actually got committed to GitHub.** Open the
   `assets` folder on GitHub.com and confirm the image file is really
   there, not just on your own computer.
4. **Check your Vercel "Root Directory" setting** points at the folder
   that actually contains `index.html` and `assets/` (Project Settings →
   Build and Deployment → Root Directory). If that's set incorrectly,
   *every* file on the site - HTML, CSS, JS, and images - will fail to
   load, not just one image.

## How the "clean URLs" work

`vercel.json` uses Vercel's built-in `"cleanUrls": true` setting: Vercel
automatically serves `team.html` when a visitor requests `/team`, and
redirects anyone who types `/team.html` to `/team`. Nothing else in the
project needs to know about this - it's handled entirely by Vercel at
hosting time.

## Deploying

1. Commit and push this whole folder to a GitHub repository.
2. In Vercel, choose "Import Project" and select that repository.
3. Framework preset: "Other" (this is a plain static site - no build
   command or output directory is needed).
4. If your site files sit inside a subfolder of the repo (not the repo
   root), set that folder as the **Root Directory** in Project Settings
   → Build and Deployment.
5. Deploy. Vercel will pick up `vercel.json` automatically.

## Running it locally before deploying

Because `team.html` uses `fetch()` to load `data.json`, opening it
directly as a `file://` URL will fail in some browsers (fetch requests
to local files are blocked for security reasons). Instead, serve the
folder with a tiny local web server, for example:

```bash
# From inside this project folder, if you have Python installed:
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```
