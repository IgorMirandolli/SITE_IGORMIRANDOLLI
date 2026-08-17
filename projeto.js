function safeText(text) {
  return typeof text === "string" ? text : "";
}

let projectGalleryItems = [];
let activeGalleryIndex = 0;

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

function getProjectGallery(project) {
  const configuredGallery = Array.isArray(project.gallery) ? project.gallery : [];
  const gallery = configuredGallery
    .map((item) => ({
      src: safeText(item?.src).trim(),
      title: safeText(item?.title).trim(),
      category: safeText(item?.category).trim(),
      device: safeText(item?.device).trim(),
      alt: safeText(item?.alt).trim() || `Imagem do projeto ${safeText(project.name)}`,
      caption: safeText(item?.caption).trim()
    }))
    .filter((item) => item.src);

  if (gallery.length) return gallery;

  const fallbackImage = safeText(project.imageUrl).trim();
  if (!fallbackImage) return [];

  return [
    {
      src: fallbackImage,
      title: "Tela principal",
      category: "",
      device: "",
      alt: `Imagem do projeto ${safeText(project.name)}`,
      caption: `Tela principal do projeto ${safeText(project.name)}.`
    }
  ];
}

function renderDetailList(items) {
  if (!Array.isArray(items)) return "";

  return items
    .map((item) => safeText(item).trim())
    .filter(Boolean)
    .map((item) => `<li>${item}</li>`)
    .join("");
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

function updateLightbox(index) {
  if (!projectGalleryItems.length) return;

  activeGalleryIndex = (index + projectGalleryItems.length) % projectGalleryItems.length;
  const item = projectGalleryItems[activeGalleryIndex];
  const image = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  const counter = document.getElementById("lightbox-counter");
  const previous = document.getElementById("lightbox-previous");
  const next = document.getElementById("lightbox-next");
  const hasNavigation = projectGalleryItems.length > 1;

  if (image) {
    image.src = item.src;
    image.alt = item.alt;
  }
  if (caption) caption.textContent = [item.title, item.caption].filter(Boolean).join(" — ");
  if (counter) counter.textContent = `${activeGalleryIndex + 1} de ${projectGalleryItems.length}`;
  if (previous) previous.hidden = !hasNavigation;
  if (next) next.hidden = !hasNavigation;
}

function openLightbox(index) {
  const lightbox = document.getElementById("project-lightbox");
  if (!lightbox || !projectGalleryItems.length) return;

  updateLightbox(index);
  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  } else {
    lightbox.setAttribute("open", "");
  }
}

function closeLightbox() {
  const lightbox = document.getElementById("project-lightbox");
  if (!lightbox) return;

  if (typeof lightbox.close === "function" && lightbox.open) {
    lightbox.close();
  } else {
    lightbox.removeAttribute("open");
  }
}

function renderProjectGallery(project) {
  const section = document.getElementById("project-gallery-section");
  const gallery = document.getElementById("project-gallery");
  const count = document.getElementById("project-gallery-count");
  const filters = document.getElementById("project-gallery-filters");
  const allGalleryItems = getProjectGallery(project);

  if (!section || !gallery) return allGalleryItems;

  section.hidden = allGalleryItems.length === 0;

  if (!allGalleryItems.length) {
    projectGalleryItems = [];
    gallery.innerHTML = "";
    if (count) count.textContent = "";
    if (filters) filters.hidden = true;
    return allGalleryItems;
  }

  const renderGalleryItems = (items) => {
    projectGalleryItems = items;
    gallery.classList.toggle("single", items.length === 1);

    if (count) {
      const totalLabel = `${allGalleryItems.length} ${allGalleryItems.length === 1 ? "imagem" : "imagens"}`;
      count.textContent = items.length === allGalleryItems.length ? totalLabel : `${items.length} de ${totalLabel}`;
    }

    gallery.innerHTML = items
      .map((item, index) => {
        const isMobile = item.device.toLowerCase() === "mobile";
        return `
          <button class="gallery-item${isMobile ? " is-mobile" : ""}" type="button" data-gallery-index="${index}" aria-label="Ampliar ${item.alt}">
            <span class="gallery-image-wrap">
              <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async">
            </span>
            <span class="gallery-item-copy">
              <span class="gallery-item-heading">
                <strong>${item.title || `Tela ${String(index + 1).padStart(2, "0")}`}</strong>
                ${item.device ? `<span class="gallery-device">${item.device}</span>` : ""}
              </span>
              <span class="gallery-caption">${item.caption || item.alt}</span>
            </span>
          </button>
        `;
      })
      .join("");

    gallery.querySelectorAll("[data-gallery-index]").forEach((button) => {
      button.addEventListener("click", () => {
        openLightbox(Number(button.getAttribute("data-gallery-index")) || 0);
      });
    });
  };

  const categories = [...new Set(allGalleryItems.map((item) => item.category).filter(Boolean))];
  if (filters && categories.length > 1) {
    filters.hidden = false;
    filters.innerHTML = ["Todas", ...categories]
      .map((category, index) => {
        const categoryCount = index === 0
          ? allGalleryItems.length
          : allGalleryItems.filter((item) => item.category === category).length;
        return `
          <button class="gallery-filter${index === 0 ? " active" : ""}" type="button" data-gallery-filter="${
            index === 0 ? "" : category
          }" aria-pressed="${index === 0}">${category}<span>${categoryCount}</span></button>
        `;
      })
      .join("");

    filters.querySelectorAll("[data-gallery-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const selectedCategory = button.getAttribute("data-gallery-filter") || "";
        filters.querySelectorAll("[data-gallery-filter]").forEach((filterButton) => {
          const isActive = filterButton === button;
          filterButton.classList.toggle("active", isActive);
          filterButton.setAttribute("aria-pressed", String(isActive));
        });
        renderGalleryItems(
          selectedCategory
            ? allGalleryItems.filter((item) => item.category === selectedCategory)
            : allGalleryItems
        );
        filters.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  } else if (filters) {
    filters.hidden = true;
    filters.innerHTML = "";
  }

  renderGalleryItems(allGalleryItems);
  return allGalleryItems;
}

function setupGalleryLightbox() {
  const lightbox = document.getElementById("project-lightbox");
  const close = document.getElementById("lightbox-close");
  const previous = document.getElementById("lightbox-previous");
  const next = document.getElementById("lightbox-next");

  close?.addEventListener("click", closeLightbox);
  previous?.addEventListener("click", () => updateLightbox(activeGalleryIndex - 1));
  next?.addEventListener("click", () => updateLightbox(activeGalleryIndex + 1));

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.open || projectGalleryItems.length < 2) return;
    if (event.key === "ArrowLeft") updateLightbox(activeGalleryIndex - 1);
    if (event.key === "ArrowRight") updateLightbox(activeGalleryIndex + 1);
  });
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
  const story = document.getElementById("project-story");
  const gallery = document.getElementById("project-gallery-section");
  const empty = document.getElementById("project-empty");

  if (hero) hero.hidden = true;
  if (content) content.hidden = true;
  if (story) story.hidden = true;
  if (gallery) gallery.hidden = true;
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
  const projectObjective = document.getElementById("project-objective");
  const projectFeatures = document.getElementById("project-features");
  const projectTechnicalDetails = document.getElementById("project-technical-details");
  const projectLearnings = document.getElementById("project-learnings");
  const footerName = document.getElementById("footer-name");
  const empty = document.getElementById("project-empty");
  const hero = document.getElementById("project-hero");
  const content = document.getElementById("project-content");
  const story = document.getElementById("project-story");

  if (projectTitle) projectTitle.textContent = projectName;
  if (projectSummary) projectSummary.textContent = summary;
  if (footerName) footerName.textContent = safeText(data.name);
  if (empty) empty.hidden = true;
  if (hero) hero.hidden = false;
  if (content) content.hidden = false;
  if (story) story.hidden = false;
  if (projectMedia) projectMedia.innerHTML = getProjectMediaHtml(project);
  if (projectDescriptionBox) projectDescriptionBox.innerHTML = renderParagraphs(projectDescription);
  if (projectObjective) {
    projectObjective.textContent = safeText(project.objective).trim() || projectDescription;
  }
  if (projectFeatures) projectFeatures.innerHTML = renderDetailList(project.features);
  if (projectTechnicalDetails) {
    projectTechnicalDetails.innerHTML = renderDetailList(project.technicalDetails);
  }
  if (projectLearnings) {
    projectLearnings.textContent = safeText(project.learnings).trim() || "Este projeto contribuiu para minha evolução técnica e para a construção de soluções mais completas.";
  }
  if (projectTech) {
    projectTech.innerHTML = (project.tech || [])
      .map((tech) => `<span>${safeText(tech)}</span>`)
      .join("");
  }

  const galleryItems = renderProjectGallery(project);

  const stats = [
    `<span class="project-stat">${(project.tech || []).length} tecnologias</span>`,
    project.trailerUrl ? `<span class="project-stat">Vídeo</span>` : "",
    galleryItems.length
      ? `<span class="project-stat">${galleryItems.length} ${galleryItems.length === 1 ? "imagem" : "imagens"}</span>`
      : "",
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
setupGalleryLightbox();
loadProjectPage();
