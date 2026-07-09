/* =============================================================================
   RED HAT ACADEMY - SHARED JAVASCRIPT
   =============================================================================
   Loaded by all four pages. Most of the site's text now lives directly in
   its own HTML file (open index.html, faq.html, or contact.html and you'll
   find real sentences, not placeholders) - so this file is mostly about
   BEHAVIOR (menus, accordions) rather than building content.

   The one exception is the Leadership & Team page: since the team roster
   changes every year, team.html still fetches data.json and uses it to
   fill in each person's photo, name, role, and description.
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  setupHamburgerMenu();
  highlightActiveNavLink();
  setupAccordion();
  setFooterYear();

  // Only team.html has an element with id="orgChart" - on every other
  // page this check simply skips the team-building code below.
  if (document.getElementById('orgChart')) {
    loadTeamData();
  }
});


/* -----------------------------------------------------------------------
   MOBILE HAMBURGER MENU
   -----------------------------------------------------------------------
   Tapping the hamburger button toggles ".is-open" on both the button
   (so its 3 lines animate into an "X" - see style.css) and the link
   list (so CSS can expand it open on small screens).
----------------------------------------------------------------------- */
function setupHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navbarLinks');
  if (!hamburgerBtn || !navLinks) return;

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    hamburgerBtn.classList.toggle('is-open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Tapping a link closes the mobile menu automatically.
  navLinks.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      hamburgerBtn.classList.remove('is-open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  });
}


/* -----------------------------------------------------------------------
   ACTIVE NAV LINK HIGHLIGHTING
   -----------------------------------------------------------------------
   Adds the "is-active" CSS class to whichever navbar link matches the
   current page, so it gets the red underline/color from style.css.

   We compare against window.location.pathname (the URL path the browser
   is showing, e.g. "/team"). Because vercel.json's cleanUrls setting
   serves "/team" without changing the address bar to "/team.html", this
   comparison keeps working correctly on the deployed site.
----------------------------------------------------------------------- */
function highlightActiveNavLink() {
  // Normalise: strip a trailing slash (except for "/" itself) so "/team/"
  // and "/team" are treated as the same page.
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
   FAQ ACCORDION
   -----------------------------------------------------------------------
   faq.html already contains all 10 real questions/answers written
   directly in the HTML. This function just wires up the click-to-expand
   behavior: clicking a question toggles that item's "is-open" class,
   which CSS uses to animate the answer open/closed.

   We deliberately do NOT close other items when one opens, since
   visitors often want to compare two answers side by side.
----------------------------------------------------------------------- */
function setupAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const questionBtn = item.querySelector('.faq-item__question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      questionBtn.setAttribute('aria-expanded', String(isOpen));
    });
  });
}


/* -----------------------------------------------------------------------
   FOOTER YEAR
   -----------------------------------------------------------------------
   Every page has <span id="footerYear"></span> inside its copyright
   line. This fills it with the current year automatically, so nobody
   has to remember to update it by hand every January.
----------------------------------------------------------------------- */
function setFooterYear() {
  const yearSlot = document.getElementById('footerYear');
  if (yearSlot) {
    yearSlot.textContent = new Date().getFullYear();
  }
}


/* -----------------------------------------------------------------------
   TEAM PAGE: LOAD data.json AND BUILD THE PERSON CARDS
   -----------------------------------------------------------------------
   team.html already contains the static tier labels ("Head of
   Department", "Core Team Members", etc.) and the empty card containers
   (like <div id="hodCard">). This function fetches data.json and fills
   each container with that person's photo/name/role/description.

   fetch() is a built-in browser function for requesting a file over
   HTTP - here, a local JSON file. It returns a "Promise" (a placeholder
   for a value that isn't ready yet). We use async/await so this
   asynchronous code can still read top-to-bottom like normal code.
----------------------------------------------------------------------- */
async function loadTeamData() {
  try {
    const response = await fetch('data.json');

    // fetch() only rejects for network failures (e.g. being offline).
    // A missing file (404) still "succeeds" as far as fetch is
    // concerned, so we check response.ok ourselves.
    if (!response.ok) {
      throw new Error(`Could not load data.json (status ${response.status})`);
    }

    const team = await response.json();

    fillProfileCard('hodCard', team.hod);
    fillProfileCard('facultyCard', team.faculty);
    fillProfileCard('ambassadorCard', team.ambassador);
    buildCoreTeamGrid(team.coreTeam);

  } catch (error) {
    console.error('Failed to load team data:', error);
    const chart = document.getElementById('orgChart');
    if (chart) {
      chart.innerHTML =
        '<p style="color:#EE0000;">Could not load team data (data.json). Please refresh the page.</p>';
    }
  }
}

/**
 * Fills one HOD/Faculty/Ambassador card container with a person's photo
 * (using the media-frame placeholder pattern - see style.css section 5),
 * name, role, and description.
 */
function fillProfileCard(containerId, person) {
  const container = document.getElementById(containerId);
  if (!container || !person) return;

  container.innerHTML = `
    <div class="media-frame media-frame--avatar-lg">
      <span class="media-frame__placeholder">Photo will go here</span>
      <img class="media-frame__img profile-card__photo" src="${person.photo}"
           alt="Photo of ${person.name}" onerror="this.style.display='none'">
    </div>
    <div>
      <h3 class="profile-card__name">${person.name}</h3>
      <p class="profile-card__role">${person.role}</p>
      <p class="profile-card__description">${person.description}</p>
    </div>
  `;
}

/**
 * Builds the 3-column Core Team grid. Unlike the single-person cards
 * above, this list can have any number of members, so it has to be
 * generated in a loop rather than typed out by hand in the HTML.
 */
function buildCoreTeamGrid(coreTeam) {
  const grid = document.getElementById('coreTeamGrid');
  if (!grid || !Array.isArray(coreTeam)) return;

  // Array.map() turns each person object into an HTML string, and
  // .join('') glues all of those strings together into one block.
  grid.innerHTML = coreTeam.map(member => `
    <div class="team-card">
      <div class="media-frame media-frame--avatar-sm">
        <span class="media-frame__placeholder">Photo will go here</span>
        <img class="media-frame__img team-card__photo" src="${member.photo}"
             alt="Photo of ${member.name}" onerror="this.style.display='none'">
      </div>
      <h3 class="team-card__name">${member.name}</h3>
      <p class="team-card__role">${member.role}</p>
      <p class="team-card__description">${member.description}</p>
    </div>
  `).join('');
}
