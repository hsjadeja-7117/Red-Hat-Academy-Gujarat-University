/* =============================================================================
   RED HAT ACADEMY - SHARED JAVASCRIPT
   =============================================================================
   This single file is loaded by ALL FOUR pages (see the <script> tag near
   the bottom of each .html file). It does three jobs:

     1. Fetches data.json (our "database" of text and image paths).
     2. Builds pieces that are the same on every page: the navbar and footer.
     3. Builds the ONE section that's different per page (hero on the home
        page, tier cards on the team page, etc.) by checking a small
        "data-page" label we put on the <body> tag of each HTML file.

   Why fetch data.json instead of writing text straight into the HTML?
   Because it means a non-coder on the team can update names, emails, FAQ
   answers, or image paths by editing ONE simple JSON file, without ever
   touching HTML/CSS/JS. That is the whole point of "data-driven" pages.
============================================================================= */

/* "DOMContentLoaded" fires once the HTML has fully loaded (but before
   images have necessarily finished downloading). We wait for this event
   before touching the page, otherwise our JavaScript might try to find
   an element that the browser hasn't created yet. */
document.addEventListener('DOMContentLoaded', () => {
  loadSiteData();
});

/**
 * Fetches data.json and, once it arrives, hands the data off to the
 * functions that actually build each part of the page.
 *
 * fetch() is a built-in browser function for requesting a file (here, a
 * local JSON file) over HTTP. It returns a "Promise" - a placeholder for
 * a value that isn't ready yet. We use async/await (the `async function`
 * and `await` keywords below) instead of .then() chains because it lets
 * this asynchronous code read top-to-bottom like normal, synchronous code.
 */
async function loadSiteData() {
  try {
    // "data.json" is a relative path: the browser looks for it next to
    // whatever page is currently open (index.html, team.html, etc).
    const response = await fetch('data.json');

    // fetch() only throws an error for network failures (like being
    // offline). A missing file (404) still "succeeds" as far as fetch is
    // concerned, so we check response.ok ourselves and fail loudly if
    // the file wasn't found - this makes bugs easy to spot while learning.
    if (!response.ok) {
      throw new Error(`Could not load data.json (status ${response.status})`);
    }

    const data = await response.json(); // parses the JSON text into a JS object

    // These two run on every page.
    buildNavbar(data);
    buildFooter(data);

    // Figure out which page we're on by reading a custom attribute we
    // set on the <body> tag in each HTML file, e.g. <body data-page="home">.
    // Using a data-* attribute (instead of, say, checking the filename)
    // keeps this logic working even after Vercel's clean-URL rewrites
    // change what the address bar shows.
    const page = document.body.dataset.page;

    if (page === 'home') buildHomePage(data.home);
    if (page === 'team') buildTeamPage(data.team);
    if (page === 'faq') buildFaqPage(data.faq);
    if (page === 'contact') buildContactPage(data.contact);

    // Now that the nav links exist in the DOM, mark whichever one
    // matches the current page as "active".
    highlightActiveNavLink();

  } catch (error) {
    // If anything above fails, we log it for developers AND show a
    // friendly message in place of the navbar, so the page never just
    // looks silently broken to a visitor.
    console.error('Failed to load site data:', error);
    const navSlot = document.getElementById('navbar');
    if (navSlot) {
      navSlot.innerHTML =
        '<div class="container" style="padding:1rem;color:#EE0000;">' +
        'Could not load site content (data.json). Please refresh the page.' +
        '</div>';
    }
  }
}


/* -----------------------------------------------------------------------
   NAVBAR
   -----------------------------------------------------------------------
   Every page has an empty <nav id="navbar"></nav> placeholder in its
   HTML. We fill it in here with JavaScript, using the same data on every
   page, so the navbar can never accidentally drift out of sync between
   pages (which is a real risk when you copy/paste a navbar into 4 files
   by hand).
----------------------------------------------------------------------- */
function buildNavbar(data) {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  // Build the <li> list of nav links from data.json's "nav" array.
  // Array.map() turns each {label, path} object into an HTML string,
  // and .join('') glues all those strings together into one block.
  const linksHtml = data.nav.map(link => `
    <li>
      <a class="navbar__link" href="${link.path}" data-path="${link.path}">
        ${link.label}
      </a>
    </li>
  `).join('');

  nav.innerHTML = `
    <div class="container navbar__inner">

      <!-- Left: university logo + name -->
      <a href="/" class="navbar__logo" aria-label="${data.site.siteName} home">
        <img src="${data.site.universityLogo}" alt="${data.site.universityLogoAlt}">
        <span class="navbar__uni-name">${data.site.universityName}</span>
      </a>

      <!-- Center: page links (also doubles as the mobile dropdown) -->
      <ul class="navbar__links" id="navbarLinks">
        ${linksHtml}
      </ul>

      <!-- Hamburger button, only visible on small screens (see CSS) -->
      <button class="navbar__hamburger" id="hamburgerBtn" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>

      <!-- Right: Red Hat Academy logo -->
      <a href="https://www.redhat.com/en/services/training/red-hat-academy" target="_blank" rel="noopener" class="navbar__logo">
        <img src="${data.site.redhatLogo}" alt="${data.site.redhatLogoAlt}">
      </a>

    </div>
  `;

  setupHamburgerMenu();
}

/**
 * Wires up the hamburger button: tapping it toggles the ".is-open" class
 * on both the button (so its 3 lines animate into an "X") and the link
 * list (so CSS can expand it open - see the mobile @media block in
 * style.css).
 */
function setupHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navbarLinks');
  if (!hamburgerBtn || !navLinks) return;

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    hamburgerBtn.classList.toggle('is-open', isOpen);
    // aria-expanded tells screen readers whether the menu is open -
    // small accessibility detail that costs us one line of code.
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Convenience: tapping a link closes the mobile menu automatically,
  // so visitors don't have to tap the hamburger again after navigating.
  navLinks.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      hamburgerBtn.classList.remove('is-open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Adds the "is-active" CSS class to whichever navbar link matches the
 * current page, so it gets the red underline/color from style.css.
 *
 * We compare against window.location.pathname (the URL path the browser
 * is currently showing, e.g. "/team"). Because vercel.json rewrites
 * "/team" to serve team.html without changing the address bar, this
 * comparison keeps working correctly even with clean URLs.
 */
function highlightActiveNavLink() {
  // Normalise: strip a trailing slash (except for the homepage "/"
  // itself) so "/team/" and "/team" are treated as the same page.
  let currentPath = window.location.pathname;
  if (currentPath.length > 1 && currentPath.endsWith('/')) {
    currentPath = currentPath.slice(0, -1);
  }

  document.querySelectorAll('.navbar__link').forEach(link => {
    const linkPath = link.dataset.path;
    const isHome = linkPath === '/' && (currentPath === '/' || currentPath === '/index');
    const isMatch = isHome || currentPath === linkPath || currentPath === `${linkPath}.html`;
    link.classList.toggle('is-active', isMatch);
  });
}


/* -----------------------------------------------------------------------
   FOOTER
   -----------------------------------------------------------------------
----------------------------------------------------------------------- */
function buildFooter(data) {
  const footer = document.getElementById('footer');
  if (!footer) return;

  const year = new Date().getFullYear(); // always shows the current year

  footer.innerHTML = `
    <div class="container">
      <p><strong>${data.footer.text}</strong></p>
      <p>${data.footer.subtext}</p>
      <p>&copy; ${year} ${data.site.universityName}</p>
    </div>
  `;
}


/* -----------------------------------------------------------------------
   HOME PAGE
   -----------------------------------------------------------------------
----------------------------------------------------------------------- */
function buildHomePage(home) {
  const heroSlot = document.getElementById('heroSection');
  if (heroSlot) {
    heroSlot.innerHTML = `
      <div class="container hero__inner">
        <div class="hero__text">
          <p class="eyebrow">${home.heroEyebrow}</p>
          <h1 class="hero__heading">
            ${home.heroHeading.replace('Red Hat', '<span class="accent">Red Hat</span>')}
          </h1>
          <p class="hero__subheading">${home.heroSubheading}</p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="${home.heroPrimaryCtaLink}">${home.heroPrimaryCtaText}</a>
            <a class="btn btn--secondary" href="${home.heroSecondaryCtaLink}">${home.heroSecondaryCtaText}</a>
          </div>
        </div>
        <div class="hero__image-wrap">
          <img src="${home.heroImage}" alt="${home.heroImageAlt}">
        </div>
      </div>
    `;
  }

  const aboutSlot = document.getElementById('aboutSection');
  if (aboutSlot) {
    // Turn the array of paragraph strings into actual <p> tags.
    const paragraphsHtml = home.aboutParagraphs
      .map(paragraph => `<p class="about__paragraph">${paragraph}</p>`)
      .join('');

    // Same idea for the 4 value-proposition cards (Certifications, Labs, etc).
    const valueCardsHtml = home.valueProps.map(item => `
      <div class="value-card">
        <h3 class="value-card__title">${item.title}</h3>
        <p class="value-card__description">${item.description}</p>
      </div>
    `).join('');

    aboutSlot.innerHTML = `
      <div class="container">
        <p class="eyebrow">about the program</p>
        <h2 class="section-heading">${home.aboutHeading}</h2>
        ${paragraphsHtml}
        <div class="value-grid">
          ${valueCardsHtml}
        </div>
      </div>
    `;
  }
}


/* -----------------------------------------------------------------------
   TEAM PAGE
   -----------------------------------------------------------------------
   Builds the 4-tier "org chart": HOD -> Faculty -> Campus Ambassador ->
   Core Team grid, using a small reusable helper (buildProfileCard) for
   the three single-person tiers so we don't repeat the same HTML-building
   code three times.
----------------------------------------------------------------------- */
function buildTeamPage(team) {
  const headerSlot = document.getElementById('teamHeader');
  if (headerSlot) {
    headerSlot.innerHTML = `
      <p class="eyebrow">leadership chain</p>
      <h1 class="section-heading">${team.pageHeading}</h1>
      <p class="section-intro" style="margin-left:auto;margin-right:auto;">${team.pageIntro}</p>
    `;
  }

  const chartSlot = document.getElementById('orgChart');
  if (!chartSlot) return;

  // Build the Core Team's 3-column grid of cards.
  const coreTeamCardsHtml = team.coreTeam.map(member => `
    <div class="team-card">
      <img class="team-card__photo" src="${member.photo}" alt="Photo of ${member.name}">
      <h3 class="team-card__name">${member.name}</h3>
      <p class="team-card__role">${member.role}</p>
      <p class="team-card__description">${member.description}</p>
    </div>
  `).join('');

  chartSlot.innerHTML = `
    ${buildProfileCard(team.hod)}
    <div class="org-chart__connector"></div>

    ${buildProfileCard(team.faculty)}
    <div class="org-chart__connector"></div>

    ${buildProfileCard(team.ambassador, true)}
    <div class="org-chart__connector"></div>

    <p class="tier-label">${team.coreTeamLabel}</p>
    <div class="core-team-grid">
      ${coreTeamCardsHtml}
    </div>
  `;
}

/**
 * Builds one HOD/Faculty/Ambassador card. `isHighlighted` (true only for
 * the Campus Ambassador) adds an extra CSS class that gives that card the
 * red border + glow treatment described in the brief.
 */
function buildProfileCard(person, isHighlighted = false) {
  const highlightClass = isHighlighted ? ' profile-card--highlight' : '';
  return `
    <div>
      <p class="tier-label">${person.tierLabel}</p>
      <div class="profile-card${highlightClass}">
        <img class="profile-card__photo" src="${person.photo}" alt="Photo of ${person.name}">
        <div>
          <h3 class="profile-card__name">${person.name}</h3>
          <p class="profile-card__role">${person.role}</p>
          <p class="profile-card__description">${person.description}</p>
        </div>
      </div>
    </div>
  `;
}


/* -----------------------------------------------------------------------
   FAQ PAGE
   -----------------------------------------------------------------------
----------------------------------------------------------------------- */
function buildFaqPage(faq) {
  const headerSlot = document.getElementById('faqHeader');
  if (headerSlot) {
    headerSlot.innerHTML = `
      <p class="eyebrow">good to know</p>
      <h1 class="section-heading">${faq.pageHeading}</h1>
      <p class="section-intro" style="margin-left:auto;margin-right:auto;">${faq.pageIntro}</p>
    `;
  }

  const listSlot = document.getElementById('faqList');
  if (!listSlot) return;

  // Each question/answer pair becomes one .faq-item. We give each item a
  // unique id (faq-0, faq-1, ...) using its array index, which the click
  // handler below uses to know which button was pressed.
  listSlot.innerHTML = faq.items.map((item, index) => `
    <div class="faq-item" id="faq-${index}">
      <button class="faq-item__question" aria-expanded="false">
        <span>${item.question}</span>
        <span class="faq-item__icon" aria-hidden="true"></span>
      </button>
      <div class="faq-item__answer-wrap">
        <p class="faq-item__answer">${item.answer}</p>
      </div>
    </div>
  `).join('');

  setupAccordion();
}

/**
 * Makes each FAQ question clickable: clicking toggles that item's
 * "is-open" class (which CSS uses to expand/collapse the answer - see
 * the max-height transition in style.css's FAQ section).
 *
 * We intentionally do NOT close other items when one opens - visitors
 * often want to compare two answers side by side, and forcing "only one
 * open at a time" is a common accordion annoyance, not a requirement.
 */
function setupAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const questionBtn = item.querySelector('.faq-item__question');

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      questionBtn.setAttribute('aria-expanded', String(isOpen));
    });
  });
}


/* -----------------------------------------------------------------------
   CONTACT PAGE
   -----------------------------------------------------------------------
----------------------------------------------------------------------- */
function buildContactPage(contact) {
  const headerSlot = document.getElementById('contactHeader');
  if (headerSlot) {
    headerSlot.innerHTML = `
      <p class="eyebrow">get in touch</p>
      <h1 class="section-heading">${contact.pageHeading}</h1>
      <p class="section-intro" style="margin-left:auto;margin-right:auto;">${contact.pageIntro}</p>
    `;
  }

  const gridSlot = document.getElementById('contactGrid');
  if (gridSlot) {
    gridSlot.innerHTML = `
      ${buildContactCard(contact.ambassador)}
      ${buildContactCard(contact.faculty)}
    `;
  }

  const communitySlot = document.getElementById('communityCard');
  if (communitySlot) {
    communitySlot.innerHTML = `
      <div>
        <h2 class="community-card__heading">${contact.community.heading}</h2>
        <p class="community-card__description">${contact.community.description}</p>
        <a class="btn btn--primary" href="${contact.community.ctaLink}" target="_blank" rel="noopener">
          ${contact.community.ctaText}
        </a>
      </div>
      <div class="community-card__qr-wrap">
        <img src="${contact.community.qrImage}" alt="${contact.community.qrImageAlt}">
      </div>
    `;
  }
}

function buildContactCard(person) {
  return `
    <div class="contact-card">
      <p class="contact-card__label">${person.label}</p>
      <h3 class="contact-card__name">${person.name}</h3>
      <a class="contact-card__email" href="mailto:${person.email}">${person.email}</a>
    </div>
  `;
}
