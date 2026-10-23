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
  // Expos still on or still to come, soonest first (the hero's "Booking now" line).
  const byStart = (a, b) => (a.days?.[0] || "9999").localeCompare(b.days?.[0] || "9999");
  const openExpos = allExpos.filter((e) => expoStatus(e) !== "past").sort(byStart);
  // The form's expo list: those, then expos that ended in the last 30 days, so a shoot on a day
  // that has passed can still be booked or recorded afterwards.
  const KEEP_AFTER_END_DAYS = 30;
  const keepUntil = (e) => {
    const end = asDate(e.days[e.days.length - 1]);
    end.setUTCDate(end.getUTCDate() + KEEP_AFTER_END_DAYS);
    return end.toISOString().slice(0, 10);
  };
  const recentlyEnded = allExpos
    .filter((e) => expoStatus(e) === "past" && keepUntil(e) >= todayIST)
    .sort((a, b) => byStart(b, a)); // most recent first
  const formExpos = [...openExpos, ...recentlyEnded];

  // ───────────── Contact links ─────────────
  function waUrl(text) {
    return `https://wa.me/${config.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  }
  $$("[data-phone]").forEach((a) => (a.href = config.phoneHref));
  $$("[data-phone-text]").forEach((el) => (el.textContent = config.phoneDisplay));
  $$("[data-email]").forEach((a) => (a.href = `mailto:${config.email}`));
  $$("[data-email-text]").forEach((el) => (el.textContent = config.email));
  $$("[data-instagram]").forEach((a) => (a.href = config.instagramUrl));
  $$("[data-site]").forEach((a) => (a.href = config.siteUrl));
  $$("[data-privacy]").forEach((a) => (a.href = `${config.siteUrl}/privacy`));
  $$("[data-year]").forEach((el) => (el.textContent = String(new Date().getFullYear())));

  // ───────────── "Now booking" and "Congratulations" lines in the hero ─────────────
  // About one expo when the link names it (…/?expo=iif-2026, the expo's own QR code) or when only one
  // is on; otherwise about all of them ("Booking now for FIRSST 2026 & IIF 2026 · Gandhinagar").
  const linkedExpo = openExpos.find((e) => e.id === new URLSearchParams(location.search).get("expo"));
  const featured = linkedExpo || (openExpos.length === 1 ? openExpos[0] : null);
  (function liveChip() {
    if (!openExpos.length) return;
    let text;
    if (featured) {
      const where = [featured.venue, featured.city].filter(Boolean).join(", ");
      const end = featured.days[featured.days.length - 1];
      const when = expoStatus(featured) === "live" ? `On now, till ${fmt(end, { day: "numeric", month: "short" })}` : rangeText(featured.days);
      text = `Booking now for ${featured.name} · ${when}${where ? ` · ${where}` : ""}`;
    } else {
      const names = openExpos.map((e) => e.name);
      const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}` : names[0];
      const cities = [...new Set(openExpos.map((e) => e.city).filter(Boolean))];
      text = `Booking now for ${list}${cities.length === 1 ? ` · ${cities[0]}` : ""}`;
    }
    $("[data-live-text]").textContent = text;
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
    if (offer.wasPrice > offer.price) {
      const was = $("[data-offer-was]");
      was.textContent = `₹${Number(offer.wasPrice).toLocaleString("en-IN")}`;
      was.setAttribute("aria-label", `Was ${was.textContent}, now`);
      was.hidden = false;
    }
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
  // (Without one expo in view it keeps the page's "Congratulations on your stall at the expo 🎉".)
  // The congratulations follows the expo in the link even after it has ended (its days can still be booked).
  const congratsExpo = formExpos.find((e) => e.id === new URLSearchParams(location.search).get("expo")) || featured;
  if (congratsExpo) $("[data-congrats]").textContent = `Congratulations on your stall at ${congratsExpo.name} 🎉`; // keeps the 🎉 on the name's line

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
          img.style.height = `${Math.round(Math.max(44, Math.min(96, 96 / Math.sqrt(ratio))))}px`;
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

  // The portfolio film: plays (muted) while on screen; with reduced motion it gets controls instead.
  $$("video[data-autoplay]").forEach((video) => {
    if (reduceMotion || lowData) {
      video.controls = true;
      video.preload = "metadata";
      return;
    }
    playWhileVisible(video);
  });

  // The reel in the hero's middle column (heroVideo in config.js). It plays muted while on screen,
  // with a round button for sound, and a tap on the video pauses it or plays it again. On laptops
  // and desktops (a wide screen and a mouse), scrolling past the hero shrinks it into a small player
  // in the bottom-left corner that keeps playing, with a ✕ to close it (it then stays closed for
  // the visit); scrolling back up returns it to its place. Someone who paused it doesn't get the
  // small player. It starts only once the rest of the page has loaded, so the reel never slows the
  // first view; with reduced motion or Data Saver it waits for a tap instead (player controls).
  (function heroReel() {
    const reel = config.heroVideo || {};
    const box = $("[data-hero-reel]");
    if (!box || !reel.src) return;
    box.classList.add("has-video");
    // The frame holds the player and moves to the corner; the box keeps its size, so nothing jumps.
    box.innerHTML =
      `<div class="reel-frame is-paused">` +
      `<video muted loop playsinline preload="none"${reel.poster ? ` poster="${escapeHtml(reel.poster)}"` : ""} aria-label="${escapeHtml(reel.label || "Reel")}">` +
      `<source src="${escapeHtml(reel.src)}" type="video/mp4" /></video>` +
      `<button class="reel-toggle" type="button" aria-label="Play the reel"><svg><use href="#i-play" /></svg></button>` +
      `<button class="reel-sound" type="button" aria-pressed="false" aria-label="Turn sound on"><svg><use href="#i-volume-off" /></svg></button>` +
      `<button class="reel-close" type="button" aria-label="Close the player" hidden><svg><use href="#i-x" /></svg></button>` +
      `</div>`;
    const frame = $(".reel-frame", box);
    const video = $("video", frame);
    const toggle = $(".reel-toggle", frame);
    const sound = $(".reel-sound", frame);
    const close = $(".reel-close", frame);

    sound.addEventListener("click", () => {
      video.muted = !video.muted;
      if (!video.muted) video.play().catch(() => {});
      sound.setAttribute("aria-pressed", String(!video.muted));
      sound.setAttribute("aria-label", video.muted ? "Turn sound on" : "Turn sound off");
      sound.innerHTML = `<svg><use href="#i-${video.muted ? "volume-off" : "volume"}" /></svg>`;
    });
    if (reduceMotion || lowData) {
      video.controls = true;
      sound.hidden = true;
      toggle.hidden = true;
      frame.classList.remove("is-paused");
      return;
    }

    // The play icon shows while the reel is paused.
    const showState = () => {
      frame.classList.toggle("is-paused", video.paused);
      toggle.setAttribute("aria-label", video.paused ? "Play the reel" : "Pause the reel");
    };
    video.addEventListener("play", showState);
    video.addEventListener("pause", showState);

    const desktop = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    let started = false; // the page has loaded (or someone tapped play)
    let userPaused = false; // paused by a tap, so it stays paused
    let inView = false; // its place in the hero is on screen
    let mini = false; // in the corner
    let closed = false; // the small player was closed with ✕
    let above = false; // its place has scrolled up past the top of the screen

    // Plays while it can be seen (in its place or in the corner) unless someone paused it.
    function apply() {
      if (!started) return;
      const play = !userPaused && (inView || mini);
      if (play && video.paused) video.play().catch(() => {});
      if (!play && !video.paused) video.pause();
    }
    function setMini(on) {
      if (mini === on) return;
      mini = on;
      frame.classList.toggle("is-mini", on);
      close.hidden = !on;
    }
    function update() {
      setMini(started && above && desktop.matches && !closed && !userPaused);
      apply();
    }

    toggle.addEventListener("click", () => {
      started = true;
      userPaused = !video.paused;
      if (userPaused) video.pause();
      else video.play().catch(() => {});
    });
    close.addEventListener("click", () => {
      closed = true;
      update(); // back in its place, which is off screen, so it pauses
    });
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      above = !inView && entry.boundingClientRect.bottom < 0;
      update();
    }).observe(box);
    desktop.addEventListener("change", update);

    const start = () => {
      started = true;
      update();
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
  })();

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
  const submitBtn = $("[data-submit]");
  const submitLabel = $("[data-submit-label]");
  const formError = $("[data-form-error]");
  const params = new URLSearchParams(location.search);
  const metBy = (params.get("by") || "").trim().slice(0, 60);
  const saving = Boolean(config.submitUrl);
  // The upload (the payment screenshot), shrunk in the browser to 1600px JPEG so it sends fast on
  // expo Wi-Fi. Kept as { name, type, data, original } with data as base64 (no "data:" prefix).
  const files = { proof: null };
  const uploadSettings = {
    proof: { max: 1600, type: "image/jpeg", unreadable: "Couldn't read that image. Please try another screenshot." },
  };
  const uploadBox = (name) => $(`[data-upload="${name}"]`);

  // Payment: the amount is the offer's price for each shoot day picked (2 days = 2 × ₹3,499).
  // On phones the QR, the UPI ID and the Pay button open the person's UPI app with that amount
  // filled in (a upi:// link); iPhones also get buttons for Google Pay, PhonePe and Paytm, since iOS
  // has no reliable "choose a UPI app" for upi:// links. Laptops show the QR to scan with a phone.
  const pay = config.payment || {};
  const appleDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const phone = appleDevice || /Android/i.test(navigator.userAgent);
  const upiApps = [
    { label: "Google Pay", base: "gpay://upi/pay?" },
    { label: "PhonePe", base: "phonepe://pay?" },
    { label: "Paytm", base: "paytmmp://pay?" },
  ];
  const rupees = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
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
    // No expo is picked to start with (not even from a ?expo= link); the exhibitor chooses it.
    opts.push(`<option value="">Choose the expo</option>`);
    formExpos.forEach((e) => {
      const when = rangeText(e.days);
      const ended = expoStatus(e) === "past" ? " (ended)" : "";
      opts.push(`<option value="${e.id}">${escapeHtml(e.name)}${when ? ` · ${when}` : ""}${ended}</option>`);
    });
    if (config.allowOtherExpo || !formExpos.length) opts.push(`<option value="${OTHER}">Another expo (type its name)</option>`);
    expoSelect.innerHTML = opts.join("");
    if (!formExpos.length) expoSelect.value = OTHER;
  })();

  function currentExpo() {
    return formExpos.find((e) => e.id === expoSelect.value) || null;
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

    // A chip per day, and one day can be picked (a radio). Days that have passed can still be picked,
    // so a shoot can be booked or recorded afterwards. Today is picked to start with.
    daysWrap.innerHTML = (expo.days || [])
      .map((day) => {
        const note = day === todayIST ? "Today" : "";
        return `<label class="chip">
          <input type="radio" name="days" value="${day}"${day === todayIST ? " checked" : ""} />
          <span>${dayLabel(day)}${note ? `<small>${note}</small>` : ""}</span>
        </label>`;
      })
      .join("");
    updatePayment();
  }
  expoSelect.addEventListener("change", () => {
    onExpoChange();
    saveDraft();
  });
  onExpoChange();

  // The days picked in the form (the chips, or the date box for "another expo").
  function selectedDays() {
    if (expoSelect.value === OTHER) return dateInput.value ? [dateInput.value] : [];
    return $$('input[name="days"]:checked', daysWrap).map((i) => i.value);
  }
  function amountFor(days) {
    return (Number(offer.price) || 0) * Math.max(1, days.length);
  }

  // Payment details from config.js.
  (function fillPayment() {
    const box = $("[data-pay]");
    if (!pay.upiId && !pay.qrImage) {
      box.innerHTML = `<p class="pay__note"><strong>Ask the AOD team at the expo for the payment QR</strong>, or <a href="${waUrl("Hi AOD, please send the payment details for my expo stall reel.")}" target="_blank" rel="noopener">get it on WhatsApp</a>.</p>`;
      return;
    }
    const tap = phone && pay.upiId; // on phones, the QR and the UPI ID open the UPI app
    const name = pay.payeeName ? ` Your app will show <strong>${escapeHtml(pay.payeeName)}</strong>.` : "";
    const parts = [
      `<div class="pay__amount" aria-live="polite"><span>Amount to pay</span><strong data-pay-amount></strong><small data-pay-breakdown></small></div>`,
      `<div class="pay__box">`,
    ];
    if (pay.qrImage) {
      const img = `<img src="${escapeHtml(pay.qrImage)}" alt="UPI QR code${pay.upiId ? ` for ${escapeHtml(pay.upiId)}` : ""}" width="832" height="935" />`;
      parts.push(
        `<figure class="pay__qr">${tap ? `<a data-upi-link aria-label="Pay in your UPI app">${img}</a>` : img}` +
          `<figcaption>${tap ? "Tap the QR to pay in your UPI app, or scan it from another phone." : "Scan with any UPI app on your phone."}${name}</figcaption></figure>`,
      );
    }
    if (pay.upiId) {
      const id = `<code>${escapeHtml(pay.upiId)}</code>`;
      parts.push(`<div class="pay__upi">${tap ? `<a class="pay__id" data-upi-link>${id}</a>` : id}<button class="pay__copy" type="button" data-copy="${escapeHtml(pay.upiId)}">Copy UPI ID</button></div>`);
    }
    if (tap) {
      parts.push(`<a class="btn btn--primary btn--lg pay__app" data-upi-link><span data-pay-cta></span></a>`);
      // Some UPI apps (BHIM especially) refuse payment links to a personal UPI ID with "request type
      // not supported"; the way round is to pay the UPI ID by hand.
      parts.push(`<p class="pay__hint" data-pay-hint></p>`);
    }
    if (tap && appleDevice)
      parts.push(`<p class="pay__or">Or open your app:</p><div class="pay__apps">${upiApps.map((a) => `<a class="pay__appbtn" data-upi-app="${a.base}">${a.label}</a>`).join("")}</div>`);
    parts.push(`</div>`);
    const note = (pay.note || "").replace("{price}", priceText || "the amount agreed");
    if (note) parts.push(`<p class="pay__note pay__note--after">${escapeHtml(note)}</p>`);
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
    updatePayment();
  })();

  // The amount for the days picked, and UPI links that carry it (and the company, as the note).
  function updatePayment() {
    const amountEl = $("[data-pay-amount]");
    if (!amountEl) return;
    const days = selectedDays();
    const amount = amountFor(days);
    amountEl.textContent = rupees(amount);
    $("[data-pay-breakdown]").textContent = days.length
      ? `1 reel · shoot on ${dayLabel(days[0])}`
      : `${priceText} per reel · pick your shoot day above`;
    if (!pay.upiId) return;
    const company = form.elements.company.value.trim();
    const note = `AOD expo reel${company ? ` ${company}` : ""}`.slice(0, 40);
    // pa stays as typed (UPI IDs are letters, digits, . - _ and @); the rest is encoded.
    const query = `pa=${pay.upiId}&pn=${encodeURIComponent(pay.payeeName || "AOD")}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
    $$("[data-upi-link]").forEach((a) => (a.href = `upi://pay?${query}`));
    $$("[data-upi-app]").forEach((a) => (a.href = a.dataset.upiApp + query));
    const cta = $("[data-pay-cta]");
    if (cta) cta.textContent = `Pay ${rupees(amount)} in your UPI app`;
    const hint = $("[data-pay-hint]");
    if (hint) hint.textContent = `If your app says the request isn't supported (BHIM does this), copy the UPI ID above and pay ${rupees(amount)} in your app.`;
  }


  function showUpload(name, file) {
    const box = uploadBox(name);
    const has = Boolean(file);
    $("[data-upload-empty]", box).hidden = has;
    $("[data-upload-filled]", box).hidden = !has;
    $("[data-upload-preview]", box).src = has ? `data:${file.type};base64,${file.data}` : "";
    $("[data-upload-name]", box).textContent = has ? file.original : "";
  }

  Object.keys(uploadSettings).forEach((name) => {
    const input = $("input[type=file]", uploadBox(name));
    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      clearError(name);
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        files[name] = null;
        showUpload(name, null);
        return showError(name, "Please add an image (a screenshot, a photo or a PNG).");
      }
      try {
        files[name] = { ...(await shrink(file, uploadSettings[name])), original: file.name };
      } catch {
        files[name] = null;
        showUpload(name, null);
        return showError(name, uploadSettings[name].unreadable);
      }
      showUpload(name, files[name]);
    });
  });

  function shrink(file, { max, type }) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        // SVG logos can report no size; draw those at the largest size allowed.
        const w = img.naturalWidth || max;
        const h = img.naturalHeight || max;
        const scale = Math.min(1, max / Math.max(w, h));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext("2d");
        if (type === "image/jpeg") {
          ctx.fillStyle = "#fff"; // JPEG has no transparency
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const data = canvas.toDataURL(type, 0.82).split(",")[1];
        const ext = type === "image/png" ? ".png" : ".jpg";
        resolve({ name: file.name.replace(/\.[^.]+$/, "") + ext, type, data });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("unreadable"));
      };
      img.src = url;
    });
  }

  // ── Draft: typed answers survive a reload or a dropped connection (not the uploads). ──
  const draftFields = ["company", "stall", "name", "role", "phone", "email", "brief", "otherExpo"];
  function saveDraft() {
    try {
      const draft = {};
      draftFields.forEach((f) => (draft[f] = form.elements[f].value));
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }
  (function restoreDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (!draft) return;
      draftFields.forEach((f) => {
        if (draft[f]) form.elements[f].value = draft[f];
      });
    } catch {}
  })();
  form.addEventListener("input", (e) => {
    if (e.target.name) clearError(e.target.name === "days" ? "days" : e.target.name);
    saveDraft();
    updatePayment();
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
    const input = uploadSettings[name] ? uploadBox(name) : form.elements[name];
    if (input && input.classList) input.classList.add("is-invalid");
    if (input && input.setAttribute) input.setAttribute("aria-invalid", "true");
    return false;
  }
  function clearError(name) {
    const el = $(`[data-error-for="${name}"]`);
    if (el) el.textContent = "";
    const input = uploadSettings[name] ? uploadBox(name) : form.elements[name];
    if (input && input.classList) input.classList.remove("is-invalid");
    if (input && input.removeAttribute) input.removeAttribute("aria-invalid");
  }

  function collect() {
    const expo = currentExpo();
    const other = expoSelect.value === OTHER;
    const days = selectedDays();
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
      package: offer.name || "",
      amount: amountFor(days),
      amountText: offer.price ? `${rupees(amountFor(days))} (1 reel)` : "",
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
    if (!d.days.length) ok = showError("days", "Please pick the day to shoot.");
    if (!files.proof) ok = showError("proof", "Please add the screenshot of your payment.");
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
      ...(d.amountText ? [`Amount: ${d.amountText}`] : []),
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
    const wa = $("[data-done-wa]");
    wa.hidden = !waLabel;
    wa.href = waUrl(lastMessage);
    $("[data-done-wa-label]").textContent = waLabel || "";
    done.hidden = false;
    done.focus();
    done.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.hidden = true;
    $$(".field__error", form).forEach((el) => (el.textContent = ""));
    $$(".is-invalid", form).forEach((el) => el.classList.remove("is-invalid"));
    $$(".upload", form).forEach((el) => el.classList.remove("is-invalid"));
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
        text: `WhatsApp opened with your booking. Attach your payment screenshot and press send; AOD confirms your booking there. Nothing has been saved on this page yet.`,
        ref,
        waLabel: "Open WhatsApp again",
      });
    }

    setBusy(true);
    const strip = (f) => (f ? { name: f.name, type: f.type, data: f.data } : null);
    const payload = { ...d, ref, createdAt: new Date().toISOString(), page: location.href, proof: strip(files.proof) };
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
        waLabel: "",
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
    Object.keys(files).forEach((name) => {
      files[name] = null;
      showUpload(name, null);
    });
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
