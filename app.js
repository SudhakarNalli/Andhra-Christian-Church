document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  /* ==========================================================================
     Language Toggle (Telugu / English)
     ========================================================================== */
  const langToggleBtn = document.getElementById('lang-toggle');
  
  // Set default language or retrieve saved preference
  const savedLang = localStorage.getItem('lang') || 'te';
  setLanguage(savedLang);

  langToggleBtn.addEventListener('click', () => {
    const currentLang = document.documentElement.getAttribute('data-lang');
    const newLang = currentLang === 'te' ? 'en' : 'te';
    setLanguage(newLang);
  });

  function setLanguage(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem('lang', lang);
  }

  /* ==========================================================================
     Theme Toggle (Light / Dark Mode)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIconDark = themeToggleBtn.querySelector('.theme-icon-dark');
  const themeIconLight = themeToggleBtn.querySelector('.theme-icon-light');
  
  // Check localStorage or system preference
  const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  // Apply initial theme
  setTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      themeIconDark.style.display = 'none';
      themeIconLight.style.display = 'inline-block';
    } else {
      themeIconDark.style.display = 'inline-block';
      themeIconLight.style.display = 'none';
    }
  }
});
