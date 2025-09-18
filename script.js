// DOM Elements
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const header = document.querySelector('.site-header');
const faqQuestions = document.querySelectorAll('.faq-question');
const forms = document.querySelectorAll('form');
const searchInput = document.getElementById('search-input');
const filterTags = document.querySelectorAll('.filter-tag');
const resourcesGrid = document.getElementById('resources-grid');
const noResults = document.getElementById('no-results');
const callbackBtn = document.getElementById('callback-btn');
const callbackModal = document.getElementById('callback-modal');
const modalClose = document.getElementById('modal-close');
const currentYearSpan = document.getElementById('current-year');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupNavigation();
    setupForms();
    setupFAQ();
    setupScrollEffects();
    setupResourceFilter();
    setupModal();
    setCurrentYear();
});

// Scroll reveal animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    const fadeInElements = document.querySelectorAll('.fade-in');
    fadeInElements.forEach(el => observer.observe(el));
}

// Navigation
function setupNavigation() {
    // Mobile nav toggle
    if (navToggle && navList) {
        navToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
        });

        // Close nav on link click
        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = target.offsetTop - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll effects
function setupScrollEffects() {
    if (!header) return;

    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
}

// Forms
function setupForms() {
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(form)) {
                showSuccessMessage(form);
                form.reset();
                
                // Close modal if it's a callback form
                if (form.classList.contains('callback-form')) {
                    closeModal();
                }
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    });
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    const errorElement = document.getElementById(`${fieldName}-error`) || 
                        document.getElementById(`${field.id}-error`);

    clearFieldError(field);

    if (!value) {
        showFieldError(field, errorElement, 'This field is required');
        return false;
    }

    if (field.type === 'email' && !isValidEmail(value)) {
        showFieldError(field, errorElement, 'Please enter a valid email address');
        return false;
    }

    return true;
}

function showFieldError(field, errorElement, message) {
    field.style.borderColor = '#ef4444';
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(field) {
    field.style.borderColor = '';
    const fieldName = field.name || field.id;
    const errorElement = document.getElementById(`${fieldName}-error`) || 
                        document.getElementById(`${field.id}-error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showSuccessMessage(form) {
    const message = form.classList.contains('callback-form') 
        ? 'Callback request submitted successfully! We\'ll contact you soon.'
        : 'Message sent successfully! We\'ll get back to you soon.';
    
    const toast = createToast(message);
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 4000);
}

function createToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        ${message}
        <button class="toast-close" aria-label="Close notification">&times;</button>
    `;
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    });
    
    return toast;
}

// FAQ
function setupFAQ() {
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Close all other FAQ items
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    const otherAnswer = otherQuestion.nextElementSibling;
                    otherAnswer.classList.remove('active');
                }
            });
            
            // Toggle current item
            this.setAttribute('aria-expanded', !isExpanded);
            answer.classList.toggle('active');
        });
    });
}

// Resource filtering
function setupResourceFilter() {
    if (!searchInput || !resourcesGrid) return;

    // Search functionality
    searchInput.addEventListener('input', filterResources);
    
    // Tag filtering
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Update active tag
            filterTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            filterResources();
        });
    });
}

function filterResources() {
    if (!resourcesGrid) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const activeTag = document.querySelector('.filter-tag.active');
    const selectedTag = activeTag ? activeTag.dataset.tag : 'all';
    
    const resourceCards = resourcesGrid.querySelectorAll('.resource-card');
    let visibleCount = 0;
    
    resourceCards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const cardTags = card.dataset.tags || '';
        
        const matchesSearch = !searchTerm || cardText.includes(searchTerm);
        const matchesTag = selectedTag === 'all' || cardTags.includes(selectedTag);
        
        if (matchesSearch && matchesTag) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide no results message
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

// Modal
function setupModal() {
    if (callbackBtn && callbackModal) {
        callbackBtn.addEventListener('click', openModal);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (callbackModal) {
        callbackModal.addEventListener('click', function(e) {
            if (e.target === callbackModal) {
                closeModal();
            }
        });
    }
    
    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && callbackModal && callbackModal.classList.contains('active')) {
            closeModal();
        }
    });
}

function openModal() {
    if (callbackModal) {
        callbackModal.classList.add('active');
        callbackModal.setAttribute('aria-hidden', 'false');
        
        // Focus first input
        const firstInput = callbackModal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        // Trap focus in modal
        trapFocus(callbackModal);
    }
}

function closeModal() {
    if (callbackModal) {
        callbackModal.classList.remove('active');
        callbackModal.setAttribute('aria-hidden', 'true');
        
        // Return focus to button that opened modal
        if (callbackBtn) {
            callbackBtn.focus();
        }
    }
}

function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Set current year
function setCurrentYear() {
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

// Utility functions for accessibility
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Prevent form submission errors if JavaScript fails
document.addEventListener('DOMContentLoaded', function() {
    // Add novalidate to forms for graceful degradation
    forms.forEach(form => {
        form.setAttribute('novalidate', '');
    });
});

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to search input
if (searchInput) {
    const debouncedFilter = debounce(filterResources, 300);
    searchInput.removeEventListener('input', filterResources);
    searchInput.addEventListener('input', debouncedFilter);
}