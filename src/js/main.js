document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile menu toggle ---
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden');
      menuIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      });
    });
  }

  // --- Navbar background on scroll ---
  const nav = document.getElementById('navbar');
  if (nav) {
    const updateNav = () => {
      if (window.scrollY > 60) {
        nav.classList.add('bg-primary-dark/95', 'shadow-lg', 'backdrop-blur-sm');
        nav.classList.remove('bg-transparent');
      } else {
        nav.classList.remove('bg-primary-dark/95', 'shadow-lg', 'backdrop-blur-sm');
        nav.classList.add('bg-transparent');
      }
    };
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  // --- Language selector ---
  const langBtns = document.querySelectorAll('[data-set-lang]');
  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.dataset.setLang;
      const target = btn.dataset.langTarget || '/';
      document.cookie = `lang=${lang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
      window.location.href = target;
    });
  });

  // --- Form submission via Web3Forms (AJAX to show popup instead of redirect) ---
  const popup = document.getElementById('success-popup');
  const popupClose = document.getElementById('popup-close');
  const popupOverlay = document.getElementById('popup-overlay');

  function showPopup() {
    if (popup) {
      popup.classList.remove('hidden');
      popup.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closePopup() {
    if (popup) {
      popup.classList.add('hidden');
      popup.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = '...';

    try {
      const formData = new FormData(form);
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        form.reset();
        showPopup();
      } else {
        console.error('Form error:', data);
        submitBtn.textContent = originalText;
      }
    } catch (err) {
      console.error('Submit failed:', err);
      submitBtn.textContent = originalText;
    } finally {
      submitBtn.disabled = false;
      if (submitBtn.textContent === '...') submitBtn.textContent = originalText;
    }
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) contactForm.addEventListener('submit', handleFormSubmit);

  const volunteerForm = document.getElementById('volunteer-form');
  if (volunteerForm) volunteerForm.addEventListener('submit', handleFormSubmit);

  if (popupClose) popupClose.addEventListener('click', closePopup);
  if (popupOverlay) popupOverlay.addEventListener('click', closePopup);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
  });

  // --- Smooth reveal on scroll ---
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  }
});
