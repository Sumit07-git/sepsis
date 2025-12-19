// Sepsis Early Prediction System - JavaScript

// Highlight active navigation link
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (href === '/' && currentPath === '/')) {
            link.classList.add('active');
        }
    });
});

// Add real-time validation feedback for form inputs
const formInputs = document.querySelectorAll('.form-control');
formInputs.forEach(input => {
    input.addEventListener('input', function() {
        const min = parseFloat(this.getAttribute('min'));
        const max = parseFloat(this.getAttribute('max'));
        const value = parseFloat(this.value);
        
        if (value < min || value > max) {
            this.style.borderColor = '#ef4444';
            this.style.backgroundColor = '#fee2e2';
        } else if (this.checkValidity()) {
            this.style.borderColor = '#10b981';
            this.style.backgroundColor = '#f0fdf4';
        } else {
            this.style.borderColor = '#e2e8f0';
            this.style.backgroundColor = 'white';
        }
    });
    
    input.addEventListener('blur', function() {
        if (this.value === '') {
            this.style.borderColor = '#e2e8f0';
            this.style.backgroundColor = 'white';
        }
    });
});

// Smooth scroll to sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe animated elements
document.querySelectorAll('.feature-card, .workflow-step, .parameter-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(element);
});

// Add loading animation to submit button
const submitButtons = document.querySelectorAll('button[type="submit"]');
submitButtons.forEach(button => {
    const form = button.closest('form');
    if (form) {
        form.addEventListener('submit', function() {
            const originalHTML = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Reset button after timeout (fallback)
            setTimeout(() => {
                button.disabled = false;
                button.innerHTML = originalHTML;
            }, 30000);
        });
    }
});

// Format vital sign values in real-time
function formatVitalSign(input, decimals = 1) {
    const value = parseFloat(input.value);
    if (!isNaN(value)) {
        input.value = value.toFixed(decimals);
    }
}

// Validate vital sign ranges
function validateVitalSign(input, min, max, name) {
    const value = parseFloat(input.value);
    if (value < min || value > max) {
        console.warn(`${name} value (${value}) is outside normal range (${min}-${max})`);
        return false;
    }
    return true;
}

// Print functionality
function printResults() {
    window.print();
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printResults();
    }
});

// Console welcome message
console.log('%c Sepsis Early Prediction System ', 'background: #667eea; color: white; font-size: 20px; padding: 10px;');
console.log('%c AI-Powered Clinical Decision Support ', 'background: #10b981; color: white; font-size: 14px; padding: 5px;');
console.log('');
console.log('System Features:');
console.log('✓ Random Forest ML Model');
console.log('✓ SOFA & SIRS Score Calculation');
console.log('✓ Real-time Risk Assessment');
console.log('✓ Clinical Alerts & Recommendations');
console.log('');
console.log('Dataset: PhysioNet Sepsis Challenge (2,000 patients)');
console.log('');
console.log('⚠️  For educational purposes only - Not for clinical use');