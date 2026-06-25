/**
 * DR. DILINI PERERA — Academic Portfolio
 * script.js — All interactive behaviour
 *
 * Sections:
 *  1. Sticky header on scroll
 *  2. Mobile hamburger menu
 *  3. Active nav link highlighting on scroll
 *  4. Scroll-reveal animations (IntersectionObserver)
 *  5. Animated counters (hero stats)
 *  6. Back-to-top button
 *  7. Contact form validation
 *  8. Footer year
 *  9. Smooth scroll for anchor links (fallback)
 */

'use strict';

/* ============================================================
   0. UTILITY — run after DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initActiveNavOnScroll();
  initScrollReveal();
  initCounters();
  initBackToTop();
  initContactForm();
  initFooterYear();
  initSmoothScroll();
});

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function onNextAnimationFrame(callback) {
  let ticking = false;

  return () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      callback();
      ticking = false;
    });
  };
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration = 900) {
  if (prefersReducedMotion()) {
    window.scrollTo(0, targetY);
    return;
  }

  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}


/* ============================================================
   1. STICKY HEADER — add .scrolled class once user scrolls
   ============================================================ */
function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }

  // Run once in case page is loaded mid-scroll
  onScroll();
  window.addEventListener('scroll', onNextAnimationFrame(onScroll), { passive: true });
}


/* ============================================================
   2. MOBILE HAMBURGER MENU
   ============================================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');
  if (!hamburger || !navMobile) return;

  function toggleMenu(forceClose) {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    const shouldOpen = forceClose ? false : !isOpen;

    hamburger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

    if (shouldOpen) {
      navMobile.classList.add('open');
      document.body.style.overflow = 'hidden'; // prevent background scroll
    } else {
      navMobile.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  hamburger.addEventListener('click', () => toggleMenu());

  // Close menu when a nav link is clicked
  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  // Close menu on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleMenu(true);
  });
}


/* ============================================================
   3. ACTIVE NAV LINK ON SCROLL
   Uses IntersectionObserver to track which section is visible
   ============================================================ */
function initActiveNavOnScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-desktop a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  let currentSection = '';

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        currentSection = entry.target.id;
        updateActiveLink();
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px', // fire when section is roughly centred
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));

  function updateActiveLink() {
    navLinks.forEach(link => {
      const target = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', target === currentSection);
    });
  }
}


/* ============================================================
   4. SCROLL REVEAL ANIMATIONS
   Adds .visible class to .reveal elements when they enter the viewport
   ============================================================ */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  // Skip animations for users who prefer reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  });

  revealEls.forEach(el => observer.observe(el));
}


/* ============================================================
   5. ANIMATED COUNTERS — hero stats
   ============================================================ */
function initCounters() {
  const counterEls = document.querySelectorAll('.stat-number[data-target]');
  if (!counterEls.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Set final values immediately
    counterEls.forEach(el => {
      el.textContent = el.dataset.target;
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animateCounter(entry.target);
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => observer.observe(el));
}

/**
 * Animates a counter from 0 to its data-target value
 * @param {HTMLElement} el
 */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800; // ms
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}


/* ============================================================
   6. BACK TO TOP BUTTON
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  function onScroll() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', onNextAnimationFrame(onScroll), { passive: true });
  onScroll(); // check initial state

  btn.addEventListener('click', () => smoothScrollTo(0, 800));
}


/* ============================================================
   7. CONTACT FORM VALIDATION
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name:    { el: form.querySelector('#name'),    errorEl: form.querySelector('#name-error'),    validate: v => v.trim().length >= 2    ? null : 'Please enter your name (at least 2 characters).' },
    email:   { el: form.querySelector('#email'),   errorEl: form.querySelector('#email-error'),   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Please enter a valid email address.' },
    subject: { el: form.querySelector('#subject'), errorEl: form.querySelector('#subject-error'), validate: v => v.trim().length >= 3    ? null : 'Please enter a subject (at least 3 characters).' },
    message: { el: form.querySelector('#message'), errorEl: form.querySelector('#message-error'), validate: v => v.trim().length >= 20   ? null : 'Please enter a message (at least 20 characters).' },
  };

  const successMsg = document.getElementById('form-success');

  /**
   * Validates a single field and shows/hides its error message
   * @returns {boolean} true if valid
   */
  function validateField(key) {
    const { el, errorEl, validate } = fields[key];
    const error = validate(el.value);
    if (error) {
      el.classList.add('error');
      errorEl.textContent = error;
      errorEl.classList.add('visible');
      return false;
    } else {
      el.classList.remove('error');
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
      return true;
    }
  }

  // Live validation on blur (after user leaves a field)
  Object.keys(fields).forEach(key => {
    const { el } = fields[key];
    el.addEventListener('blur', () => validateField(key));
    // Clear error on input
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) validateField(key);
    });
  });

  // Form submission
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Validate all fields
    const allValid = Object.keys(fields).map(key => validateField(key)).every(Boolean);

    if (!allValid) return;

    // Simulate successful form submission (replace with real API call)
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      successMsg.textContent = '✓ Thank you! Your message has been sent. Dilini will be in touch soon.';
      form.reset();
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;

      // Clear success message after 6 seconds
      setTimeout(() => { successMsg.textContent = ''; }, 6000);
    }, 1400);
  });
}


/* ============================================================
   8. FOOTER YEAR — auto-update copyright year
   ============================================================ */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}


/* ============================================================
   9. SMOOTH SCROLL
   ============================================================ */
function initSmoothScroll() {
  const HEADER_OFFSET = 84;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) {
        // href="#" — scroll to top
        e.preventDefault();
        smoothScrollTo(0, 800);
        return;
      }

      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const top = targetEl.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      smoothScrollTo(Math.max(top, 0), 950);
    });
  });
}
