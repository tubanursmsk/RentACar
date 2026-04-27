/* ================================================================
   RentACar Admin Panel — admin.js
   Sidebar toggle, theme switcher, dropdown menus
   ================================================================ */

(function () {
  'use strict';

  const sidebar     = document.getElementById('sidebar');
  const mainWrapper = document.getElementById('mainWrapper');
  const toggle      = document.getElementById('sidebarToggle');
  const overlay     = document.getElementById('sidebarOverlay');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');
  const userMenu    = document.getElementById('userMenu');
  const userMenuBtn = document.getElementById('userMenuToggle');
  const htmlEl      = document.documentElement;

  // ── Sidebar State ──────────────────────────────────────────────
  const SIDEBAR_KEY = 'ra_sidebar_mini';
  const isMobile = () => window.innerWidth <= 768;

  function applySidebarState(mini) {
    if (isMobile()) return;
    if (mini) {
      sidebar.classList.add('mini');
      mainWrapper.classList.add('mini');
    } else {
      sidebar.classList.remove('mini');
      mainWrapper.classList.remove('mini');
    }
  }

  function toggleSidebar() {
    if (isMobile()) {
      // Mobile: slide in/out
      const isOpen = sidebar.classList.contains('mobile-open');
      sidebar.classList.toggle('mobile-open', !isOpen);
      overlay.classList.toggle('show', !isOpen);
    } else {
      // Desktop: mini mode
      const mini = !sidebar.classList.contains('mini');
      applySidebarState(mini);
      localStorage.setItem(SIDEBAR_KEY, mini ? '1' : '0');
    }
  }

  // Restore state on load
  if (!isMobile()) {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    // Default: expanded on desktop
    applySidebarState(saved === '1');
  }

  if (toggle) toggle.addEventListener('click', toggleSidebar);

  // Close sidebar on overlay click (mobile)
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('show');
    });
  }

  // Resize handler
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('show');
      const saved = localStorage.getItem(SIDEBAR_KEY);
      applySidebarState(saved === '1');
    } else {
      sidebar.classList.remove('mini');
      mainWrapper.classList.remove('mini');
    }
  });

  // ── Theme Toggle ──────────────────────────────────────────────
  const THEME_KEY = 'ra_theme';

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'dark'
        ? 'fa-solid fa-moon'
        : 'fa-solid fa-sun';
    }
  }

  // Restore theme
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  // ── User Dropdown ─────────────────────────────────────────────
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('open');
      userMenuBtn.setAttribute('aria-expanded', userMenu.classList.contains('open'));
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (userMenu && !userMenu.contains(e.target)) {
      userMenu.classList.remove('open');
    }
  });

  // ── Toastr Config ─────────────────────────────────────────────
  if (typeof toastr !== 'undefined') {
    toastr.options = {
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right',
      timeOut: 3500,
      extendedTimeOut: 1000,
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut'
    };
  }

  // ── Active Nav Highlight ──────────────────────────────────────
  // Fallback in case Razor didn't catch it
  const currentPath = window.location.pathname.toLowerCase();
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.toLowerCase();
    if (href && href !== '/' && currentPath.startsWith(href)) {
      link.closest('.nav-item')?.classList.add('active');
    }
  });

  // ── Confirm Delete Helper ─────────────────────────────────────
  window.confirmDelete = function (form) {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      form.submit();
    }
    return false;
  };

  // ── Modal Helpers ─────────────────────────────────────────────
  window.openModal = function (id) {
    document.getElementById(id)?.classList.add('show');
    document.body.style.overflow = 'hidden';
  };

   window.closeModal = function (id) {
    document.getElementById(id)?.classList.remove('show');
    document.body.style.overflow = '';
  };

  // Close modal on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  });

})();