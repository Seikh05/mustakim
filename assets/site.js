// Shared JavaScript engine for the Portfolio website.
// Parses portfolioData dynamically and populates modern showcase components.

// Helper to return beautiful inline SVG icons
function getIconSvg(name) {
  const icons = {
    github: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    "file-text": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
    "external-link": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="external-link-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    "arrow-down": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>`,
    "arrow-left": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
    award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
    zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
  };
  return icons[name] || "";
}

// Global Dark/Light Theme Controller
function initTheme() {
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  
  const toggleBtn = document.querySelector(".theme-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      let theme = document.documentElement.getAttribute("data-theme");
      let newTheme = theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }
}

// Formats date string from YYYY-MM-DD to "Month Day, Year"
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

// Safe HTML Escape utility
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Sync Navigation Bar (Brand name, dynamic CV link)
function syncNav() {
  const data = window.portfolioData;
  if (!data) return;
  const brandEl = document.querySelector(".brand");
  if (brandEl) brandEl.textContent = data.profile.brandName || data.profile.name;
  
  document.querySelectorAll('header.topbar .nav a').forEach(a => {
    if (a.textContent.trim() === 'CV') {
      a.href = data.profile.cv;
      if (data.profile.cv && data.profile.cv.endsWith('.docx')) {
        a.setAttribute('download', '');
      }
    }
  });
}

// Global active filter state for projects
let activeProjectCategory = "All";

// Render dynamic homepage elements
function renderHome() {
  const data = window.portfolioData;
  if (!data) return;

  // Sync Header Nav & Brand
  syncNav();

  // Set Document Title
  document.title = `${data.profile.name} — Autopilot & Robotics Portfolio`;

  // 1. RENDER HERO & STATS SECTION
  const heroEl = document.getElementById("hero-container");
  if (heroEl) {
    heroEl.innerHTML = `
      <div class="hero-top-row">
        <div class="hero-main-col">
          <div class="hero-badge">
            <span class="hero-pulse"></span>
            <span>${escapeHtml(data.profile.badge)}</span>
          </div>
          <h1 class="hero-name">${escapeHtml(data.profile.name)}</h1>
          <p class="hero-headline">${escapeHtml(data.profile.headline)}</p>
          <p class="hero-bio">${escapeHtml(data.profile.bio)}</p>
          
          <div class="hero-actions">
            <a href="#projects-section" class="btn primary-btn">
              <span>Explore Flagship Work</span>
              ${getIconSvg("arrow-down")}
            </a>
            <a href="${escapeHtml(data.profile.cv)}" class="btn secondary-btn" download>
              ${getIconSvg("file-text")}
              <span>Resume (DOCX)</span>
            </a>
          </div>

          <div class="hero-social-chips">
            ${data.socials.map(s => `
              <a href="${escapeHtml(s.url)}" class="contact-chip" ${s.url.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""}>
                ${getIconSvg(s.icon)}
                <span>${escapeHtml(s.name)}</span>
              </a>
            `).join("")}
          </div>
        </div>

        <div class="hero-avatar-col">
          <div class="avatar-wrapper">
            <img class="hero-headshot" src="${escapeHtml(data.profile.avatar)}" alt="${escapeHtml(data.profile.name)}" width="130" height="130">
          </div>
        </div>
      </div>

      <!-- Trophy Stats Bar -->
      <div class="stats-grid">
        ${data.stats.map(st => `
          <div class="stat-card">
            <div class="stat-val">${escapeHtml(st.value)}</div>
            <div class="stat-label">${escapeHtml(st.label)}</div>
            <div class="stat-highlight">${escapeHtml(st.highlight)}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // 2. RENDER FEATURED PROJECTS WITH CATEGORY FILTER
  setupProjectFilters();
  renderProjectsShowcase();

  // 3. RENDER CORE SUPERPOWERS (SKILL DOMAINS)
  const superpowersEl = document.getElementById("superpowers-container");
  if (superpowersEl && data.skillDomains) {
    superpowersEl.innerHTML = data.skillDomains.map(domain => `
      <div class="superpower-card">
        <div class="superpower-header">
          <span class="superpower-icon">${domain.icon}</span>
          <h3 class="superpower-title">${escapeHtml(domain.title)}</h3>
        </div>
        <div class="superpower-tags">
          ${domain.skills.map(s => `
            <span class="superpower-pill">${escapeHtml(s)}</span>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  // 4. RENDER MILESTONES & TRACK RECORD
  const milestonesEl = document.getElementById("milestones-container");
  if (milestonesEl && data.milestones) {
    milestonesEl.innerHTML = data.milestones.map(m => `
      <div class="milestone-card">
        <div class="milestone-top">
          <div class="milestone-title">${escapeHtml(m.title)}</div>
          <span class="milestone-date">${escapeHtml(m.date)}</span>
        </div>
        <div class="milestone-org">
          <span>${escapeHtml(m.org)}</span>
          ${m.highlight ? ` · <span class="milestone-highlight-tag">${escapeHtml(m.highlight)}</span>` : ""}
        </div>
        <p class="milestone-desc">${escapeHtml(m.desc)}</p>
      </div>
    `).join("");
  }

  // 5. RENDER COLLABORATION CTA
  const collabEl = document.getElementById("collaboration-container");
  if (collabEl && data.collaboration) {
    const c = data.collaboration;
    collabEl.innerHTML = `
      <div class="collaboration-card">
        <div class="collab-header">
          <span class="collab-status-badge">
            <span class="pulse-dot"></span>
            ${escapeHtml(c.status)}
          </span>
          <h2 class="collab-title">${escapeHtml(c.headline)}</h2>
        </div>
        <p class="collab-desc">${escapeHtml(c.description)}</p>
        <div class="collab-domains">
          ${c.domains.map(d => `<span class="collab-domain-chip">⚡ ${escapeHtml(d)}</span>`).join("")}
        </div>
        <div class="collab-actions">
          <a href="mailto:${escapeHtml(c.email)}" class="collab-btn primary-btn">
            ${getIconSvg("mail")}
            <span>Get in Touch (Email)</span>
          </a>
          ${c.whatsapp ? `
            <a href="${escapeHtml(c.whatsapp)}" target="_blank" rel="noopener noreferrer" class="collab-btn secondary-btn">
              ${getIconSvg("whatsapp")}
              <span>WhatsApp Direct</span>
            </a>
          ` : ""}
          <a href="${escapeHtml(c.linkedin)}" target="_blank" rel="noopener noreferrer" class="collab-btn secondary-btn">
            ${getIconSvg("linkedin")}
            <span>LinkedIn Profile</span>
          </a>
        </div>
      </div>
    `;
  }

  // Render footer copyright name
  const footerYearNameEl = document.getElementById("footer-year-name");
  if (footerYearNameEl) {
    footerYearNameEl.innerHTML = `&copy; ${new Date().getFullYear()} ${escapeHtml(data.profile.name)}`;
  }
}

// Setup project category filters (All, Autopilot, Computer Vision, Silicon)
function setupProjectFilters() {
  const container = document.getElementById("project-filters-container");
  const data = window.portfolioData;
  if (!container || !data) return;

  const categories = ["All", ...new Set(data.projects.map(p => p.category).filter(Boolean))];

  container.innerHTML = categories.map(cat => `
    <button class="filter-tab ${cat === activeProjectCategory ? "active" : ""}" data-category="${escapeHtml(cat)}">
      ${escapeHtml(cat)}
    </button>
  `).join("");

  container.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      activeProjectCategory = tab.getAttribute("data-category");
      container.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderProjectsShowcase();
    });
  });
}

// Render filtered project showcase cards
function renderProjectsShowcase() {
  const data = window.portfolioData;
  const gridEl = document.getElementById("projects-grid");
  if (!gridEl || !data) return;

  const filtered = activeProjectCategory === "All"
    ? data.projects
    : data.projects.filter(p => p.category === activeProjectCategory);

  gridEl.innerHTML = filtered.map(proj => `
    <article class="showcase-card">
      <div class="showcase-card-header">
        ${proj.badge ? `<span class="showcase-badge">${escapeHtml(proj.badge)}</span>` : ""}
        <h3 class="showcase-title">
          <a href="${escapeHtml(proj.link)}" target="_blank" rel="noopener">
            <span>${escapeHtml(proj.title)}</span>
            ${getIconSvg("external-link")}
          </a>
        </h3>
        <p class="showcase-subtitle">${escapeHtml(proj.subtitle)}</p>
      </div>

      <p class="showcase-desc">${escapeHtml(proj.description)}</p>

      <div class="showcase-footer">
        <div class="showcase-tags">
          ${proj.tags.map(t => `<span class="showcase-tag">${escapeHtml(t)}</span>`).join("")}
        </div>
        <a href="${escapeHtml(proj.link)}" target="_blank" rel="noopener" class="showcase-link">
          <span>${escapeHtml(proj.actionText || "View Project")}</span>
          ${getIconSvg("external-link")}
        </a>
      </div>
    </article>
  `).join("");
}

// ---- Render list of blog posts (blog.html) ----
function renderBlogList(containerId) {
  const container = document.getElementById(containerId);
  const data = window.portfolioData;
  if (!container || !data) return;

  // Sync nav
  syncNav();

  // Set Page Title
  document.title = `Notes — ${data.profile.name}`;

  const posts = data.posts || [];
  if (posts.length === 0) {
    container.innerHTML = '<p class="empty">No posts yet. Keep exploring!</p>';
    return;
  }

  // Sort newest first by date
  const sortedPosts = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));

  container.innerHTML = sortedPosts.map(post => `
    <a href="post.html?p=${encodeURIComponent(post.file)}" class="post-card">
      <span class="post-meta">${fmtDate(post.date)}</span>
      <div class="post-title">${escapeHtml(post.title)}</div>
      ${post.excerpt ? `<p class="post-excerpt">${escapeHtml(post.excerpt)}</p>` : ""}
    </a>
  `).join("");
}

// ---- Render a single post details (post.html) ----
function renderBlogPost(containerId) {
  const container = document.getElementById(containerId);
  const data = window.portfolioData;
  if (!container || !data) return;

  // Sync nav
  syncNav();

  const params = new URLSearchParams(location.search);
  const fileName = params.get("p");

  if (!fileName) {
    container.innerHTML = '<p class="empty">Post parameter is missing.</p>';
    return;
  }

  const post = data.posts.find(p => p.file === fileName);

  if (!post) {
    container.innerHTML = '<p class="empty">Post not found in logs.</p>';
    return;
  }

  // Set Page Title
  document.title = `${post.title} — ${data.profile.name}`;

  // Parse markdown content (marked.js is loaded in HTML)
  let contentHtml = "";
  try {
    contentHtml = window.marked.parse(post.content);
  } catch (err) {
    console.error("Markdown parse failed, rendering raw text", err);
    contentHtml = `<pre>${escapeHtml(post.content)}</pre>`;
  }

  container.innerHTML = `
    <div class="post-meta">${fmtDate(post.date)}</div>
    <h1>${escapeHtml(post.title)}</h1>
    <div class="post-content-body">${contentHtml}</div>
  `;
}
