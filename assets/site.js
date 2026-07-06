// Shared JavaScript engine for the Portfolio website.
// Parses portfolioData dynamically and populates the DOM components.

// Helper to return beautiful inline SVG icons (Feather Icons pack)
function getIconSvg(name) {
  const icons = {
    github: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    "file-text": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    "external-link": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="external-link-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    "arrow-left": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
    award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
    briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
  };
  return icons[name] || "";
}

// Global Dark/Light Theme & Color Theme Controller
function initTheme() {
  // Dark/Light Theme toggle
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

// Render dynamic homepage elements
function renderHome() {
  const data = window.portfolioData;
  if (!data) return;

  // Set Document Title
  document.title = `${data.profile.name} — Portfolio`;

  // Render Header Brand Name
  const brandEl = document.querySelector(".brand");
  if (brandEl) brandEl.textContent = data.profile.brandName || data.profile.name;

  // Render Intro Section
  const introEl = document.getElementById("intro-container");
  if (introEl) {
    introEl.innerHTML = `
      <div class="intro-text">
        <h1 class="name">${escapeHtml(data.profile.name)}</h1>
        <p class="position">${escapeHtml(data.profile.title)} · <span class="highlight-org">${escapeHtml(data.profile.company)}</span></p>
        <p class="interests">${escapeHtml(data.profile.interests)}</p>
        <p class="statement">${escapeHtml(data.profile.statement)}</p>
        <div class="contact-line">
          ${data.socials.map(s => `
            <a href="${escapeHtml(s.url)}" class="contact-chip" ${s.url.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""}>
              ${getIconSvg(s.icon)}
              <span>${escapeHtml(s.name)}</span>
            </a>
          `).join("")}
        </div>
      </div>
      <div class="headshot-container">
        <img class="headshot" src="${escapeHtml(data.profile.avatar)}" alt="${escapeHtml(data.profile.name)}" width="120" height="120">
      </div>
    `;
  }

  // Render Currently section
  const currentlyEl = document.getElementById("currently-container");
  if (currentlyEl) {
    currentlyEl.innerHTML = `
      <div class="currently-box">
        <p>${escapeHtml(data.currently)}</p>
      </div>
    `;
  }

  // Render Skills with Dynamic Categories
  const skillsEl = document.getElementById("skills-container");
  if (skillsEl) {
    // Group skills by category
    const groupedSkills = {};
    data.skills.forEach(s => {
      if (!groupedSkills[s.category]) groupedSkills[s.category] = [];
      groupedSkills[s.category].push(s.name);
    });

    let skillsHtml = '<div class="skills-grid">';
    for (const [cat, names] of Object.entries(groupedSkills)) {
      skillsHtml += `
        <div class="skill-category">
          <span class="skill-cat-title">${escapeHtml(cat)}</span>
          <div class="skills-list">
            ${names.map(name => `<button class="skill-badge" data-skill="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join("")}
          </div>
        </div>
      `;
    }
    skillsHtml += "</div>";
    skillsEl.innerHTML = skillsHtml;

    // Attach click handlers for Skills Filter Interaction
    setupSkillsFilter();
  }

  // Render Projects Grid
  renderProjects();

  // Render Experience Timeline
  const timelineEl = document.getElementById("timeline-container");
  if (timelineEl) {
    timelineEl.innerHTML = `
      <div class="timeline">
        ${data.timeline.map(item => `
          <div class="timeline-item">
            <div class="timeline-node"></div>
            <div class="timeline-header">
              <span class="timeline-role">${escapeHtml(item.role)}</span>
              <span class="timeline-period">${escapeHtml(item.period)}</span>
            </div>
            <div class="timeline-org">${escapeHtml(item.organization)}</div>
            ${item.description ? `<p class="timeline-desc">${escapeHtml(item.description)}</p>` : ""}
          </div>
        `).join("")}
      </div>
    `;
  }

  // Render Publications
  const pubsEl = document.getElementById("publications-container");
  if (pubsEl && data.publications) {
    pubsEl.innerHTML = `
      ${data.publications.map(pub => `
        <div class="pub-item">
          <div class="pub-title">${escapeHtml(pub.title)}</div>
          <div class="pub-authors">${escapeHtml(pub.authors)}</div>
          <div class="pub-venue">${escapeHtml(pub.venue)}</div>
          ${pub.note ? `<div class="pub-note">${escapeHtml(pub.note)}</div>` : ""}
          ${pub.link && pub.link !== "#" ? `<div class="pub-links"><a href="${escapeHtml(pub.link)}" target="_blank" rel="noopener">Link ${getIconSvg("external-link")}</a></div>` : ""}
        </div>
      `).join("")}
    `;
  }

  // Render Achievements & Leadership
  const achievementsEl = document.getElementById("achievements-container");
  if (achievementsEl && data.achievements) {
    achievementsEl.innerHTML = `
      <div class="achievements-list">
        ${data.achievements.map(item => `
          <div class="pub-item" style="margin-bottom: 12px;">
            <div class="pub-title">• ${escapeHtml(item.title)} <span style="font-weight: normal; color: var(--text-muted); float: right; font-size: 0.88rem;">${escapeHtml(item.meta)}</span></div>
            ${item.description ? `<div class="pub-note" style="margin-left: 12px; margin-top: 2px;">${escapeHtml(item.description)}</div>` : ""}
          </div>
        `).join("")}
      </div>
    `;
  }

  // Render Certifications
  const certificationsEl = document.getElementById("certifications-container");
  if (certificationsEl && data.certifications) {
    certificationsEl.innerHTML = `
      <div class="certifications-list">
        ${data.certifications.map(cert => `
          <div class="cert-item">
            • <strong>${escapeHtml(cert.title)}</strong> — ${escapeHtml(cert.issuer)}
          </div>
        `).join("")}
      </div>
    `;
  }

  // Render Research Interests
  const interestsEl = document.getElementById("research-interests-container");
  if (interestsEl && data.researchInterests) {
    interestsEl.innerHTML = `
      <div class="certifications-list">
        ${data.researchInterests.map(item => `
          <div class="cert-item">
            • <strong>${escapeHtml(item.title)}</strong>: ${escapeHtml(item.desc)}
          </div>
        `).join("")}
      </div>
    `;
  }

  // Render Extracurricular Activities
  const extracurricularsEl = document.getElementById("extracurriculars-container");
  if (extracurricularsEl && data.extracurriculars) {
    extracurricularsEl.innerHTML = `
      <div class="certifications-list">
        ${data.extracurriculars.map(item => `
          <div class="cert-item">
            • <strong>${escapeHtml(item.title)}</strong>: ${escapeHtml(item.desc)}
          </div>
        `).join("")}
      </div>
    `;
  }

  // Render footer copyright name
  const footerYearNameEl = document.getElementById("footer-year-name");
  if (footerYearNameEl) {
    footerYearNameEl.innerHTML = `&copy; ${new Date().getFullYear()} ${escapeHtml(data.profile.name)}`;
  }
}

// Function to render projects, separated so it can be filtered dynamically
function renderProjects(filterSkill = null) {
  const data = window.portfolioData;
  const gridEl = document.getElementById("projects-grid");
  if (!gridEl) return;

  gridEl.innerHTML = data.projects.map(proj => {
    const isMatched = filterSkill ? proj.tags.includes(filterSkill) : false;
    const isDimmed = filterSkill && !isMatched;
    const isHighlighted = filterSkill && isMatched;

    return `
      <div class="project-card ${isDimmed ? "dimmed" : ""} ${isHighlighted ? "highlighted" : ""}">
        <h3>
          <a href="${escapeHtml(proj.link)}" target="_blank" rel="noopener">
            <span>${escapeHtml(proj.title)}</span>
            ${getIconSvg("external-link")}
          </a>
        </h3>
        <div class="project-meta">${escapeHtml(proj.meta)}</div>
        <p>${escapeHtml(proj.description)}</p>
        <div class="project-tags">
          ${proj.tags.map(t => `
            <span class="project-tag ${t === filterSkill ? "highlight-tag" : ""}">${escapeHtml(t)}</span>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");
}

// Setup interactive skills filter: clicking skill badge filters projects
let activeFilteredSkill = null;
function setupSkillsFilter() {
  const badges = document.querySelectorAll(".skill-badge");
  badges.forEach(badge => {
    badge.addEventListener("click", () => {
      const skillName = badge.getAttribute("data-skill");
      
      // If clicking the same skill, reset filter
      if (activeFilteredSkill === skillName) {
        activeFilteredSkill = null;
        badges.forEach(b => b.classList.remove("active"));
        renderProjects(null);
      } else {
        activeFilteredSkill = skillName;
        badges.forEach(b => {
          if (b.getAttribute("data-skill") === skillName) {
            b.classList.add("active");
          } else {
            b.classList.remove("active");
          }
        });
        renderProjects(skillName);
      }
    });
  });
}

// ---- Render list of blog posts (blog.html) ----
function renderBlogList(containerId) {
  const container = document.getElementById(containerId);
  const data = window.portfolioData;
  if (!container || !data) return;

  // Set brand name
  const brandEl = document.querySelector(".brand");
  if (brandEl) brandEl.textContent = data.profile.brandName || data.profile.name;

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

  // Set brand name
  const brandEl = document.querySelector(".brand");
  if (brandEl) brandEl.textContent = data.profile.brandName || data.profile.name;

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
