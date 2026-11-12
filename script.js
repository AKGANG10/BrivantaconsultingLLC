(() => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-navigation");
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  const submitButton = contactForm?.querySelector("[type='submit']");
  const year = document.querySelector("#current-year");
  const header = document.querySelector(".site-header");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = String(new Date().getFullYear());

  if (menuToggle && navigation) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      navigation.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        const interest = link.dataset.interest;
        const interestField = contactForm?.elements.namedItem("interest");
        if (interest && interestField) interestField.value = interest;
        closeMenu();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigation.classList.contains("is-open")) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  document.querySelectorAll("a[data-interest]").forEach((link) => {
    link.addEventListener("click", () => {
      const interestField = contactForm?.elements.namedItem("interest");
      if (interestField) interestField.value = link.dataset.interest;
    });
  });

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if ("IntersectionObserver" in window && !reducedMotion) {
    document.documentElement.classList.add("motion-enabled");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    revealItems.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 65}ms`);
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const parallaxElements = [...document.querySelectorAll("[data-parallax]")];
  const serviceCards = [...document.querySelectorAll(".service-card")];
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (finePointer && !reducedMotion) {
    serviceCards.forEach((card) => {
      let frameRequested = false;
      let pointerX = 50;
      let pointerY = 0;

      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        pointerX = ((event.clientX - bounds.left) / bounds.width) * 100;
        pointerY = ((event.clientY - bounds.top) / bounds.height) * 100;
        if (frameRequested) return;

        frameRequested = true;
        window.requestAnimationFrame(() => {
          card.style.setProperty("--pointer-x", `${pointerX}%`);
          card.style.setProperty("--pointer-y", `${pointerY}%`);
          frameRequested = false;
        });
      }, { passive: true });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--pointer-x", "50%");
        card.style.setProperty("--pointer-y", "0%");
      }, { passive: true });
    });
  }

  const progressBar = document.querySelector(".scroll-progress span");
  if (parallaxElements.length || progressBar) {
    let frameRequested = false;
    const updateScrollEffects = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 14);
      if (progressBar) {
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
      }

      if (!reducedMotion) {
        parallaxElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
          element.style.setProperty("--parallax-shift", `${(progress - 0.5) * 16}px`);
        });
      }
      frameRequested = false;
    };

    const requestScrollUpdate = () => {
      if (!frameRequested) {
        frameRequested = true;
        window.requestAnimationFrame(updateScrollEffects);
      }
    };
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate, { passive: true });
    updateScrollEffects();
  }

  if (contactForm && formStatus && submitButton) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      formStatus.textContent = "";

      if (!contactForm.reportValidity()) return;

      const formData = new FormData(contactForm);
      const config = window.BRIVANTA_EMAILJS_CONFIG || {};
      const { serviceId, templateId, publicKey } = config;
      const values = Object.fromEntries(formData.entries());

      if (!serviceId || !templateId || !publicKey) {
        const subject = encodeURIComponent(`Website inquiry — ${values.interest}`);
        const body = encodeURIComponent(
          `Name: ${values.from_name}\nEmail: ${values.reply_to}\nOrganization: ${values.organization || "Not provided"}\nInquiry type: ${values.interest}\n\n${values.message}`
        );
        formStatus.textContent = "EmailJS is not connected yet. Your email app will open with this inquiry addressed to hr@brivantaconsultingllc.com.";
        window.location.href = `mailto:hr@brivantaconsultingllc.com?subject=${subject}&body=${body}`;
        return;
      }

      submitButton.disabled = true;
      submitButton.classList.add("is-sending");
      submitButton.setAttribute("aria-busy", "true");
      submitButton.innerHTML = 'Sending <span aria-hidden="true">…</span>';

      try {
        const inquiry = [
          `Inquiry type: ${values.interest}`,
          `Organization: ${values.organization || "Not provided"}`,
          "",
          values.message
        ].join("\n");

        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
              user_name: values.from_name,
              name: values.from_name,
              email: values.reply_to,
              time: new Date().toLocaleString(),
              message: inquiry
            }
          })
        });

        if (!response.ok) throw new Error("EmailJS did not accept the inquiry.");
        contactForm.reset();
        formStatus.textContent = "Thank you. Your inquiry has been sent, and our team will be in touch.";
      } catch (error) {
        console.error("Contact form delivery failed:", error);
        formStatus.textContent = "We couldn’t send your inquiry just now. Please email hr@brivantaconsultingllc.com or call 214-493-6750.";
      } finally {
        submitButton.disabled = false;
        submitButton.classList.remove("is-sending");
        submitButton.removeAttribute("aria-busy");
        submitButton.innerHTML = 'Send inquiry <span aria-hidden="true">↗</span>';
      }
    });
  }
})();
