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

function getEmbeddedPortfolioData() {
  if (typeof window === "undefined") return null;
  const embeddedData = window.__PORTFOLIO_DATA__;
  return embeddedData && typeof embeddedData === "object" ? embeddedData : null;
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

function getProjectSlug() {
  const params = new URLSearchParams(window.location.search);
  return safeText(params.get("slug") || params.get("project")).trim().toLowerCase();
}

function getProjectMediaHtml(project) {
  const embedUrl = getYouTubeEmbedUrl(project.trailerUrl);
  const imageUrl = safeText(project.imageUrl);

  if (embedUrl) {
    return `<div class="thumb thumb-video"><iframe src="${embedUrl}" title="Projeto ${safeText(
      project.name
    )}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
  }

  if (imageUrl) {
    return `<div class="thumb thumb-image"><img src="${imageUrl}" alt="Imagem do projeto ${safeText(
      project.name
    )}" loading="lazy"></div>`;
  }

  return `<div class="thumb">${safeText(project.mediaText || "Sem mídia disponível")}</div>`;
}

function getShortSummary(text) {
  const content = safeText(text).replace(/\s+/g, " ").trim();
  if (!content) return "";

  const sentenceMatch = content.match(/^(.+?[.!?])(\s|$)/);
  const sentence = sentenceMatch ? sentenceMatch[1] : content;
  return sentence.length > 220 ? `${sentence.slice(0, 217).trim()}...` : sentence;
}

function setMetaContent(id, value) {
  const element = document.getElementById(id);
  if (element) element.setAttribute("content", safeText(value));
}

function setLinkHref(id, value) {
  const element = document.getElementById(id);
  if (element) element.setAttribute("href", safeText(value));
}

function renderNotFound(slug) {
  document.title = "Projeto não encontrado | Igor Mirandolli";
  setMetaContent("page-description", "Projeto não encontrado.");
  setMetaContent("og-title", "Projeto não encontrado | Igor Mirandolli");
  setMetaContent("og-description", "Projeto não encontrado.");
  setMetaContent("og-image", "");
  setMetaContent("og-url", window.location.href);
  setLinkHref("canonical-link", window.location.href);

  const hero = document.getElementById("project-hero");
  const content = document.getElementById("project-content");
  const empty = document.getElementById("project-empty");

  if (hero) hero.hidden = true;
  if (content) content.hidden = true;
  if (empty) {
    empty.hidden = false;
    empty.innerHTML = `
      <h3>Projeto não encontrado</h3>
      <p>Não encontrei um projeto para o identificador <strong>${safeText(slug || "vazio")}</strong>.</p>
      <a class="btn primary" href="./index.html#projetos">Voltar aos projetos</a>
    `;
  }
}

function renderProjectPage(data, project) {
  const projectName = safeText(project.name);
  const projectDescription = safeText(project.description);
  const summary = getShortSummary(projectDescription) || projectDescription;
  const detailUrl = safeText(project.slug).trim()
    ? new URL(`./projeto.html?slug=${encodeURIComponent(safeText(project.slug).trim())}`, window.location.href).href
    : window.location.href;
  const imageUrl = safeText(project.imageUrl).trim();
  const githubUrl = safeText(project.github).trim();
  const liveUrl = safeText(project.link).trim();

  document.title = `${projectName} | Igor Mirandolli`;
  setMetaContent("page-description", summary || projectDescription);
  setMetaContent("og-title", `${projectName} | Igor Mirandolli`);
  setMetaContent("og-description", summary || projectDescription);
  setMetaContent("og-url", detailUrl);
  setMetaContent("og-image", imageUrl ? new URL(imageUrl, window.location.href).href : "");
  setLinkHref("canonical-link", detailUrl);

  const projectTitle = document.getElementById("project-title");
  const projectSummary = document.getElementById("project-summary");
  const projectStats = document.getElementById("project-stats");
  const projectActions = document.getElementById("project-actions");
  const projectMedia = document.getElementById("project-media");
  const projectDescriptionBox = document.getElementById("project-description");
  const projectTech = document.getElementById("project-tech");
  const projectLinks = document.getElementById("project-links");
  const footerName = document.getElementById("footer-name");
  const empty = document.getElementById("project-empty");
  const hero = document.getElementById("project-hero");
  const content = document.getElementById("project-content");

  if (projectTitle) projectTitle.textContent = projectName;
  if (projectSummary) projectSummary.textContent = summary;
  if (footerName) footerName.textContent = safeText(data.name);
  if (empty) empty.hidden = true;
  if (hero) hero.hidden = false;
  if (content) content.hidden = false;
  if (projectMedia) projectMedia.innerHTML = getProjectMediaHtml(project);
  if (projectDescriptionBox) projectDescriptionBox.innerHTML = renderParagraphs(projectDescription);
  if (projectTech) {
    projectTech.innerHTML = (project.tech || [])
      .map((tech) => `<span>${safeText(tech)}</span>`)
      .join("");
  }

  const stats = [
    `<span class="project-stat">${(project.tech || []).length} tecnologias</span>`,
    project.trailerUrl ? `<span class="project-stat">Vídeo</span>` : imageUrl ? `<span class="project-stat">Imagem</span>` : "",
    githubUrl ? `<span class="project-stat">Código</span>` : "",
    liveUrl ? `<span class="project-stat">Online</span>` : ""
  ]
    .filter(Boolean)
    .join("");

  if (projectStats) projectStats.innerHTML = stats;

  if (projectActions) {
    projectActions.innerHTML = [
      githubUrl ? `<a class="primary" href="${githubUrl}" target="_blank" rel="noopener">Ver GitHub</a>` : "",
      liveUrl ? `<a class="ghost" href="${liveUrl}" target="_blank" rel="noopener">Ver ao vivo</a>` : "",
      `<a class="ghost" href="./index.html#projetos">Voltar ao portfólio</a>`
    ]
      .filter(Boolean)
      .join("");
  }

  if (projectLinks) {
    projectLinks.innerHTML = [
      githubUrl ? `<a href="${githubUrl}" target="_blank" rel="noopener">GitHub do projeto</a>` : "",
      liveUrl ? `<a href="${liveUrl}" target="_blank" rel="noopener">Abrir versão online</a>` : "",
      `<a href="./index.html#projetos">Ir para os projetos</a>`
    ]
      .filter(Boolean)
      .join("");
  }
}

async function loadProjectPage() {
  try {
    const embeddedData = getEmbeddedPortfolioData();
    const data = embeddedData || (await (async () => {
      const response = await fetch("./data.json");
      if (!response.ok) throw new Error("Falha ao carregar os dados do portfólio");
      return response.json();
    })());

    const slug = getProjectSlug();
    const project = (data.projects || []).find((item) => safeText(item.slug).trim().toLowerCase() === slug);

    if (!project) {
      renderNotFound(slug);
      return;
    }

    renderProjectPage(data, project);
  } catch {
    renderNotFound(getProjectSlug());
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
loadProjectPage();
