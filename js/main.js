(function () {
  var nav = document.querySelector("[data-nav]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var year = document.querySelector("[data-year]");
  var video = document.querySelector("[data-hero-video]");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (video) {
    video.addEventListener(
      "canplay",
      function () {
        video.classList.add("is-ready");
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(function () {});
        }
      },
      { once: true }
    );

    video.addEventListener("error", function () {
      video.classList.remove("is-ready");
      video.removeAttribute("src");
      while (video.firstChild) {
        video.removeChild(video.firstChild);
      }
    });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 899px)").matches) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function bindCursorTilt(el, maxTiltDeg) {
    function update(e) {
      var r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      if (px < 0) px = 0;
      else if (px > 1) px = 1;
      if (py < 0) py = 0;
      else if (py > 1) py = 1;
      var cx = (px - 0.5) * 2;
      var cy = (py - 0.5) * 2;
      el.style.setProperty("--tilt-x", (-cy * maxTiltDeg).toFixed(3) + "deg");
      el.style.setProperty("--tilt-y", (cx * maxTiltDeg).toFixed(3) + "deg");
      el.style.setProperty("--sheen-x", (px * 100).toFixed(2) + "%");
      el.style.setProperty("--sheen-y", (py * 100).toFixed(2) + "%");
      el.style.setProperty("--sheen-tx", (cx * 22).toFixed(2));
      el.style.setProperty("--sheen-ty", (cy * 18).toFixed(2));
    }
    function onEnter() {
      el.classList.add("has-cursor-glow");
    }
    function onLeave() {
      el.classList.remove("has-cursor-glow");
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
      el.style.setProperty("--sheen-x", "50%");
      el.style.setProperty("--sheen-y", "50%");
      el.style.setProperty("--sheen-tx", "0");
      el.style.setProperty("--sheen-ty", "0");
    }
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", update);
    el.addEventListener("mouseleave", onLeave);
  }

  function bindImageHover(container, maxTiltDeg) {
    var img = container.querySelector("img");
    if (!img) return;

    function update(e) {
      var r = container.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      if (px < 0) px = 0;
      else if (px > 1) px = 1;
      if (py < 0) py = 0;
      else if (py > 1) py = 1;
      var cx = (px - 0.5) * 2;
      var cy = (py - 0.5) * 2;
      img.style.setProperty("--img-tilt-x", (-cy * maxTiltDeg).toFixed(2) + "deg");
      img.style.setProperty("--img-tilt-y", (cx * maxTiltDeg).toFixed(2) + "deg");
      img.style.setProperty("--img-scale", "1.08");
      container.style.setProperty("--img-shine-x", (px * 100).toFixed(1) + "%");
      container.style.setProperty("--img-shine-y", (py * 100).toFixed(1) + "%");
    }

    function onEnter() {
      container.classList.add("is-img-hover");
    }

    function onLeave() {
      container.classList.remove("is-img-hover");
      img.style.setProperty("--img-tilt-x", "0deg");
      img.style.setProperty("--img-tilt-y", "0deg");
      img.style.setProperty("--img-scale", "1");
      container.style.setProperty("--img-shine-x", "50%");
      container.style.setProperty("--img-shine-y", "50%");
    }

    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mousemove", update);
    container.addEventListener("mouseleave", onLeave);
  }

  function initImageHover() {
    if (reduceMotion.matches || !finePointer.matches) return;
    document.querySelectorAll(".gallery__cell").forEach(function (el) {
      bindImageHover(el, 5.5);
    });
    document.querySelectorAll(".split__media .frame").forEach(function (el) {
      bindImageHover(el, 4.5);
    });
  }

  function initTiltInteractions() {
    if (reduceMotion.matches || !finePointer.matches) return;
    document.querySelectorAll(".card").forEach(function (el) {
      bindCursorTilt(el, 7.5);
    });
    document.querySelectorAll(".btn").forEach(function (el) {
      bindCursorTilt(el, 5.5);
    });
    var fab = document.querySelector(".fab-wa");
    if (fab) bindCursorTilt(fab, 6);
  }

  initTiltInteractions();
  initImageHover();

  var SCROLL_STAGGER_MS = 200;

  function markScrollAnimate(el, variant) {
    el.classList.add("scroll-animate");
    if (variant) el.classList.add("scroll-animate--" + variant);
  }

  function collectScrollItems(section) {
    var items = [];

    function push(el, variant) {
      if (el && items.indexOf(el) === -1) {
        markScrollAnimate(el, variant);
        items.push(el);
      }
    }

    var head = section.querySelector(".section__head");
    if (head) {
      head.querySelectorAll(".section__title, .section__sub").forEach(function (el, i) {
        push(el, i === 0 ? null : "scale");
      });
    }

    push(section.querySelector(".split__media"), "left");
    push(section.querySelector(".split__content"), "right");

    section.querySelectorAll(".stats__item").forEach(function (el) {
      push(el, "scale");
    });

    section.querySelectorAll(
      ".grid--services > .card, .grid--pricing > .card, .grid--quotes > .quote, .gallery__cell"
    ).forEach(function (el, i) {
      push(el, i % 3 === 1 ? "scale" : null);
    });

    push(section.querySelector(".contact__intro"), "left");
    push(section.querySelector(".contact-form"), "right");
    push(section.querySelector(".section__foot"), null);

    section.querySelectorAll(".site-footer__grid > div").forEach(function (el) {
      push(el, null);
    });

    return items;
  }

  function clearSectionTimers(section) {
    if (!section._scrollTimers) return;
    section._scrollTimers.forEach(function (id) {
      window.clearTimeout(id);
    });
    section._scrollTimers = [];
  }

  function revealItemsStaggered(section, items, startDelayMs) {
    clearSectionTimers(section);
    section._scrollTimers = [];
    var start = startDelayMs || 0;
    items.forEach(function (el, i) {
      var id = window.setTimeout(function () {
        el.classList.add("is-visible");
      }, start + i * SCROLL_STAGGER_MS);
      section._scrollTimers.push(id);
    });
  }

  function revealAllItems(items) {
    items.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  function hideAllItems(items) {
    items.forEach(function (el) {
      el.classList.remove("is-visible");
    });
  }

  function prepareSectionScrollItems(section) {
    section._scrollItems = collectScrollItems(section);
    return section._scrollItems;
  }

  function hideSection(section) {
    clearSectionTimers(section);
    section.classList.remove("is-revealed");
    section._scrollActive = false;
    hideAllItems(section._scrollItems || []);
  }

  function revealSection(section) {
    if (section._scrollActive) return;

    var items = section._scrollItems || prepareSectionScrollItems(section);
    section.classList.add("is-revealed");
    section._scrollActive = true;

    if (reduceMotion.matches) {
      revealAllItems(items);
      return;
    }

    hideAllItems(items);
    revealItemsStaggered(section, items, 80);
  }

  function initHeroEntrance() {
    var hero = document.querySelector(".hero");
    if (!hero) return;

    var items = [];
    hero.querySelectorAll(".hero__content > *").forEach(function (el) {
      markScrollAnimate(el, null);
      items.push(el);
    });

    hero.classList.add("is-revealed");

    if (reduceMotion.matches) {
      revealAllItems(items);
      return;
    }

    var heroTimers = [];
    items.forEach(function (el, i) {
      heroTimers.push(
        window.setTimeout(function () {
          el.classList.add("is-visible");
        }, 220 + i * SCROLL_STAGGER_MS)
      );
    });
  }

  function initScrollReveal() {
    var sections = document.querySelectorAll(".scroll-reveal");
    var revealRatio = 0.1;
    var hideRatio = 0.035;

    sections.forEach(prepareSectionScrollItems);

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      sections.forEach(revealSection);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var section = entry.target;
          var ratio = entry.intersectionRatio;

          if (ratio >= revealRatio) {
            revealSection(section);
          } else if (ratio <= hideRatio) {
            hideSection(section);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px 8% 0px",
        threshold: [0, 0.035, 0.08, 0.1, 0.15, 0.25, 0.4],
      }
    );

    sections.forEach(function (section) {
      io.observe(section);
    });
  }

  function initScrollProgress() {
    var bar = document.querySelector(".scroll-progress__bar");
    if (!bar || reduceMotion.matches) return;

    function update() {
      var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      if (progress < 0) progress = 0;
      else if (progress > 1) progress = 1;
      bar.style.transform = "scaleX(" + progress.toFixed(4) + ")";
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initScrollParallax() {
    if (reduceMotion.matches) return;

    var heroPhoto = document.querySelector(".hero__photo");
    var heroContent = document.querySelector(".hero__content");
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY;
      var vh = window.innerHeight;
      if (y > vh * 1.2) return;

      var p = Math.min(y / vh, 1);
      if (heroPhoto) {
        heroPhoto.style.transform = "translate3d(0, " + (y * 0.14).toFixed(2) + "px, 0)";
      }
      if (heroContent) {
        heroContent.style.transform = "translate3d(0, " + (y * 0.22).toFixed(2) + "px, 0)";
        heroContent.style.opacity = String(1 - p * 0.35);
      }
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
  }

  initHeroEntrance();
  initScrollReveal();
  initScrollProgress();
  initScrollParallax();
  initInquiryBackend();
})();

function initInquiryBackend() {
  var form = document.querySelector("[data-inquiry-form]");
  if (!form) return;

  var packageSelect = form.querySelector("[data-inquiry-package]");
  var sourceInput = form.querySelector("[data-inquiry-source]");
  var statusEl = form.querySelector("[data-form-status]");
  var submitBtn = form.querySelector("[data-inquiry-submit]");
  var apiBase = form.getAttribute("data-api-base") || "";

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.hidden = !message;
    statusEl.textContent = message || "";
    statusEl.classList.remove("form-status--ok", "form-status--error");
    if (type) statusEl.classList.add("form-status--" + type);
  }

  function setPackage(value) {
    if (!packageSelect || !value) return;
    var option = packageSelect.querySelector('option[value="' + value + '"]');
    if (option) packageSelect.value = value;
  }

  document.querySelectorAll("[data-book-package]").forEach(function (link) {
    link.addEventListener("click", function () {
      var pkg = link.getAttribute("data-book-package");
      if (sourceInput) sourceInput.value = "book:" + (pkg || "general");
      setPackage(pkg);
      var messageField = form.querySelector('[name="message"]');
      if (pkg === "gallery" && messageField && !messageField.value) {
        messageField.value = "I would like to see more photos from your gallery.";
      }
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var payload = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value,
      package: form.package.value,
      message: form.message.value,
      source: sourceInput ? sourceInput.value : "contact-form",
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    setStatus("", "");

    fetch(apiBase + "/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok || !result.data.ok) {
          throw new Error((result.data && result.data.error) || "Could not send your message.");
        }
        setStatus(result.data.message, "ok");
        form.reset();
        if (sourceInput) sourceInput.value = "contact-form";
        if (packageSelect) packageSelect.value = "general";
      })
      .catch(function (err) {
        var offline =
          window.location.protocol === "file:" ||
          err.message === "Failed to fetch";
        if (offline) {
          setStatus(
            "Start the site with npm start so bookings can be sent to the server.",
            "error"
          );
        } else {
          setStatus(err.message || "Something went wrong. Please try WhatsApp.", "error");
        }
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send inquiry";
        }
      });
  });
}
