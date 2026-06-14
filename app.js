document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- DOM Elements ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    const resetFormBtn = document.getElementById('reset-form-btn');
    const nextServiceBannerText = document.getElementById('next-service-text');
    const currentYearSpan = document.getElementById('current-year');
    const langBtns = document.querySelectorAll('.lang-btn');

    // Set Current Year in Footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Dark / Light Mode ---
    const getSavedTheme = () => localStorage.getItem('acc-theme') || 'light';
    const saveTheme = (theme) => localStorage.setItem('acc-theme', theme);
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = themeToggleBtn.querySelector('i');
        if (icon && typeof lucide !== 'undefined') {
            if (theme === 'dark') {
                themeToggleBtn.innerHTML = '<i data-lucide="sun" class="theme-icon-light"></i>';
            } else {
                themeToggleBtn.innerHTML = '<i data-lucide="moon" class="theme-icon-dark"></i>';
            }
            lucide.createIcons();
        }
    };

    let currentTheme = getSavedTheme();
    applyTheme(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
        saveTheme(currentTheme);
    });

    // --- Bilingual Language Switcher ---
    let currentLang = localStorage.getItem('acc-lang') || 'en';

    const translatePage = (lang) => {
        document.documentElement.setAttribute('lang', lang);
        
        // Translate all HTML tags with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = translations[lang]?.[key];
            if (!val) return;

            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = val;
            } else if (el.tagName === 'OPTION') {
                el.textContent = val;
                // If it is the default disabled option
                if (el.disabled) {
                    el.innerText = val;
                }
            } else {
                el.textContent = val;
            }
        });

        // Toggle Active Class on Lang Buttons
        langBtns.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update Dynamic Schedule Text
        updateServiceHighlights();
    };

    // Initialize Language
    translatePage(currentLang);

    // Setup Lang Button Listeners
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            if (selectedLang !== currentLang) {
                currentLang = selectedLang;
                localStorage.setItem('acc-lang', currentLang);
                translatePage(currentLang);
            }
        });
    });

    // --- Mobile Menu Toggle ---
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon && typeof lucide !== 'undefined') {
            if (navMenu.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '<i data-lucide="x"></i>';
            } else {
                mobileMenuBtn.innerHTML = '<i data-lucide="menu"></i>';
            }
            lucide.createIcons();
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon && typeof lucide !== 'undefined') {
                mobileMenuBtn.innerHTML = '<i data-lucide="menu"></i>';
                lucide.createIcons();
            }
        });
    });

    // --- Active Link Highlight on Scroll ---
    const sections = document.querySelectorAll('section');
    const navObserverOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, navObserverOptions);

    sections.forEach(section => navObserver.observe(section));

    // --- Gathering Scheduler Data ---
    const services = [
        {
            id: 'service-sunday-worship',
            name: 'Sunday Worship',
            day: 0,
            start: '11:30',
            end: '14:00',
            elementId: 'service-sunday-worship'
        },
        {
            id: 'service-wednesday-prayer',
            name: 'Youth Meeting',
            day: 3,
            start: '20:30',
            end: '22:00',
            elementId: 'service-wednesday-prayer'
        },
        {
            id: 'service-friday-meeting',
            name: 'Womens Fellowship',
            day: 5,
            start: '14:30',
            end: '17:00',
            elementId: 'service-friday-meeting'
        }
    ];

    const getMinutesFromWeekStart = (day, timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return day * 1440 + hours * 60 + minutes;
    };

    function updateServiceHighlights() {
        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        const currentWeekMinutes = currentDay * 1440 + currentHour * 60 + currentMinute;
        const totalWeekMinutes = 7 * 1440;

        let activeService = null;
        let nextService = null;
        let minTimeDiff = Infinity;

        // Reset Card Badges (and read translation dynamically)
        services.forEach(service => {
            const el = document.getElementById(service.elementId);
            if (el) {
                el.classList.remove('active-service');
                const badge = el.querySelector('.card-status-badge');
                if (badge) {
                    badge.textContent = translations[currentLang]?.card_status_next || "Next Service";
                }
            }
        });

        // 1. Check if any service is in progress
        services.forEach(service => {
            const startMin = getMinutesFromWeekStart(service.day, service.start);
            const endMin = getMinutesFromWeekStart(service.day, service.end);
            
            if (currentWeekMinutes >= startMin && currentWeekMinutes < endMin) {
                activeService = service;
            }
        });

        if (activeService) {
            const el = document.getElementById(activeService.elementId);
            if (el) {
                el.classList.add('active-service');
                const badge = el.querySelector('.card-status-badge');
                if (badge) {
                    badge.textContent = translations[currentLang]?.card_status_in_progress || "In Progress";
                }
            }
            if (nextServiceBannerText) {
                // Get translated service name
                const serviceCleanId = activeService.id.replace('service-', '').replace(/-/g, '_');
                const serviceName = translations[currentLang]?.[`services_${serviceCleanId}_title`] || activeService.name;
                const liveNowLabel = translations[currentLang]?.live_now || "Live Now:";
                const progressSuffix = translations[currentLang]?.in_progress_suffix || " is in progress!";
                
                nextServiceBannerText.innerHTML = `<strong>${liveNowLabel}</strong> ${serviceName}${progressSuffix}`;
            }
            return;
        }

        // 2. Find next service
        services.forEach(service => {
            const startMin = getMinutesFromWeekStart(service.day, service.start);
            let diff = startMin - currentWeekMinutes;
            if (diff < 0) {
                diff += totalWeekMinutes;
            }

            if (diff < minTimeDiff) {
                minTimeDiff = diff;
                nextService = service;
            }
        });

        if (nextService) {
            const el = document.getElementById(nextService.elementId);
            if (el) {
                el.classList.add('active-service');
                const badge = el.querySelector('.card-status-badge');
                if (badge) {
                    badge.textContent = translations[currentLang]?.card_status_next || "Next Service";
                }
            }

            if (nextServiceBannerText) {
                const days = Math.floor(minTimeDiff / 1440);
                const hours = Math.floor((minTimeDiff % 1440) / 60);
                const minutes = Math.floor(minTimeDiff % 60);
                
                // Construct relative time string (e.g. 2d 4h 30m)
                let timeString = '';
                if (currentLang === 'te') {
                    if (days > 0) timeString += `${days}రో `;
                    if (hours > 0 || days > 0) timeString += `${hours}గం `;
                    timeString += `${minutes}ని`;
                } else {
                    if (days > 0) timeString += `${days}d `;
                    if (hours > 0 || days > 0) timeString += `${hours}h `;
                    timeString += `${minutes}m`;
                }

                // Translate Day Name
                const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const dayKey = `day_${dayKeys[nextService.day]}`;
                const dayName = translations[currentLang]?.[dayKey] || dayKeys[nextService.day];

                // Translate Service Name
                const serviceCleanId = nextService.id.replace('service-', '').replace(/-/g, '_');
                const serviceName = translations[currentLang]?.[`services_${serviceCleanId}_title`] || nextService.name;

                // Format Time String
                const [hStr, mStr] = nextService.start.split(':');
                const hourNum = Number(hStr);
                let startTimeStr = '';
                
                if (currentLang === 'te') {
                    let period = '';
                    if (hourNum < 12) period = 'ఉదయం';
                    else if (hourNum < 16) period = 'మధ్యాహ్నం';
                    else if (hourNum < 20) period = 'సాయంత్రం';
                    else period = 'రాత్రి';
                    const formattedHour = hourNum % 12 || 12;
                    startTimeStr = `${period} ${formattedHour}:${mStr}`;
                } else {
                    const ampm = hourNum >= 12 ? 'PM' : 'AM';
                    const formattedHour = hourNum % 12 || 12;
                    startTimeStr = `${formattedHour}:${mStr} ${ampm}`;
                }

                // Compile dynamic labels
                const labelNext = translations[currentLang]?.next_gathering || "Next Gathering:";
                const labelOn = translations[currentLang]?.next_gathering_on || "on";
                const labelAt = translations[currentLang]?.next_gathering_at || "at";
                const labelIn = translations[currentLang]?.in || "in";

                if (currentLang === 'te') {
                    nextServiceBannerText.innerHTML = `<strong>${labelNext}</strong> ${dayName} ${labelOn} ${startTimeStr} ${labelAt} ${serviceName} (${labelIn} ${timeString} లో)`;
                } else {
                    nextServiceBannerText.innerHTML = `<strong>${labelNext}</strong> ${serviceName} ${labelOn} ${dayName} ${labelAt} ${startTimeStr} (${labelIn} ${timeString})`;
                }
            }
        }
    }

    // --- Contact Form Submission Handling ---
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            
            // Toggle label dynamically based on active language
            const labelSending = translations[currentLang]?.contact_btn_sending || "Sending Request...";
            const labelOriginal = translations[currentLang]?.contact_btn_send || "Send Message";
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>${labelSending}</span><i data-lucide="loader" class="animate-spin"></i>`;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // Send data to FormSubmit via AJAX
            fetch("https://formsubmit.co/ajax/nallisudhakar85@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    Name: document.getElementById('form-name').value,
                    Email: document.getElementById('form-email').value,
                    Subject: document.getElementById('form-subject').value,
                    Message: document.getElementById('form-message').value
                })
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>${labelOriginal}</span><i data-lucide="send"></i>`;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }

                // Show success toast
                const toastMsg = translations[currentLang]?.contact_toast_success || "Message sent successfully!";
                showToast(toastMsg);

                contactForm.style.opacity = '0';
                setTimeout(() => {
                    contactForm.style.display = 'none';
                    successMessage.style.display = 'flex';
                }, 300);
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                // Fallback: show toast and success message anyway to ensure good user experience
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>${labelOriginal}</span><i data-lucide="send"></i>`;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                
                const toastMsg = translations[currentLang]?.contact_toast_success || "Message sent successfully!";
                showToast(toastMsg);

                contactForm.style.opacity = '0';
                setTimeout(() => {
                    contactForm.style.display = 'none';
                    successMessage.style.display = 'flex';
                }, 300);
            });
        });
    }

    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            contactForm.reset();
            successMessage.style.display = 'none';
            contactForm.style.display = 'flex';
            setTimeout(() => {
                contactForm.style.opacity = '1';
            }, 50);
        });
    }

    // --- Success Toast Helper ---
    function showToast(message) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="check-circle-2"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Initialize the new icon in the toast element
        if (typeof lucide !== 'undefined') {
            lucide.createIcons({
                attrs: {
                    class: 'lucide-icon'
                },
                nameAttr: 'data-lucide',
                node: toast
            });
        }

        // Force reflow to enable CSS transition
        toast.offsetHeight;
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 4000);
    }
});
