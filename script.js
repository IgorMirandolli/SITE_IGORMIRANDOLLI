function safeText(text) {
  return typeof text === "string" ? text : "";
}

function renderParagraphs(text) {
  const content = safeText(text).trim();
  if (!content) return "<p></p>";

  return content
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${paragraph.trim()}</p>`)
    .join("");
}

function getYouTubeEmbedUrl(url) {
  const raw = safeText(url).trim();
  if (!raw) return "";

  const shortMatch = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  const longMatch = raw.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;

  const embedMatch = raw.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;

  return "";
}

function getDirectDownloadUrl(url) {
  const raw = safeText(url).trim();
  if (!raw) return "#";

  const driveMatch = raw.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  return raw;
}

function getEmbeddedPortfolioData() {
  if (typeof window === "undefined") return null;
  const embeddedData = window.__PORTFOLIO_DATA__;
  return embeddedData && typeof embeddedData === "object" ? embeddedData : null;
}

function renderPortfolio(data) {
  document.title = safeText(data.pageTitle) || document.title;

  const description = document.getElementById("page-description");
  if (description) description.setAttribute("content", safeText(data.metaDescription));

  const heroName = document.getElementById("hero-name");
  const heroRole = document.getElementById("hero-role");
  const heroTagline = document.getElementById("hero-tagline");
  const heroCvBtn = document.getElementById("hero-cv-btn");
  const heroPhoto = document.getElementById("hero-photo");
  const heroPhotoCard = heroPhoto ? heroPhoto.closest(".hero-photo-card") : null;
  const footerName = document.getElementById("footer-name");
  const aboutText = document.getElementById("about-text");
  const currentFocus = document.getElementById("current-focus");
  const careerGoal = document.getElementById("career-goal");

  if (heroName) heroName.textContent = safeText(data.name);
  if (heroRole) heroRole.textContent = safeText(data.role);
  if (heroTagline) heroTagline.textContent = safeText(data.tagline);
  if (heroCvBtn) {
    heroCvBtn.href = getDirectDownloadUrl(data.cvUrl);
    heroCvBtn.setAttribute("download", "curriculo-igor.pdf");
  }
  if (heroPhoto && heroPhotoCard) {
    const profileImageUrl = safeText(data.profileImageUrl);
    if (profileImageUrl) {
      heroPhoto.src = profileImageUrl;
      heroPhoto.style.display = "block";
      heroPhotoCard.classList.remove("empty");
    } else {
      heroPhoto.removeAttribute("src");
      heroPhoto.style.display = "none";
      heroPhotoCard.classList.add("empty");
    }
  }
  if (footerName) footerName.textContent = safeText(data.name);
  if (aboutText) aboutText.innerHTML = renderParagraphs(data.about);
  if (currentFocus) currentFocus.textContent = safeText(data.currentFocus);
  if (careerGoal) careerGoal.textContent = safeText(data.careerGoal);

  const chipsContainer = document.getElementById("about-chips");
  if (chipsContainer) {
    chipsContainer.innerHTML = (data.aboutTech || [])
      .map((tech) => `<span>${safeText(tech)}</span>`)
      .join("");
  }

  const projectsGrid = document.getElementById("projects-grid");
  if (projectsGrid) {
    projectsGrid.innerHTML = (data.projects || [])
      .filter((project) => !project.hidden)
      .map((project) => {
        const techList = (project.tech || []).map((tech) => `<li>${safeText(tech)}</li>`).join("");
        const embedUrl = getYouTubeEmbedUrl(project.trailerUrl);
        const imageUrl = safeText(project.imageUrl);
        const projectSlug = safeText(project.slug).trim();
        const detailUrl = projectSlug
          ? `./projeto.html?slug=${encodeURIComponent(projectSlug)}`
          : "./projeto.html";
        const githubUrl = safeText(project.github).trim();
        const projectUrl = safeText(project.link).trim();
        const projectLinks = [
          githubUrl ? `<a href="${githubUrl}" target="_blank" rel="noopener">GitHub do projeto</a>` : "",
          projectUrl ? `<a href="${projectUrl}" target="_blank" rel="noopener">Ver projeto</a>` : ""
        ]
          .filter(Boolean)
          .join("");
        const mediaHtml = embedUrl
          ? `<div class="thumb thumb-video"><iframe src="${embedUrl}" title="Trailer de ${safeText(
              project.name
            )}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`
          : imageUrl
          ? `<div class="thumb thumb-image"><img src="${imageUrl}" alt="Imagem do projeto ${safeText(
              project.name
            )}" loading="lazy"></div>`
          : `<div class="thumb">${safeText(project.mediaText)}</div>`;
        return `
          <article class="card project-card" data-detail-url="${detailUrl}">
            <div class="project-card-main" role="link" tabindex="0" aria-label="Abrir detalhes do projeto ${safeText(
              project.name
            )}">
              ${mediaHtml}
              <h4>${safeText(project.name)}</h4>
              <p>${safeText(project.description)}</p>
              <ul>${techList}</ul>
            </div>
            <div class="card-links">${projectLinks}</div>
          </article>
        `;
      })
      .join("");

    projectsGrid.querySelectorAll(".project-card-main").forEach((card) => {
      const projectCard = card.closest(".project-card");
      const detailUrl = projectCard?.getAttribute("data-detail-url") || "";

      const openProjectDetail = () => {
        if (!detailUrl) return;
        window.location.assign(detailUrl);
      };

      card.addEventListener("click", openProjectDetail);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProjectDetail();
        }
      });
    });
  }

  const techGrid = document.getElementById("tech-grid");
  if (techGrid) {
    techGrid.innerHTML = (data.technologies || [])
      .map(
        (tech) => `
          <div class="tech-item">
            <strong>${safeText(tech.name)}</strong>
            <span>${safeText(tech.level)}</span>
          </div>
        `
      )
      .join("");
  }

  const highlights = document.getElementById("highlights");
  if (highlights) {
    highlights.innerHTML = (data.highlights || []).map((item) => `<p>${safeText(item)}</p>`).join("");
  }

  const contactBox = document.getElementById("contact-box");
  if (contactBox) {
    const email = safeText(data.contact?.email);
    const linkedin = safeText(data.contact?.linkedin);
    const github = safeText(data.contact?.github);

    contactBox.innerHTML = `
      <a href="mailto:${email}">${email}</a>
      <a href="${linkedin}" target="_blank" rel="noopener">LinkedIn</a>
      <a href="${github}" target="_blank" rel="noopener">GitHub</a>
    `;
  }
}

async function loadPortfolio() {
  try {
    const embeddedData = getEmbeddedPortfolioData();
    if (embeddedData) {
      renderPortfolio(embeddedData);
      return;
    }

    const isGitHubPages = window.location.hostname.endsWith("github.io");
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const repoBase = isGitHubPages && pathParts.length > 0 ? `/${pathParts[0]}` : "";
    const fetchCache = isGitHubPages ? "force-cache" : "default";

    const urlsToTry = isGitHubPages
      ? [`${repoBase}/data.json`, "./data.json"]
      : ["/api/portfolio", "./data.json"];

    let lastError = null;
    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, { cache: fetchCache });
        if (!response.ok) continue;
        const data = await response.json();
        renderPortfolio(data);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Erro ao carregar dados");
  } catch (error) {
    const heroTagline = document.getElementById("hero-tagline");
    if (heroTagline) heroTagline.textContent = "Nao foi possivel carregar os dados agora.";
  }
}

function setupAnimations() {
  const sections = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.18 }
  );

  sections.forEach((section) => observer.observe(section));
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

setupAnimations();
loadPortfolio();

