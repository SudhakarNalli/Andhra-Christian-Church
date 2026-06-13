document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

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

  /* ==========================================================================
     Mobile Navigation Menu
     ========================================================================== */
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  
  mobileNavToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    const icon = mobileNavToggle.querySelector('i');
    if (isOpen) {
      icon.setAttribute('data-lucide', 'x');
    } else {
      icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
  });

  // Close mobile nav when link is clicked
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      const icon = mobileNavToggle.querySelector('i');
      icon.setAttribute('data-lucide', 'menu');
      lucide.createIcons();
    });
  });

  /* ==========================================================================
     Sermon Player Simulator
     ========================================================================== */
  const btnPlayPause = document.getElementById('btn-play-pause');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const btnPrev = document.getElementById('btn-prev');
  const btnNextFwd = document.getElementById('btn-next-fwd');
  const progressBar = document.getElementById('progress-bar');
  const progressBarWrapper = document.getElementById('progress-bar-wrapper');
  const currentTimeLabel = document.getElementById('current-time');
  const durationLabel = document.getElementById('duration');
  const volumeSlider = document.getElementById('volume-slider');
  const sermonTitle = document.querySelector('.sermon-player-card .sermon-title');
  const sermonSpeaker = document.querySelector('.sermon-player-card .sermon-speaker');
  const archiveItems = document.querySelectorAll('.archive-item');

  let isPlaying = false;
  let currentTime = 0; // in seconds
  let sermonDuration = 754; // default (12:34)
  let playerInterval = null;

  // Format seconds to MM:SS
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Parse MM:SS duration to seconds
  function parseDurationString(durationStr) {
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 600; // fallback
  }

  function updatePlayerUI() {
    // Progress bar width
    const percentage = (currentTime / sermonDuration) * 100;
    progressBar.style.width = `${percentage}%`;
    
    // Time labels
    currentTimeLabel.textContent = formatTime(currentTime);
    durationLabel.textContent = formatTime(sermonDuration);

    // Play/Pause icon
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'inline-block';
    } else {
      playIcon.style.display = 'inline-block';
      pauseIcon.style.display = 'none';
    }
  }

  function playSermon() {
    if (isPlaying) return;
    isPlaying = true;
    updatePlayerUI();
    playerInterval = setInterval(() => {
      currentTime++;
      if (currentTime >= sermonDuration) {
        pauseSermon();
        currentTime = 0;
      }
      updatePlayerUI();
    }, 1000);
  }

  function pauseSermon() {
    if (!isPlaying) return;
    isPlaying = false;
    clearInterval(playerInterval);
    updatePlayerUI();
  }

  btnPlayPause.addEventListener('click', () => {
    if (isPlaying) {
      pauseSermon();
    } else {
      playSermon();
    }
  });

  // Fast Forward / Rewind
  btnPrev.addEventListener('click', () => {
    currentTime = Math.max(0, currentTime - 10);
    updatePlayerUI();
  });

  btnNextFwd.addEventListener('click', () => {
    currentTime = Math.min(sermonDuration, currentTime + 10);
    updatePlayerUI();
  });

  // Progress bar scrubbing
  progressBarWrapper.addEventListener('click', (e) => {
    const rect = progressBarWrapper.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercentage = clickX / width;
    currentTime = Math.floor(clickPercentage * sermonDuration);
    updatePlayerUI();
  });

  // Archive Item Switcher
  archiveItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active from others
      archiveItems.forEach(i => i.classList.remove('active-archive-item'));
      item.classList.add('active-archive-item');

      // Load sermon details
      const title = item.getAttribute('data-title');
      const speaker = item.getAttribute('data-speaker');
      const durationStr = item.getAttribute('data-duration');

      sermonTitle.textContent = title;
      sermonSpeaker.textContent = `${speaker} • సిరీస్: విశ్వాసం & కృప`;
      sermonDuration = parseDurationString(durationStr);
      currentTime = 0;
      
      // Stop current playback
      pauseSermon();
      updatePlayerUI();
      
      // Auto-play selected
      playSermon();
    });
  });

  // Initialize UI
  updatePlayerUI();

  /* ==========================================================================
     Ministries Tab Switcher
     ========================================================================== */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');

      // Update active tab buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Toggle display of panels
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `tab-${tabTarget}`) {
          panel.classList.add('active');
        }
      });
    });
  });

  /* ==========================================================================
     Giving Widget Calculator
     ========================================================================== */
  const amountBtns = document.querySelectorAll('.amount-btn');
  const customAmountContainer = document.getElementById('custom-amount-container');
  const customAmountInput = document.getElementById('custom-amount-input');
  const selectedTotalVal = document.getElementById('selected-total-val');
  const selectedFreqVal = document.getElementById('selected-freq-val');
  
  const freqOneTime = document.getElementById('freq-one-time');
  const freqMonthly = document.getElementById('freq-monthly');
  
  const btnSubmitGiving = document.getElementById('btn-submit-giving');
  const givingSuccessOverlay = document.getElementById('giving-success-overlay');
  const successAmountVal = document.getElementById('success-amount-val');
  const btnResetGiving = document.getElementById('btn-reset-giving');

  let selectedAmount = 500; // default active button
  let selectedFrequency = 'one-time';

  // Toggle amount selections
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const val = btn.getAttribute('data-val');
      if (val === 'custom') {
        customAmountContainer.style.display = 'block';
        selectedAmount = parseInt(customAmountInput.value) || 0;
      } else {
        customAmountContainer.style.display = 'none';
        selectedAmount = parseInt(val);
      }
      updateGivingTotalDisplay();
    });
  });

  // Custom Amount Input
  customAmountInput.addEventListener('input', () => {
    selectedAmount = parseInt(customAmountInput.value) || 0;
    updateGivingTotalDisplay();
  });

  // Frequency Toggles
  freqOneTime.addEventListener('click', () => {
    freqOneTime.classList.add('active');
    freqMonthly.classList.remove('active');
    selectedFrequency = 'one-time';
    updateGivingTotalDisplay();
  });

  freqMonthly.addEventListener('click', () => {
    freqMonthly.classList.add('active');
    freqOneTime.classList.remove('active');
    selectedFrequency = 'monthly';
    updateGivingTotalDisplay();
  });

  function updateGivingTotalDisplay() {
    selectedTotalVal.textContent = `₹${selectedAmount}`;
    selectedFreqVal.textContent = selectedFrequency === 'monthly' ? 'ప్రతి నెల' : 'ఒక్కసారి';
  }

  // Submit Donation
  btnSubmitGiving.addEventListener('click', () => {
    if (selectedAmount <= 0) {
      alert('దయచేసి సరైన కానుక మొత్తాన్ని నమోదు చేయండి.');
      return;
    }

    // Show simulated loading status
    const btnOriginalContent = btnSubmitGiving.innerHTML;
    btnSubmitGiving.disabled = true;
    btnSubmitGiving.innerHTML = '<i data-lucide="loader" class="inline-icon animate-spin"></i> ప్రాసెస్ చేయబడుతోంది...';
    lucide.createIcons();

    setTimeout(() => {
      // Show success overlay
      successAmountVal.textContent = `₹${selectedAmount}${selectedFrequency === 'monthly' ? '/నెల' : ''}`;
      givingSuccessOverlay.classList.add('show');
      
      // Reset button state
      btnSubmitGiving.disabled = false;
      btnSubmitGiving.innerHTML = btnOriginalContent;
      lucide.createIcons();
    }, 1500);
  });

  // Reset Donation form after success
  btnResetGiving.addEventListener('click', () => {
    givingSuccessOverlay.classList.remove('show');
    
    // Reset to default ₹500 once
    amountBtns.forEach(b => b.classList.remove('active'));
    amountBtns[1].classList.add('active'); // ₹500 button
    customAmountContainer.style.display = 'none';
    customAmountInput.value = '';
    
    freqOneTime.classList.add('active');
    freqMonthly.classList.remove('active');
    
    selectedAmount = 500;
    selectedFrequency = 'one-time';
    updateGivingTotalDisplay();
  });

  /* ==========================================================================
     Contact Form Interaction
     ========================================================================== */
  const contactForm = document.getElementById('church-contact-form');
  const btnSubmitContact = document.getElementById('btn-submit-contact');
  const contactSuccessState = document.getElementById('contact-success-state');
  const btnResetContact = document.getElementById('btn-reset-contact');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Check validation (built-in validation will trigger first, but let's confirm)
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    // Show loading state
    const btnOriginalText = btnSubmitContact.innerHTML;
    btnSubmitContact.disabled = true;
    btnSubmitContact.innerHTML = '<i data-lucide="loader" class="inline-icon animate-spin"></i> పంపబడుతోంది...';
    lucide.createIcons();

    setTimeout(() => {
      // Hide loading, show success panel
      contactSuccessState.classList.add('show');
      btnSubmitContact.disabled = false;
      btnSubmitContact.innerHTML = btnOriginalText;
      lucide.createIcons();
    }, 1200);
  });

  btnResetContact.addEventListener('click', () => {
    contactForm.reset();
    contactSuccessState.classList.remove('show');
  });

  /* ==========================================================================
     Scroll Reveal Observer
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active-reveal');
        // Unobserve after showing so it stays visible
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1, // trigger when 10% of element is visible
    rootMargin: '0px 0px -50px 0px' // offset so it triggers slightly before coming into view
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
});
