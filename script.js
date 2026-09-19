'use strict';

const menuToggle = document.querySelector('[data-menu-toggle]');
const siteNav = document.querySelector('#site-nav');
const header = document.querySelector('[data-header]');
const mobileLayout = window.matchMedia('(max-width: 760px)');

function closeMenu(returnFocus = false) {
  siteNav?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (returnFocus) menuToggle?.focus();
}

menuToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && siteNav?.classList.contains('is-open')) closeMenu(true);
});
document.addEventListener('click', (event) => {
  if (!header?.contains(event.target)) closeMenu();
});
header?.addEventListener('focusout', (event) => {
  if (!header.contains(event.relatedTarget)) closeMenu();
});
mobileLayout.addEventListener('change', () => closeMenu());

// Keep native fragment links, deep links, and browser history working on static hosting.
const navLinks = Array.from(siteNav?.querySelectorAll('a[href^="#"]') || []);
const sections = Array.from(document.querySelectorAll('main > section[id]'));
function setActiveSection(id) {
  navLinks.forEach((link) => {
    if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function updateActiveSection() {
  const offset = (header?.offsetHeight || 88) + 100;
  let active = 'top';
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= offset) active = section.id;
  });
  setActiveSection(active);
}
let scrollPending = false;
window.addEventListener('scroll', () => {
  if (scrollPending) return;
  scrollPending = true;
  window.requestAnimationFrame(() => {
    updateActiveSection();
    scrollPending = false;
  });
}, { passive: true });
window.addEventListener('resize', updateActiveSection);
window.addEventListener('hashchange', () => {
  closeMenu();
  updateActiveSection();
});
window.addEventListener('pageshow', updateActiveSection);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    closeMenu();
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

const form = document.querySelector('[data-project-form]');
document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    if (form) form.elements.service.value = link.dataset.service;
  });
});

if (form) {
  const submitButton = form.querySelector('[type="submit"]');
  const status = document.querySelector('[data-form-status]');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name;
    const message = form.elements.message;
    name.setCustomValidity(name.value.trim() ? '' : 'Please enter your name.');
    message.setCustomValidity(message.value.trim().length >= 10 ? '' : 'Please share at least 10 characters about your project.');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `Project enquiry: ${data.get('service')}`;
    const body = [
      'Hello STStack Technology,', '',
      `Name: ${String(data.get('name')).trim()}`,
      `Email: ${String(data.get('email')).trim()}`,
      `Service: ${data.get('service')}`, '',
      String(data.get('message')).trim(), '',
      'Looking forward to discussing the next steps.'
    ].join('\r\n');
    window.location.href = `mailto:sdstacktech@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Your email draft is ready to open. Review and send it in your email app. If no app opens, email your details to sdstacktech@gmail.com using the link beside this form.';
  });
  form.addEventListener('input', (event) => {
    if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
    status.textContent = '';
  });
  submitButton.disabled = false;
}

// Content remains visible if scripting or animation support is unavailable.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealing');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
}

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();
document.documentElement.classList.add('js');
updateActiveSection();
