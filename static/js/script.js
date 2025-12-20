// Sepsis Early Prediction System - Enhanced JavaScript with Mobile Support

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
    
    // Initialize mobile enhancements
    initializeMobileFeatures();
});

/**
 * Initialize mobile-specific features
 */
function initializeMobileFeatures() {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        
        // Add touch event handlers
        setupTouchGestures();
        
        // Optimize viewport for mobile
        optimizeViewport();
        
        // Add mobile-specific console log
        console.log('📱 Mobile device detected - Optimized UI loaded');
    }
    
    // Add viewport size indicator (development only)
    // if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    //     showViewportIndicator();
    // }
}

/**
 * Setup touch gesture handlers
 */
function setupTouchGestures() {
    // Prevent double-tap zoom on buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.click();
        }, { passive: false });
    });
    
    // Add visual feedback for touch
    document.querySelectorAll('.btn, .nav-link, .form-control').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

/**
 * Optimize viewport settings
 */
function optimizeViewport() {
    // Disable zoom on input focus (iOS Safari)
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('focus', function() {
            if (window.innerWidth < 768) {
                const viewport = document.querySelector('meta[name=viewport]');
                viewport.setAttribute('content', 
                    'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
                );
            }
        });
        
        input.addEventListener('blur', function() {
            const viewport = document.querySelector('meta[name=viewport]');
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1, user-scalable=yes'
            );
        });
    });
}

/**
 * Show viewport size indicator for development
 */
function showViewportIndicator() {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 10000;
        pointer-events: none;
    `;
    document.body.appendChild(indicator);
    
    function updateIndicator() {
        const width = window.innerWidth;
        let device = '';
        
        if (width < 360) device = '📱 Tiny';
        else if (width < 640) device = '📱 Small Mobile';
        else if (width < 768) device = '📱 Mobile';
        else if (width < 968) device = '📱 Tablet';
        else device = '💻 Desktop';
        
        indicator.textContent = `${device} (${width}px)`;
    }
    
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
}

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
            this.classList.add('invalid');
        } else if (this.checkValidity()) {
            this.style.borderColor = '#10b981';
            this.style.backgroundColor = '#f0fdf4';
            this.classList.remove('invalid');
            this.classList.add('valid');
        } else {
            this.style.borderColor = '#e2e8f0';
            this.style.backgroundColor = 'white';
            this.classList.remove('invalid', 'valid');
        }
    });
    
    input.addEventListener('blur', function() {
        if (this.value === '') {
            this.style.borderColor = '#e2e8f0';
            this.style.backgroundColor = 'white';
            this.classList.remove('invalid', 'valid');
        }
    });
    
    // Add haptic feedback on mobile
    input.addEventListener('focus', function() {
        if (navigator.vibrate && window.innerWidth < 768) {
            navigator.vibrate(10); // Short vibration on focus
        }
    });
});

// Smooth scroll to sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed header
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
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
            entry.target.classList.add('animated');
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
        form.addEventListener('submit', function(e) {
            // Validate demographics if present
            const ageInput = form.querySelector('#Age');
            const genderInput = form.querySelector('input[name="Gender"]:checked');
            
            if (ageInput && !ageInput.value) {
                e.preventDefault();
                alert('Please enter patient age');
                ageInput.focus();
                return;
            }
            
            if (!genderInput && form.querySelector('input[name="Gender"]')) {
                e.preventDefault();
                alert('Please select patient gender');
                return;
            }
            
            // Show loading state
            const originalHTML = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Add haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 50]); // Pattern vibration
            }
            
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

// Validate vital sign ranges with visual feedback
function validateVitalSign(input, min, max, name) {
    const value = parseFloat(input.value);
    if (value < min || value > max) {
        console.warn(`${name} value (${value}) is outside normal range (${min}-${max})`);
        showValidationMessage(input, `${name} is outside normal range`, 'warning');
        return false;
    }
    return true;
}

/**
 * Show validation message near input
 */
function showValidationMessage(input, message, type = 'warning') {
    // Remove existing message
    const existingMsg = input.parentElement.querySelector('.validation-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Create new message
    const msgDiv = document.createElement('div');
    msgDiv.className = `validation-message ${type}`;
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        color: ${type === 'warning' ? '#f59e0b' : '#ef4444'};
        font-size: 0.85rem;
        margin-top: 0.25rem;
        animation: fadeIn 0.3s ease;
    `;
    
    input.parentElement.appendChild(msgDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (msgDiv.parentElement) {
            msgDiv.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => msgDiv.remove(), 300);
        }
    }, 5000);
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
    
    // Escape to clear form
    if (e.key === 'Escape' && document.activeElement.tagName === 'INPUT') {
        document.activeElement.blur();
    }
});

/**
 * Handle orientation changes on mobile
 */
window.addEventListener('orientationchange', function() {
    // Adjust layout after orientation change
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});

/**
 * Optimize performance on low-end devices
 */
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    // Disable some animations on low-end devices
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
}

/**
 * Add pull-to-refresh indicator (experimental)
 */
let startY = 0;
let pulling = false;

document.addEventListener('touchstart', function(e) {
    startY = e.touches[0].clientY;
});

document.addEventListener('touchmove', function(e) {
    if (window.scrollY === 0 && e.touches[0].clientY > startY) {
        pulling = true;
        // Add visual feedback here if needed
    }
});

document.addEventListener('touchend', function() {
    if (pulling) {
        // Trigger refresh if needed
        pulling = false;
    }
});

/**
 * Add network status indicator
 */
window.addEventListener('online', function() {
    showNetworkStatus('online');
});

window.addEventListener('offline', function() {
    showNetworkStatus('offline');
});

function showNetworkStatus(status) {
    const notification = document.createElement('div');
    notification.className = `network-notification ${status}`;
    notification.textContent = status === 'online' ? 
        '✓ Connection restored' : '✗ No internet connection';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${status === 'online' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Add CSS animations
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-5px); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .form-control.valid {
        animation: pulse-green 0.3s ease;
    }
    
    .form-control.invalid {
        animation: shake 0.3s ease;
    }
    
    @keyframes pulse-green {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    /* Touch feedback */
    .btn:active, .nav-link:active {
        transform: scale(0.98);
    }
    
    /* Smooth transitions */
    * {
        -webkit-tap-highlight-color: transparent;
    }
`;
document.head.appendChild(style);

// Console welcome message
console.log('%c Sepsis Early Prediction System ', 'background: #667eea; color: white; font-size: 20px; padding: 10px;');
console.log('%c AI-Powered Clinical Decision Support ', 'background: #10b981; color: white; font-size: 14px; padding: 5px;');
console.log('');
console.log('System Features:');
console.log('✓ Random Forest ML Model');
console.log('✓ Age & Gender Demographics');
console.log('✓ SOFA & SIRS Score Calculation');
console.log('✓ Real-time Risk Assessment');
console.log('✓ Clinical Alerts & Recommendations');
console.log('✓ Mobile-Responsive Design');
console.log('');
console.log('Dataset: PhysioNet Sepsis Challenge (2,000 patients)');
console.log('Features: 40 total (13 base + 27 engineered)');
console.log('');
console.log('⚠️  For educational purposes only - Not for clinical use');
console.log('');
console.log(`Device: ${window.innerWidth < 768 ? '📱 Mobile' : '💻 Desktop'} (${window.innerWidth}px)`);