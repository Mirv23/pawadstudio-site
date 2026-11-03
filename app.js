// Réglages à changer une fois le domaine et l'email créés.
const SITE_CONFIG = {
  // Laisser vide sur Netlify : le formulaire y est reçu automatiquement.
  // Ailleurs (Vercel, etc.), coller ici l'adresse d'un service de formulaire.
  formEndpoint: "",
  contactEmail: "hello@mirvpaulletang.me",
  // Lien de paiement de l'acompte. Dès qu'il est rempli, le visiteur paie juste après le formulaire.
  // Laisser vide tant qu'aucun moyen de paiement n'est vérifié : le lien part alors par email.
  checkoutUrl: "",
};

const FAQ = [
  ["Do we need to get on a call?", "No. Everything happens in writing, from your first message to the final files."],
  ["How do I pay?", "You get a secure payment link. You pay $245 to start and $245 after your preview."],
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
        renderStatus("success", "Your spot is on hold", "Your secure $245 payment link is on its way by email, within 1 business day. Please check your spam folder if you don't see it.");
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
initBriefForm();
initFooter();
