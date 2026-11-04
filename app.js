// Réglages à changer une fois le domaine et l'email créés.
const SITE_CONFIG = {
  // Laisser vide sur Netlify : le formulaire y est reçu automatiquement.
  // Ailleurs (Vercel, etc.), coller ici l'adresse d'un service de formulaire.
  formEndpoint: "",
  contactEmail: "mirvpaulletang@gmail.com",
  // Lien de paiement de l'acompte. Dès qu'il est rempli, le visiteur paie juste après le formulaire.
  // Laisser vide tant qu'aucun moyen de paiement n'est vérifié : le lien part alors par email.
  checkoutUrl: "",
};

const FAQ = [
  ["Do we need to get on a call?", "No. Everything happens in writing, from your first message to the final files."],
  ["How do I pay?", "You get an invoice by email. You pay $245 to start and $245 after your preview, by international bank transfer in US dollars. If you use Wise, you can pay it from your Wise account."],
  ["What if I don't like the ads?", "You see a preview before the second payment and get one round of changes. If we miss the 7-day deadline, you can ask for your deposit back."],
  ["What do you need from me?", "Real photos or videos of your product, your logo and colors, and proof for any claim you want to use. Need new footage? We can add a real creator, quoted separately."],
  ["Do you use AI?", "Yes. We use AI tools for scripts, background scenes, extra shots and variations. A person checks every ad before you see it. Meta may show an \"AI info\" label on some ads."],
  ["Will these ads increase my sales?", "Nobody can honestly promise that. We promise on-time delivery and clear ideas to test. Your results also depend on your product, offer, website and budget."],
  ["What if I already have an editor or an agency?", "That works well. We can bring new angles and extra volume, and your team can launch or adapt the files."],
  ["Who can use the finished ads?", "Once you've paid in full, you can use them commercially for your brand. Because AI tools are involved, we can't guarantee that no similar image will ever exist. Our terms explain the details."],
  ["Which brands is this not for?", "We don't take dog food, supplements or anything that makes health claims. We focus on accessories such as harnesses, collars, beds, coats and travel gear."],
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function markLoaded() {
  document.body.classList.add("is-loaded");
  document.body.classList.remove("is-preloading");
  document.querySelector(".hero")?.classList.replace("hero--pre", "hero--ready");
}

/* En-tête : progression, lien actif et menu mobile */
function initHeader() {
  const header = document.querySelector("[data-header]");
  const links = [...document.querySelectorAll("[data-spy]")];
  let frame = 0;

  const update = () => {
    frame = 0;
    const scrollY = window.scrollY || 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty("--hdr-progress", String(max > 0 ? Math.min(1, scrollY / max) : 0));
    header.classList.toggle("is-scrolled", scrollY > 12);

    const line = scrollY + header.offsetHeight + window.innerHeight * 0.28;
    const atTop = scrollY < window.innerHeight * 0.5;
    links.forEach((link) => {
      const section = document.getElementById(link.dataset.spy);
      const top = section.getBoundingClientRect().top + scrollY;
      const active = !atTop && line >= top && line < top + section.offsetHeight;
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });

  const burger = document.getElementById("burger");
  const panel = document.getElementById("mobile-menu");
  const setOpen = (open) => {
    header.classList.toggle("is-open", open);
    panel.dataset.open = String(open);
    panel.setAttribute("aria-hidden", String(!open));
    panel.inert = !open;
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) panel.querySelector("a")?.focus();
  };
  burger.addEventListener("click", () => setOpen(panel.dataset.open !== "true"));
  panel.querySelector(".hdr-panel__scrim").addEventListener("click", () => setOpen(false));
  panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.dataset.open === "true") {
      setOpen(false);
      burger.focus();
    }
  });
  window.matchMedia("(min-width: 900px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}

/* Révélations au défilement */
function revealOnScroll(selector, show, options) {
  const targets = document.querySelectorAll(selector);
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    targets.forEach(show);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        show(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, options);
  targets.forEach((target) => observer.observe(target));
}

function initReveals() {
  // Marge haute immense : ce qui a déjà été dépassé par un saut de défilement compte comme vu.
  const passed = "100000px 0px";
  revealOnScroll("[data-fx]", (el) => el.setAttribute("data-in", ""), { threshold: 0.15, rootMargin: `${passed} -6% 0px` });
  revealOnScroll("[data-reveal]:not(.services__card)", (el) => el.classList.add("is-in"), { threshold: 0.12, rootMargin: `${passed} -6% 0px` });
  // La carte est masquée par clip-path : on observe son enveloppe, comme dans le portfolio.
  revealOnScroll(".services__cell", (el) => el.firstElementChild.classList.add("is-in"), { threshold: 0.12, rootMargin: `${passed} -6% 0px` });
  revealOnScroll(".stages", (el) => el.classList.add("is-in"), { threshold: 0.1, rootMargin: `${passed} -6% 0px` });
  revealOnScroll(".contact", (el) => el.classList.replace("contact--pre", "contact--in"), { threshold: 0.08, rootMargin: `${passed} -8% 0px` });
}

/* Étapes : accordéon et rail qui se remplit */
function initStages() {
  const list = document.querySelector(".stages__list");
  if (!list) return;
  const items = [...list.querySelectorAll(".stages__item")];
  let automatic = true;
  let openIndex = 0;

  const open = (index) => {
    openIndex = index;
    items.forEach((item, i) => {
      const isOpen = i === index;
      item.classList.toggle("is-open", isOpen);
      item.querySelector(".stages__button").setAttribute("aria-expanded", String(isOpen));
    });
  };

  items.forEach((item, index) => {
    item.querySelector(".stages__button").addEventListener("click", () => {
      automatic = false;
      open(openIndex === index ? -1 : index);
    });
  });

  if (prefersReducedMotion) {
    list.style.setProperty("--stages-p", "1");
    items.forEach((item) => item.setAttribute("data-passed", ""));
    return;
  }

  // Mêmes réglages que le portfolio : l'en-tête le plus proche du centre de l'écran.
  const READ_LINE = 0.5;
  const BAND_TOP = 0.08;
  const BAND_BOTTOM = 0.82;
  const mobile = window.matchMedia("(max-width: 719px)");
  let queued = false;
  let lastCurrent = -1;
  const update = () => {
    queued = false;
    const rect = list.getBoundingClientRect();
    const height = rect.height || 1;
    const viewport = window.innerHeight || 1;
    const progress = Math.max(0, Math.min(1, (viewport * 0.66 - rect.top) / height));
    const filled = progress * height;
    const visible = rect.bottom > 0 && rect.top < viewport;
    let current = -1;
    let best = Infinity;
    items.forEach((item, i) => {
      const box = item.firstElementChild.getBoundingClientRect();
      const center = box.top + box.height / 2;
      if (center < viewport * BAND_TOP || center > viewport * BAND_BOTTOM) return;
      const distance = Math.abs(center - viewport * READ_LINE);
      if (distance < best) {
        best = distance;
        current = i;
      }
    });
    if (current === -1 && visible) current = lastCurrent;
    if (!visible) current = -1;
    lastCurrent = current;
    list.style.setProperty("--stages-p", progress.toFixed(4));
    list.style.setProperty("--stages-h", `${Math.round(height)}px`);
    items.forEach((item, i) => {
      item.toggleAttribute("data-passed", filled >= item.offsetTop + item.firstElementChild.offsetHeight / 2);
      item.toggleAttribute("data-current", i === current);
    });
    if (automatic && mobile.matches && current !== -1 && current !== openIndex) open(current);
  };
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  if ("ResizeObserver" in window) new ResizeObserver(schedule).observe(list);
  update();
}

/* Cartes des problèmes : halo au pointeur, pile de cartes sur mobile */
function initServiceCards() {
  const grid = document.querySelector(".services__grid");
  if (!grid) return;
  const cards = [...grid.querySelectorAll(".services__card")];
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });

  // Toutes les cartes de la pile prennent la hauteur de la plus haute.
  const mobile = window.matchMedia("(max-width: 719px)");
  const measure = () => {
    grid.style.removeProperty("--svc-deck-h");
    if (!mobile.matches) return;
    const tallest = Math.max(...cards.map((card) => card.offsetHeight));
    if (tallest > 0) grid.style.setProperty("--svc-deck-h", `${Math.ceil(tallest)}px`);
  };
  measure();
  document.fonts?.ready.then(measure);
  window.addEventListener("resize", measure);
  if (prefersReducedMotion) return;

  let queued = false;
  const update = () => {
    queued = false;
    const viewport = window.innerHeight;
    const box = grid.getBoundingClientRect();
    if (!mobile.matches || box.bottom < -viewport || box.top > viewport * 2) {
      cards.forEach((card) => card.style.removeProperty("--svc-cover"));
      return;
    }
    const step = Number.parseFloat(getComputedStyle(grid).getPropertyValue("--svc-deck-step")) || 13;
    const rects = cards.map((card) => card.getBoundingClientRect());
    cards.forEach((card, i) => {
      const next = rects[i + 1];
      const span = rects[i].height - step * 2;
      const cover = next && span > 0 ? Math.min(1, Math.max(0, (rects[i].bottom - next.top) / span)) : 0;
      card.style.setProperty("--svc-cover", cover.toFixed(3));
    });
  };
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
}

/* Questions */
function initFaq() {
  const list = document.getElementById("faq-list");
  if (!list) return;
  const icon = '<svg viewBox="0 0 24 24" width="15" height="15" focusable="false"><path d="M12 5.5v13M5.5 12h13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  FAQ.forEach(([question, answer], index) => {
    const item = document.createElement("div");
    item.className = `faq__item${index === 0 ? " is-open" : ""}`;
    item.dataset.fx = "";
    item.style.setProperty("--fx-i", index);

    const heading = document.createElement("h3");
    heading.className = "faq__heading";
    const button = document.createElement("button");
    button.type = "button";
    button.id = `faq-q-${index}`;
    button.className = "faq__button";
    button.setAttribute("aria-expanded", String(index === 0));
    button.setAttribute("aria-controls", `faq-a-${index}`);
    const questionText = document.createElement("span");
    questionText.className = "faq__q";
    questionText.textContent = question;
    const iconWrap = document.createElement("span");
    iconWrap.className = "faq__icon";
    iconWrap.setAttribute("aria-hidden", "true");
    iconWrap.innerHTML = icon;
    button.append(questionText, iconWrap);
    heading.append(button);

    const panel = document.createElement("div");
    panel.className = "faq__panel";
    panel.id = `faq-a-${index}`;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", button.id);
    const clip = document.createElement("div");
    clip.className = "faq__clip";
    const text = document.createElement("p");
    text.className = "faq__a";
    text.textContent = answer;
    clip.append(text);
    panel.append(clip);

    button.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
    item.append(heading, panel);
    list.append(item);
  });
}

/* Grand titre final : même taille sur les deux lignes, sans déformation */
function initContactTitle() {
  const top = document.getElementById("contact-top");
  const bottom = document.getElementById("contact-bottom");
  if (!top || !bottom) return;
  const MIN = 34;
  const MAX = 176;
  let lastWidth = -1;

  const fit = () => {
    const available = top.parentElement.clientWidth;
    if (available <= 0) return;
    lastWidth = available;
    top.style.whiteSpace = "nowrap";
    let size = parseFloat(getComputedStyle(top).fontSize);
    let width = top.getBoundingClientRect().width;
    if (!size || width <= 0) return;
    size = Math.max(MIN, Math.min(MAX, (size * available) / width));
    top.style.fontSize = `${size.toFixed(2)}px`;
    width = top.getBoundingClientRect().width;
    if (width > 0 && Math.abs(width - available) > 0.5) {
      size = Math.max(MIN, Math.min(MAX, (size * available) / width));
      top.style.fontSize = `${size.toFixed(2)}px`;
    }
    bottom.style.fontSize = `${size.toFixed(2)}px`;
  };

  fit();
  document.fonts?.ready.then(fit);
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      if (Math.abs(top.parentElement.clientWidth - lastWidth) > 0.5) fit();
    }).observe(top.parentElement);
  } else {
    window.addEventListener("resize", fit);
  }
}

/* Barre d'action mobile */
function initStickyBar() {
  const bar = document.getElementById("sticky-join");
  if (!bar || !("IntersectionObserver" in window)) return;
  const link = bar.querySelector("a");
  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    });
    const shown = visible.size === 0;
    bar.dataset.shown = String(shown);
    if (shown) {
      bar.removeAttribute("aria-hidden");
      link.removeAttribute("tabindex");
    } else {
      bar.setAttribute("aria-hidden", "true");
      link.tabIndex = -1;
    }
  }, { threshold: 0.08 });
  ["accueil", "pricing", "start"].forEach((id) => observer.observe(document.getElementById(id)));
}

/* Vidéos de démonstration : lecture sans le son, seulement quand elles sont à l'écran */
function initDemoVideos() {
  const videos = [...document.querySelectorAll(".ad video")];
  const pauseButton = document.getElementById("demo-pause");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    if (pauseButton) pauseButton.hidden = true;
    return;
  }

  let heroPaused = false;
  const isHero = (video) => Boolean(video.closest(".adwall"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting && !(heroPaused && isHero(target))) target.play().catch(() => {});
      else target.pause();
    });
  }, { threshold: 0.35 });
  videos.forEach((video) => observer.observe(video));

  // Un seul son à la fois quand le visiteur active celui d'une vidéo.
  videos.forEach((video) => {
    video.addEventListener("volumechange", () => {
      if (video.muted) return;
      videos.forEach((other) => {
        if (other !== video) other.muted = true;
      });
    });
  });

  pauseButton?.addEventListener("click", () => {
    heroPaused = !heroPaused;
    pauseButton.setAttribute("aria-pressed", String(heroPaused));
    pauseButton.setAttribute("aria-label", heroPaused ? "Play the videos" : "Pause the videos");
    videos.filter(isHero).forEach((video) => {
      if (heroPaused) video.pause();
      else if (video.offsetParent !== null) video.play().catch(() => {});
    });
  });
}

/* Exemples : statuts façon WhatsApp */
function initStories() {
  const viewer = document.getElementById("story-viewer");
  const cards = [...document.querySelectorAll(".story")];
  if (!viewer || !cards.length) return;

  const IMAGE_MS = 5000;
  const HOLD_MS = 220;
  const $ = (selector) => viewer.querySelector(selector);
  const ui = {
    stage: $(".viewer__stage"),
    bars: $(".viewer__bars"),
    avatar: $(".viewer__avatar"),
    name: $(".viewer__name"),
    meta: $(".viewer__meta"),
    title: $(".viewer__title"),
    text: $(".viewer__text"),
    mute: $('[data-act="mute"]'),
    pause: $('[data-act="pause"]'),
    close: $('[data-act="close"]'),
    prevStory: $('[data-act="prev-story"]'),
    nextStory: $('[data-act="next-story"]'),
  };
  const groups = cards.map((card) => ({
    card,
    row: card.closest(".stories__row"),
    name: card.dataset.name,
    // Un même produit peut avoir un statut vidéo et un statut visuel : la clé tient compte de la rangée.
    key: `${card.closest(".stories").querySelector(".stories__label").textContent}:${card.dataset.name}`,
    avatar: card.querySelector(".story__avatar img").getAttribute("src"),
    items: [...card.parentElement.querySelectorAll(".story__items li")].map((li) => ({ ...li.dataset })),
  }));

  // Comme WhatsApp : l'anneau devient gris une fois le statut vu.
  let seen = new Set();
  try { seen = new Set(JSON.parse(sessionStorage.getItem("paw-seen") || "[]")); } catch {}
  groups.forEach((g) => g.card.classList.toggle("is-seen", seen.has(g.key)));
  const markSeen = (g) => {
    g.card.classList.add("is-seen");
    seen.add(g.key);
    try { sessionStorage.setItem("paw-seen", JSON.stringify([...seen])); } catch {}
  };

  let muted = false;
  try { muted = localStorage.getItem("paw-muted") === "1"; } catch {}

  let group = null;
  let index = 0;
  let media = null;
  let paused = false;
  let imageStart = 0;
  let imageDone = 0;
  let frameId = 0;
  let imageTimer = 0;
  let holdTimer = 0;
  let held = false;
  let pointer = null;
  let suppressClick = false;
  let lastFocus = null;
  let heroPlaying = [];

  const siblings = () => groups.filter((g) => g.row === group.row);

  function progress() {
    if (!media) return 0;
    if (media.tagName === "VIDEO") return media.duration ? media.currentTime / media.duration : 0;
    if (!media.complete) return 0;
    return (imageDone + (paused ? 0 : performance.now() - imageStart)) / IMAGE_MS;
  }

  function setBars(value) {
    [...ui.bars.children].forEach((bar, i) => {
      const fill = i < index ? 1 : i > index ? 0 : Math.min(value, 1);
      bar.firstChild.style.transform = `scaleX(${fill})`;
    });
  }

  function tick() {
    if (viewer.hidden) return;
    setBars(progress());
    frameId = requestAnimationFrame(tick);
  }

  // Le minuteur fait avancer les images, l'animation ne sert qu'à la barre.
  function scheduleImage() {
    clearTimeout(imageTimer);
    if (media && media.tagName !== "VIDEO" && media.complete && !paused) {
      imageTimer = setTimeout(next, Math.max(0, IMAGE_MS - imageDone));
    }
  }

  function play(video) {
    video.play().catch(() => {
      // Le navigateur refuse le son : on relance en muet.
      setMuted(true);
      video.play().catch(() => {});
    });
  }

  function setMuted(value) {
    muted = value;
    ui.mute.setAttribute("aria-pressed", String(muted));
    ui.mute.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    if (media?.tagName === "VIDEO") media.muted = muted;
    try { localStorage.setItem("paw-muted", muted ? "1" : "0"); } catch {}
  }

  function setPaused(value) {
    if (media && media.tagName !== "VIDEO") {
      if (value && !paused) imageDone += performance.now() - imageStart;
      if (!value && paused) imageStart = performance.now();
    }
    paused = value;
    ui.pause.setAttribute("aria-pressed", String(paused));
    ui.pause.setAttribute("aria-label", paused ? "Play" : "Pause");
    if (media?.tagName === "VIDEO") {
      if (paused) media.pause();
      else play(media);
    } else if (paused) {
      clearTimeout(imageTimer);
    } else {
      scheduleImage();
    }
  }

  function clearMedia() {
    clearTimeout(imageTimer);
    if (media?.tagName === "VIDEO") {
      media.pause();
      media.removeAttribute("src");
      media.load();
    }
    media = null;
    ui.stage.replaceChildren();
  }

  function show(i) {
    index = i;
    const item = group.items[index];
    clearMedia();
    if (item.type === "video") {
      const video = document.createElement("video");
      video.className = "viewer__media";
      video.src = item.src;
      video.poster = item.poster;
      video.muted = muted;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-label", item.alt);
      video.addEventListener("ended", next);
      ui.stage.append(video);
      media = video;
      if (!paused) play(video);
    } else {
      const blur = document.createElement("div");
      blur.className = "viewer__blur";
      blur.style.backgroundImage = `url("${item.src}")`;
      const img = new Image();
      img.className = "viewer__media";
      img.alt = item.alt;
      img.draggable = false;
      img.addEventListener("load", () => {
        imageDone = 0;
        imageStart = performance.now();
        scheduleImage();
      });
      img.src = item.src;
      ui.stage.append(blur, img);
      media = img;
      imageDone = 0;
      imageStart = performance.now();
      const upcoming = group.items[index + 1];
      if (upcoming?.type === "image") new Image().src = upcoming.src;
    }
    ui.title.textContent = item.title;
    ui.text.textContent = item.text;
    ui.meta.textContent = `Concept ad, not a client · ${index + 1}/${group.items.length}`;
    ui.mute.hidden = item.type !== "video";
    if (index === group.items.length - 1) markSeen(group);
    setBars(0);
  }

  function openGroup(g, start = 0) {
    group = g;
    ui.bars.replaceChildren(...group.items.map(() => {
      const bar = document.createElement("span");
      bar.className = "viewer__bar";
      bar.append(document.createElement("i"));
      return bar;
    }));
    ui.avatar.src = group.avatar;
    ui.name.textContent = group.name;
    const list = siblings();
    ui.prevStory.disabled = list.indexOf(group) === 0;
    ui.nextStory.disabled = list.indexOf(group) === list.length - 1;
    show(start);
  }

  function nextGroup() {
    const list = siblings();
    const pos = list.indexOf(group);
    if (pos < list.length - 1) openGroup(list[pos + 1]);
    else close();
  }

  function prevGroup() {
    const list = siblings();
    const pos = list.indexOf(group);
    if (pos > 0) openGroup(list[pos - 1]);
    else show(0);
  }

  function next() {
    if (index < group.items.length - 1) show(index + 1);
    else nextGroup();
  }

  function prev() {
    if (index > 0) show(index - 1);
    else prevGroup();
  }

  function open(g) {
    lastFocus = document.activeElement;
    heroPlaying = [...document.querySelectorAll(".adwall video")].filter((video) => !video.paused);
    heroPlaying.forEach((video) => video.pause());
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    paused = false;
    setPaused(false);
    setMuted(muted);
    openGroup(g);
    ui.close.focus();
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(tick);
  }

  function close() {
    if (viewer.hidden) return;
    cancelAnimationFrame(frameId);
    clearTimeout(holdTimer);
    clearMedia();
    viewer.hidden = true;
    document.body.style.overflow = "";
    heroPlaying.forEach((video) => video.play().catch(() => {}));
    lastFocus?.focus({ preventScroll: true });
  }

  groups.forEach((g) => g.card.addEventListener("click", () => open(g)));

  // Appui long : pause. Glisser vers le bas : fermer. Glisser sur le côté : produit voisin.
  viewer.querySelectorAll(".viewer__tap").forEach((tap) => {
    tap.addEventListener("pointerdown", (event) => {
      pointer = { x: event.clientX, y: event.clientY, wasPaused: paused };
      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => {
        held = true;
        setPaused(true);
      }, HOLD_MS);
    });
    tap.addEventListener("pointermove", (event) => {
      if (pointer && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 12) clearTimeout(holdTimer);
    });
    tap.addEventListener("pointerup", (event) => {
      clearTimeout(holdTimer);
      if (!pointer) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      const wasHeld = held;
      held = false;
      if (wasHeld && !pointer.wasPaused) setPaused(false);
      suppressClick = wasHeld || Math.hypot(dx, dy) > 40;
      pointer = null;
      if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
      else if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) nextGroup();
        else prevGroup();
      }
    });
    tap.addEventListener("pointercancel", () => {
      clearTimeout(holdTimer);
      if (held && pointer && !pointer.wasPaused) setPaused(false);
      held = false;
      pointer = null;
    });
  });

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) {
      close();
      return;
    }
    const action = event.target.closest("[data-act]")?.dataset.act;
    if ((action === "prev" || action === "next") && suppressClick) {
      suppressClick = false;
      return;
    }
    if (action === "next") next();
    else if (action === "prev") prev();
    else if (action === "next-story") nextGroup();
    else if (action === "prev-story") prevGroup();
    else if (action === "pause") setPaused(!paused);
    else if (action === "mute") setMuted(!muted);
    else if (action === "close" || action === "cta") close();
  });

  viewer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
    else if (event.key === "ArrowRight") next();
    else if (event.key === "ArrowLeft") prev();
    else if (event.key === "m" || event.key === "M") setMuted(!muted);
    else if (event.key === "Tab") {
      const focusables = [...viewer.querySelectorAll("button, a[href]")].filter((el) => !el.disabled && el.offsetParent !== null);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !viewer.hidden) setPaused(true);
  });
}

/* Formulaire de brief */
function initBriefForm() {
  const form = document.getElementById("brief-form");
  if (!form) return;
  if (SITE_CONFIG.checkoutUrl) {
    document.getElementById("brief-next").textContent = "No payment on this page. Next, you pay your $245 deposit by secure checkout.";
  }
  const statusBox = document.getElementById("form-status");
  const submitButton = document.getElementById("brief-submit");
  const submitText = document.getElementById("brief-submit-label");
  const submitLabel = submitText.textContent;
  const requiredFields = [...form.querySelectorAll("[required]")];

  const isFieldValid = (field) => {
    const value = field.value.trim();
    if (!value) return false;
    if (field.id === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    if (field.id === "product") return /^(https?:\/\/)?[^\s.]+(\.[^\s]+)+$/i.test(value);
    return true;
  };

  const showFieldState = (field) => {
    const valid = isFieldValid(field);
    const error = document.getElementById(`${field.id}-error`);
    field.classList.toggle("is-valid", valid);
    field.classList.toggle("is-invalid", !valid);
    field.setAttribute("aria-invalid", String(!valid));
    error.hidden = valid;
    if (valid) field.removeAttribute("aria-describedby");
    else field.setAttribute("aria-describedby", error.id);
    return valid;
  };

  requiredFields.forEach((field) => {
    field.addEventListener("blur", () => {
      if (field.value.trim() || field.classList.contains("is-invalid")) showFieldState(field);
    });
    field.addEventListener("input", () => {
      if (field.classList.contains("is-invalid")) showFieldState(field);
    });
  });

  const setSending = (isSending) => {
    submitButton.disabled = isSending;
    submitText.textContent = isSending ? "Reserving your pilot..." : submitLabel;
  };

  const renderStatus = (kind, title, message) => {
    statusBox.className = `brief__status is-${kind}`;
    statusBox.hidden = false;
    statusBox.replaceChildren();
    const heading = document.createElement("h3");
    heading.textContent = title;
    const text = document.createElement("p");
    text.textContent = message;
    statusBox.append(heading, text);
    statusBox.focus({ preventScroll: true });
    statusBox.scrollIntoView({ block: "nearest" });
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusBox.hidden = true;

    const results = requiredFields.map(showFieldState);
    const firstInvalid = requiredFields[results.indexOf(false)];
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = new FormData(form);
    // Champ piège : un robot le remplit, une personne ne le voit pas.
    if (data.get("company_url")) return;

    setSending(true);
    try {
      const response = await fetch(SITE_CONFIG.formEndpoint || "/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams(data).toString(),
      });
      if (!response.ok) throw new Error(`Form service answered ${response.status}`);

      form.reset();
      form.querySelectorAll(".is-valid").forEach((field) => field.classList.remove("is-valid"));
      if (SITE_CONFIG.checkoutUrl) {
        renderStatus("success", "One last step", "Pay the $245 deposit to lock your spot. Then we'll ask for your photos by email.");
        const pay = document.createElement("a");
        pay.className = "hero__cta hero__cta--solid brief__pay";
        pay.href = SITE_CONFIG.checkoutUrl;
        pay.textContent = "Pay the $245 deposit";
        statusBox.append(pay);
      } else {
        renderStatus("success", "Your spot is on hold", "Your $245 invoice is on its way by email, within 1 business day, with our bank details. Please check your spam folder if you don't see it.");
      }
    } catch {
      window.openEmailDraft(data);
      renderStatus("fallback", "Please send your request by email", `We couldn't send the form, so we opened an email draft with your answers. If nothing opened, write to ${SITE_CONFIG.contactEmail}.`);
    } finally {
      setSending(false);
    }
  });
}

window.openEmailDraft = (data) => {
  const lines = [
    `Plan: ${data.get("plan")}`,
    `Email: ${data.get("email")}`,
    `Product: ${data.get("product")}`,
    `Note: ${data.get("note") || "None"}`,
  ];
  const subject = encodeURIComponent(`Pilot request: ${data.get("product")}`);
  const body = encodeURIComponent(lines.join("\n"));
  window.location.href = `mailto:${SITE_CONFIG.contactEmail}?subject=${subject}&body=${body}`;
};

function initFooter() {
  document.getElementById("to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
  const year = document.querySelector(".footer__year");
  if (year) year.textContent = String(new Date().getFullYear());
}

initFaq();
requestAnimationFrame(markLoaded);
initHeader();
initReveals();
initStages();
initServiceCards();
initContactTitle();
initStickyBar();
initDemoVideos();
initStories();
initBriefForm();
initFooter();
