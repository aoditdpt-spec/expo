// AOD for Exhibitors: everything the page does in the browser. No libraries, no build step.
// Settings come from config.js, expos from data/expos.js, extra portfolio work from data/portfolio.js.
(function () {
  "use strict";

  const config = window.AOD_EXPO_CONFIG || {};
  const allExpos = window.AOD_EXPOS || [];
  const portfolio = window.AOD_PORTFOLIO || [];
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const OTHER = "__other";
  const DRAFT_KEY = "aod-expo-draft";

  document.documentElement.classList.add("js");

  // ───────────── Dates (all in Indian time) ─────────────
  const todayIST = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()); // YYYY-MM-DD
  const asDate = (day) => new Date(day + "T12:00:00Z");
  const fmt = (day, opts) => new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", ...opts }).format(asDate(day));
  const dayLabel = (day) => fmt(day, { weekday: "short", day: "numeric", month: "short" }); // "Thu, 22 Oct"
  function rangeText(days) {
    if (!days || !days.length) return "";
    const first = days[0];
    const last = days[days.length - 1];
    const year = fmt(last, { year: "numeric" });
    if (first === last) return `${fmt(first, { day: "numeric", month: "short" })} ${year}`;
    const sameMonth = first.slice(0, 7) === last.slice(0, 7);
    return sameMonth
      ? `${fmt(first, { day: "numeric" })}–${fmt(last, { day: "numeric", month: "short" })} ${year}`
      : `${fmt(first, { day: "numeric", month: "short" })} – ${fmt(last, { day: "numeric", month: "short" })} ${year}`;
  }
  const expoStatus = (expo) => {
    const days = expo.days || [];
    if (!days.length) return "upcoming";
    if (days[days.length - 1] < todayIST) return "past";
    return days[0] <= todayIST ? "live" : "upcoming";
  };
  // Expos still on or still to come, soonest first.
  const openExpos = allExpos
    .filter((e) => expoStatus(e) !== "past")
    .sort((a, b) => (a.days?.[0] || "9999").localeCompare(b.days?.[0] || "9999"));

  // ───────────── Contact links ─────────────
  function waUrl(text) {
    return `https://wa.me/${config.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  }
  $$("[data-wa]").forEach((a) => (a.href = waUrl(a.dataset.waText || "Hi AOD, I'd like to book a reel for my expo stall.")));
  $$("[data-phone]").forEach((a) => (a.href = config.phoneHref));
  $$("[data-phone-text]").forEach((el) => (el.textContent = config.phoneDisplay));
  $$("[data-email]").forEach((a) => (a.href = `mailto:${config.email}`));
  $$("[data-email-text]").forEach((el) => (el.textContent = config.email));
  $$("[data-instagram]").forEach((a) => (a.href = config.instagramUrl));
  $$("[data-site]").forEach((a) => (a.href = config.siteUrl));
  $$("[data-privacy]").forEach((a) => (a.href = `${config.siteUrl}/privacy`));
  $$("[data-year]").forEach((el) => (el.textContent = String(new Date().getFullYear())));

  // ───────────── "Now booking" line in the hero ─────────────
  (function liveChip() {
    const expo = openExpos[0];
    if (!expo) return;
    const where = [expo.venue, expo.city].filter(Boolean).join(", ");
    const when = expoStatus(expo) === "live" ? `On now, till ${fmt(expo.days[expo.days.length - 1], { day: "numeric", month: "short" })}` : rangeText(expo.days);
    $("[data-live-text]").textContent = `Booking now for ${expo.name} · ${when}${where ? ` · ${where}` : ""}`;
    $("[data-live]").hidden = false;
  })();

  // ───────────── The offer card in the hero (config.offer) ─────────────
  const offer = config.offer || {};
  const priceText = offer.price ? `₹${Number(offer.price).toLocaleString("en-IN")}` : "";
  (function offerCard() {
    const card = $("[data-offer]");
    if (!card) return;
    if (!offer.name) return (card.hidden = true);
    $("[data-offer-price]").textContent = priceText;
    $("[data-offer-unit]").textContent = offer.priceNote ? ` ${offer.priceNote}` : "";
    $("[data-offer-name]").textContent = offer.name;
    $("[data-offer-includes]").innerHTML = (offer.includes || [])
      .map((line) => `<li><svg><use href="#i-check" /></svg><span>${escapeHtml(line)}</span></li>`)
      .join("");
    $("[data-offer-samples]").innerHTML = (offer.samples || [])
      .map((s) => `<a class="offer__sample" href="${escapeHtml(s.url)}" target="_blank" rel="noopener"><svg><use href="#i-film" /></svg>${escapeHtml(s.label)}</a>`)
      .join("");
  })();

  // "Congratulations on your stall at FIRSST 2026 🎉" when an expo is on or coming up.
  if (openExpos[0]) $("[data-congrats]").textContent = `Congratulations on your stall at ${openExpos[0].name} 🎉`;

  // ───────────── Brand logos (two copies, so the loop never shows a gap) ─────────────
  (function brands() {
    const track = $("[data-brands]");
    if (!track) return;
    const list = [
      ["gate-2026-expo.png", "GATE 2026 – GCCI Annual Trade Expo"],
      ["gcci.png", "Gujarat Chamber of Commerce & Industry"],
      ["aluminium-bharat-logo.png", "Aluminium Bharat"],
      ["concord-biotech.png", "Concord Biotech"],
      ["arvind-smartspaces.png", "Arvind Smartspaces"],
      ["power-hydrotech-logo.png", "Power Hydrotech"],
      ["saru-aikoh-chemicals-logo.png", "Saru Aikoh Chemicals"],
      ["ganesh-housing.png", "Ganesh Housing"],
      ["atoa-technologies.png", "ATOA Technologies"],
      ["galco.png", "Galco"],
      ["fct.png", "FCT Surface Innovators"],
      ["ralco-extrusion.png", "Ralco Extrusion"],
      ["swastik-furnaces.png", "Swastik Furnaces"],
      ["kyb-conmat.png", "KYB Conmat"],
      ["mmr-mayur-group.png", "MMR Mayur Group"],
      ["honeyveda.png", "HoneyVeda"],
      ["neerain.png", "NeeRain"],
      ["aegis-infoware.png", "Aegis Infoware"],
      ["house-of-starts.png", "House of Starts"],
      ["shree-ramji-logo.png", "Shree Ramji Buildcon Group"],
      ["ayodhya-logo.png", "Ayodhya"],
      ["lalaji.png", "Lalaji"],
      ["meraki.png", "Meraki"],
      ["gtz.png", "GTZ"],
      ["hi-interior-hardware.png", "HI Interior Hardware"],
      ["organilicious.png", "Organilicious"],
      ["mandalam.png", "Mandalam"],
    ];
    const make = (copy) =>
      list.forEach(([file, name]) => {
        const img = document.createElement("img");
        img.src = `assets/img/brands/${file}`;
        img.alt = copy ? "" : name;
        img.loading = "lazy";
        img.decoding = "async";
        if (copy) {
          img.className = "dup";
          img.setAttribute("aria-hidden", "true");
        }
        // Wide wordmarks shorter, square badges taller, so each logo carries about the same weight.
        img.addEventListener("load", () => {
          const ratio = img.naturalWidth / img.naturalHeight || 2;
          img.style.height = `${Math.round(Math.max(28, Math.min(64, 64 / Math.sqrt(ratio))))}px`;
        });
        track.appendChild(img);
      });
    make(false);
    make(true);
  })();

  // ───────────── Videos ─────────────
  const lowData = (() => {
    const c = navigator.connection;
    return Boolean(c && (c.saveData || /2g$/.test(c.effectiveType || "")));
  })();

  // Play a video only while it's on screen.
  function playWhileVisible(video) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.15 }).observe(video);
  }

  // The hero footage: the still poster shows first; the video joins once the page has loaded.
  window.addEventListener("load", () => {
    if (reduceMotion || lowData) return;
    const media = $(".hero__media");
    const portrait = window.matchMedia("(max-aspect-ratio: 2/3)").matches;
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-hidden", "true");
    const base = portrait ? "assets/media/hero-portrait" : "assets/media/hero-1080";
    [
      [`${base}-av1.mp4`, portrait ? 'video/mp4; codecs="av01.0.04M.08"' : 'video/mp4; codecs="av01.0.08M.08"'],
      [`${base}.mp4`, 'video/mp4; codecs="avc1.640028"'],
    ].forEach(([src, type]) => {
      const s = document.createElement("source");
      s.src = src;
      s.type = type;
      video.appendChild(s);
    });
    video.addEventListener("playing", () => video.classList.add("is-playing"), { once: true });
    media.appendChild(video);
    playWhileVisible(video);
  });

  // The portfolio film: plays (muted) while on screen; with reduced motion it gets controls instead.
  $$("video[data-autoplay]").forEach((video) => {
    if (reduceMotion || lowData) {
      video.controls = true;
      video.preload = "metadata";
      return;
    }
    playWhileVisible(video);
  });

  // ───────────── More portfolio work (data/portfolio.js) ─────────────
  (function morePortfolio() {
    const list = $("[data-portfolio]");
    if (!list || !portfolio.length) return;
    portfolio.forEach((item) => {
      const li = document.createElement("li");
      const fig = document.createElement("figure");
      let media;
      if (item.type === "video") {
        media = document.createElement("video");
        media.src = item.src;
        if (item.poster) media.poster = item.poster;
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.preload = "none";
        if (reduceMotion) media.controls = true;
        else playWhileVisible(media);
      } else {
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.title || "";
        img.loading = "lazy";
        media = img;
        if (item.type === "link" && item.href) {
          const a = document.createElement("a");
          a.href = item.href;
          a.target = "_blank";
          a.rel = "noopener";
          a.appendChild(img);
          media = a;
        }
      }
      const cap = document.createElement("figcaption");
      cap.textContent = item.title || "";
      if (item.client) {
        const span = document.createElement("span");
        span.textContent = item.client;
        cap.appendChild(span);
      }
      fig.append(media, cap);
      li.appendChild(fig);
      list.appendChild(li);
    });
    list.hidden = false;
  })();

  // ───────────── Scroll-in ─────────────
  (function reveal() {
    const items = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) return items.forEach((el) => el.classList.add("is-in"));
    const seen = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            seen.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    items.forEach((el) => seen.observe(el));
  })();

  // ───────────── Phone bar: hidden while the form (or the footer) is on screen ─────────────
  (function mobileCta() {
    const bar = $("[data-mobile-cta]");
    if (!bar) return;
    const visible = new Set();
    const seen = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      bar.classList.toggle("is-hidden", visible.size > 0);
    });
    [$("#book"), $(".footer"), $(".hero__ctas")].forEach((el) => el && seen.observe(el));
  })();

  // ───────────── The booking form ─────────────
  const form = $("#booking-form");
  const done = $("[data-done]");
  const expoSelect = $("#expo");
  const otherWrap = $("[data-other-expo]");
  const otherInput = $("#otherExpo");
  const expoCard = $("[data-expo-card]");
  const daysWrap = $("[data-days]");
  const dateWrap = $("[data-date-input]");
  const dateInput = $("#shootDate");
  const proofInput = $("#proof");
  const upload = $("[data-upload]");
  const submitBtn = $("[data-submit]");
  const submitLabel = $("[data-submit-label]");
  const formError = $("[data-form-error]");
  const params = new URLSearchParams(location.search);
  const metBy = (params.get("by") || "").trim().slice(0, 60);
  const saving = Boolean(config.submitUrl);
  let proof = null; // { name, type, data } with data as base64 (no "data:" prefix)
  let lastMessage = "";

  if (metBy) {
    const el = $("[data-met-by]");
    el.textContent = `Met by ${metBy} from AOD`;
    el.hidden = false;
  }
  submitLabel.textContent = saving ? "Book my stall reel" : "Send on WhatsApp";
  $("[data-form-note]").textContent = saving
    ? "We confirm your booking on WhatsApp once we've checked the payment."
    : "This opens WhatsApp with your details filled in. Attach your payment screenshot there and press send.";

  // Expo list.
  (function fillExpos() {
    const opts = [];
    if (openExpos.length !== 1) opts.push(`<option value="">Choose the expo</option>`);
    openExpos.forEach((e) => {
      const when = rangeText(e.days);
      opts.push(`<option value="${e.id}">${escapeHtml(e.name)}${when ? ` · ${when}` : ""}</option>`);
    });
    if (config.allowOtherExpo || !openExpos.length) opts.push(`<option value="${OTHER}">Another expo (type its name)</option>`);
    expoSelect.innerHTML = opts.join("");
    const wanted = params.get("expo");
    if (wanted && openExpos.some((e) => e.id === wanted)) expoSelect.value = wanted;
    if (!openExpos.length) expoSelect.value = OTHER;
  })();

  function currentExpo() {
    return openExpos.find((e) => e.id === expoSelect.value) || null;
  }

  // The expo's details and its days as choices; "another expo" gets a name box and a date picker.
  function onExpoChange() {
    const expo = currentExpo();
    const other = expoSelect.value === OTHER;
    otherWrap.hidden = !other;
    dateWrap.hidden = !other;
    daysWrap.hidden = other;
    clearError("expo");
    clearError("days");
    if (!expo) {
      expoCard.hidden = true;
      daysWrap.innerHTML = "";
      return;
    }
    const lines = [];
    lines.push(`<strong>${escapeHtml(expo.fullName || expo.name)}</strong>`);
    if (expo.days?.length) lines.push(`<p><svg><use href="#i-calendar" /></svg><span>${rangeText(expo.days)}${expo.hours ? ` · ${escapeHtml(expo.hours)}` : ""}</span></p>`);
    const where = [expo.venue, expo.city].filter(Boolean).map(escapeHtml).join(", ");
    if (where) lines.push(`<p><svg><use href="#i-pin" /></svg><span>${where}</span></p>`);
    if (expo.website) lines.push(`<p><svg><use href="#i-arrow" /></svg><a href="${escapeHtml(expo.website)}" target="_blank" rel="noopener">Expo website</a></p>`);
    expoCard.innerHTML = lines.join("");
    expoCard.hidden = false;

    // A chip per day; days already over can't be picked. Today is picked to start with.
    daysWrap.innerHTML = (expo.days || [])
      .map((day) => {
        const past = day < todayIST;
        const note = day === todayIST ? "Today" : past ? "Over" : "";
        return `<label class="chip${past ? " chip--past" : ""}">
          <input type="checkbox" name="days" value="${day}"${past ? " disabled" : ""}${day === todayIST ? " checked" : ""} />
          <span>${dayLabel(day)}${note ? `<small>${note}</small>` : ""}</span>
        </label>`;
      })
      .join("");
  }
  expoSelect.addEventListener("change", () => {
    onExpoChange();
    saveDraft();
  });
  onExpoChange();

  // Payment details from config.js.
  (function fillPayment() {
    const pay = config.payment || {};
    const box = $("[data-pay]");
    const note = (pay.note || "").replace("{price}", priceText || "the amount agreed");
    const parts = [`<p class="pay__note">${escapeHtml(note)}</p>`];
    if (pay.upiId || pay.qrImage) {
      parts.push(`<div class="pay__box">`);
      if (pay.qrImage) parts.push(`<img class="pay__qr" src="${escapeHtml(pay.qrImage)}" alt="UPI QR code for ${escapeHtml(pay.payeeName || "AOD")}" />`);
      if (pay.upiId) {
        const upiLink = `upi://pay?pa=${encodeURIComponent(pay.upiId)}&pn=${encodeURIComponent(pay.payeeName || "AOD")}&cu=INR&tn=${encodeURIComponent("AOD expo stall reel")}`;
        parts.push(`<div class="pay__upi"><code>${escapeHtml(pay.upiId)}</code><button class="pay__copy" type="button" data-copy="${escapeHtml(pay.upiId)}">Copy UPI ID</button></div>`);
        // Phones only: opens the UPI apps (the amount is typed there).
        if (/Android|iPhone|iPad/i.test(navigator.userAgent)) parts.push(`<a class="btn btn--outline pay__app" href="${upiLink}">Pay with a UPI app</a>`);
      }
      parts.push(`</div>`);
    } else {
      parts.push(`<p class="pay__note" style="margin-top:.5rem"><strong>Ask the AOD team at the expo for the payment QR</strong>, or <a href="${waUrl("Hi AOD, please send the payment details for my expo stall crew.")}" target="_blank" rel="noopener">get it on WhatsApp</a>.</p>`);
    }
    box.innerHTML = parts.join("");
    const copy = $("[data-copy]", box);
    if (copy)
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(copy.dataset.copy);
          copy.textContent = "Copied";
        } catch {
          copy.textContent = "Copy failed";
        }
        setTimeout(() => (copy.textContent = "Copy UPI ID"), 2000);
      });
  })();

  // Payment screenshot: shrunk in the browser (longest side 1600px, JPEG) so it sends fast on expo Wi-Fi.
  proofInput.addEventListener("change", async () => {
    const file = proofInput.files && proofInput.files[0];
    clearError("proof");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      proof = null;
      return showError("proof", "Please add an image (a screenshot or a photo).");
    }
    try {
      proof = await shrink(file);
    } catch {
      proof = null;
      return showError("proof", "Couldn't read that image. Please try another screenshot.");
    }
    $("[data-upload-preview]").src = `data:${proof.type};base64,${proof.data}`;
    $("[data-upload-name]").textContent = file.name;
    $("[data-upload-empty]").hidden = true;
    $("[data-upload-filled]").hidden = false;
  });

  function shrink(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const max = 1600;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const data = canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
        resolve({ name: file.name.replace(/\.[^.]+$/, "") + ".jpg", type: "image/jpeg", data });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("unreadable"));
      };
      img.src = url;
    });
  }

  // ── Draft: typed answers survive a reload or a dropped connection (not the screenshot). ──
  const draftFields = ["company", "stall", "name", "role", "phone", "email", "brief", "otherExpo"];
  function saveDraft() {
    try {
      const draft = { expo: expoSelect.value };
      draftFields.forEach((f) => (draft[f] = form.elements[f].value));
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }
  (function restoreDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (!draft) return;
      if (draft.expo && !params.get("expo") && [...expoSelect.options].some((o) => o.value === draft.expo)) {
        expoSelect.value = draft.expo;
        onExpoChange();
      }
      draftFields.forEach((f) => {
        if (draft[f]) form.elements[f].value = draft[f];
      });
    } catch {}
  })();
  form.addEventListener("input", (e) => {
    if (e.target.name) clearError(e.target.name === "days" ? "days" : e.target.name);
    saveDraft();
  });

  // ── Checks ──
  function cleanPhone(raw) {
    let d = String(raw || "").replace(/\D/g, "");
    if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
    if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
    return d;
  }
  function showError(name, message) {
    const el = $(`[data-error-for="${name}"]`);
    if (el) el.textContent = message;
    const input = name === "proof" ? upload : form.elements[name];
    if (input && input.classList) input.classList.add("is-invalid");
    if (input && input.setAttribute) input.setAttribute("aria-invalid", "true");
    return false;
  }
  function clearError(name) {
    const el = $(`[data-error-for="${name}"]`);
    if (el) el.textContent = "";
    const input = name === "proof" ? upload : form.elements[name];
    if (input && input.classList) input.classList.remove("is-invalid");
    if (input && input.removeAttribute) input.removeAttribute("aria-invalid");
  }

  function collect() {
    const expo = currentExpo();
    const other = expoSelect.value === OTHER;
    const days = other ? (dateInput.value ? [dateInput.value] : []) : $$('input[name="days"]:checked', daysWrap).map((i) => i.value);
    const v = (n) => form.elements[n].value.trim();
    return {
      expoId: other ? "" : expo ? expo.id : "",
      expoName: other ? v("otherExpo") : expo ? expo.name : "",
      expoDates: expo ? rangeText(expo.days) : "",
      expoVenue: expo ? [expo.venue, expo.city].filter(Boolean).join(", ") : "",
      company: v("company"),
      stall: v("stall"),
      name: v("name"),
      role: v("role"),
      phone: cleanPhone(v("phone")),
      email: v("email"),
      days,
      brief: v("brief"),
      package: offer.name ? `${offer.name}${priceText ? ` (${priceText})` : ""}` : "",
      consent: form.elements.consent.checked,
      trap: form.elements.aod_trap.value,
      metBy,
    };
  }

  function validate(d) {
    let ok = true;
    const need = (name, value, message) => {
      if (!value) ok = showError(name, message);
    };
    if (expoSelect.value === OTHER) need("otherExpo", d.expoName, "Please type the expo's name.");
    else need("expo", d.expoId, "Please choose the expo.");
    need("company", d.company, "Please add your company name.");
    need("stall", d.stall, "Please add your stall number.");
    need("name", d.name, "Please add the contact person's name.");
    need("role", d.role, "Please add their designation.");
    if (!d.phone) ok = showError("phone", "Please add a contact number.");
    else if (!/^[6-9]\d{9}$/.test(d.phone)) ok = showError("phone", "Please enter a 10-digit Indian mobile number.");
    if (!d.email) ok = showError("email", "Please add an email address.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) ok = showError("email", "That email doesn't look right.");
    if (!d.days.length) ok = showError("days", "Please pick at least one day to shoot.");
    if (!proof) ok = showError("proof", "Please add the screenshot of your payment.");
    if (!d.consent) ok = showError("consent", "Please tick this so we can contact you about the booking.");
    return ok;
  }

  function makeRef() {
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let code = "";
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    bytes.forEach((b) => (code += alphabet[b % alphabet.length]));
    return `EXP-${todayIST.slice(2).replace(/-/g, "")}-${code}`;
  }

  function message(d, ref, savedProof) {
    const lines = [
      `*Expo stall booking* · ${ref}`,
      `Expo: ${d.expoName}${d.expoDates ? ` (${d.expoDates}${d.expoVenue ? `, ${d.expoVenue}` : ""})` : ""}`,
      `Company: ${d.company}`,
      `Stall: ${d.stall}`,
      ...(d.package ? [`Package: ${d.package}`] : []),
      `Contact: ${d.name}, ${d.role}`,
      `Phone: +91 ${d.phone}`,
      `Email: ${d.email}`,
      `Shoot date${d.days.length > 1 ? "s" : ""}: ${d.days.map(dayLabel).join(", ")}`,
    ];
    if (d.brief) lines.push(`Brief for the artists: ${d.brief}`);
    lines.push(savedProof ? "Payment screenshot: added on the booking page" : "Payment screenshot: attaching it in this chat");
    if (d.metBy) lines.push(`Met by: ${d.metBy}`);
    return lines.join("\n");
  }

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.innerHTML = busy ? `<span class="spinner" aria-hidden="true"></span> <span data-submit-label>Saving…</span>` : `<span data-submit-label>${saving ? "Book my stall reel" : "Send on WhatsApp"}</span>`;
  }

  function showDone({ title, text, ref, waLabel }) {
    form.hidden = true;
    $("[data-done-title]").textContent = title;
    $("[data-done-text]").textContent = text;
    const refEl = $("[data-done-ref]");
    refEl.hidden = !ref;
    refEl.textContent = ref ? `Booking reference: ${ref}` : "";
    $("[data-done-wa]").href = waUrl(lastMessage);
    $("[data-done-wa-label]").textContent = waLabel;
    done.hidden = false;
    done.focus();
    done.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.hidden = true;
    $$(".field__error", form).forEach((el) => (el.textContent = ""));
    $$(".is-invalid", form).forEach((el) => el.classList.remove("is-invalid"));
    upload.classList.remove("is-invalid");
    const d = collect();
    if (!validate(d)) {
      const first = $(".is-invalid, [aria-invalid='true']", form);
      if (first) first.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      return;
    }
    const ref = makeRef();

    // No sheet connected yet: WhatsApp carries the booking, and the page says nothing was saved.
    if (!saving) {
      lastMessage = message(d, ref, false);
      window.open(waUrl(lastMessage), "_blank", "noopener");
      return showDone({
        title: "Finish on WhatsApp",
        text: "WhatsApp opened with your booking. Attach your payment screenshot and press send; AOD confirms your booking there. Nothing has been saved on this page yet.",
        ref,
        waLabel: "Open WhatsApp again",
      });
    }

    setBusy(true);
    const payload = { ...d, ref, createdAt: new Date().toISOString(), page: location.href, proof };
    try {
      const res = await fetch(config.submitUrl, {
        method: "POST",
        // text/plain keeps this a "simple" request, which Google Apps Script accepts from any site.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const out = await res.json();
      if (!out || !out.ok) throw new Error((out && out.error) || "not saved");
      lastMessage = message(d, out.ref || ref, true);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      showDone({
        title: "Booking received",
        text: `Thanks, ${d.name.split(" ")[0]}. We'll check the payment and confirm your booking on WhatsApp at +91 ${d.phone}.`,
        ref: out.ref || ref,
        waLabel: "Also message us on WhatsApp",
      });
    } catch {
      lastMessage = message(d, ref, false);
      formError.innerHTML = `We couldn't save your booking just now (the connection may be weak). Please try again, or <a href="${waUrl(lastMessage)}" target="_blank" rel="noopener">send it on WhatsApp</a> and attach the screenshot there.`;
      formError.hidden = false;
    } finally {
      setBusy(false);
    }
  });

  // "Book another stall": a clean form, same expo (handy when the AOD team goes stall to stall).
  $("[data-again]").addEventListener("click", () => {
    const keepExpo = expoSelect.value;
    form.reset();
    expoSelect.value = keepExpo;
    onExpoChange();
    proof = null;
    $("[data-upload-empty]").hidden = false;
    $("[data-upload-filled]").hidden = true;
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    done.hidden = true;
    form.hidden = false;
    $("#company").focus();
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
})();
