// Sepsis Prediction System - Results Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeResultsPage();
});

/**
 * Initialize the results page
 */
function initializeResultsPage() {
    // Add animation observers
    setupScrollAnimations();
    
    // Setup print functionality
    setupPrintHandler();
    
    // Setup export functionality
    setupExportHandler();
    
    // Highlight abnormal values
    highlightAbnormalValues();
    
    // Add tooltips
    addTooltips();
    
    // Setup collapsible sections
    setupCollapsibleSections();
    
    console.log('Results page initialized successfully');
}

/**
 * Setup scroll animations for cards
 */
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all result cards
    document.querySelectorAll('.results-card').forEach(card => {
        observer.observe(card);
    });
}

/**
 * Setup print handler with custom styling
 */
function setupPrintHandler() {
    const printButton = document.querySelector('[onclick*="print"]');
    
    if (printButton) {
        printButton.addEventListener('click', function(e) {
            e.preventDefault();
            printResults();
        });
    }
}

/**
 * Print results with custom formatting
 */
function printResults() {
    // Add print-specific class
    document.body.classList.add('printing');
    
    // Trigger print
    window.print();
    
    // Remove print class after printing
    setTimeout(() => {
        document.body.classList.remove('printing');
    }, 1000);
}

/**
 * Setup export to PDF/Image functionality
 */
function setupExportHandler() {
    // Add export button if needed
    const actionButtons = document.querySelector('.action-buttons');
    
    if (actionButtons && !document.querySelector('.export-btn')) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary export-btn';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export as PDF';
        exportBtn.onclick = exportToPDF;
        
        // Insert after print button
        const printBtn = document.querySelector('[onclick*="print"]');
        if (printBtn) {
            printBtn.parentNode.insertBefore(exportBtn, printBtn.nextSibling);
        }
    }
}

/**
 * Export results to PDF (requires html2pdf library)
 */
function exportToPDF() {
    // Check if html2pdf is available
    if (typeof html2pdf === 'undefined') {
        alert('PDF export feature requires html2pdf library. Using print instead.');
        printResults();
        return;
    }
    
    const element = document.querySelector('.results-container');
    const opt = {
        margin: 10,
        filename: `sepsis-assessment-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
}

/**
 * Highlight abnormal values in vitals
 */
function highlightAbnormalValues() {
    const vitalItems = document.querySelectorAll('.vital-item');
    
    vitalItems.forEach(item => {
        const label = item.querySelector('label').textContent.toLowerCase();
        const valueText = item.querySelector('.value').textContent;
        const value = parseFloat(valueText);
        
        if (isNaN(value)) return;
        
        let isAbnormal = false;
        
        // Define normal ranges
        const ranges = {
            'heart rate': { min: 60, max: 100 },
            'temperature': { min: 36.5, max: 37.5 },
            'respiratory rate': { min: 12, max: 20 },
            'o2 saturation': { min: 95, max: 100 },
            'systolic': { min: 90, max: 140 },
            'diastolic': { min: 60, max: 90 },
            'map': { min: 70, max: 100 },
            'wbc': { min: 4, max: 11 },
            'platelets': { min: 150, max: 400 },
            'creatinine': { min: 0.6, max: 1.2 },
            'lactate': { min: 0.5, max: 2.2 }
        };
        
        // Check if value is outside normal range
        for (const [key, range] of Object.entries(ranges)) {
            if (label.includes(key)) {
                if (value < range.min || value > range.max) {
                    isAbnormal = true;
                    break;
                }
            }
        }
        
        // Add visual indicator for abnormal values
        if (isAbnormal) {
            item.style.borderLeftColor = '#ef4444';
            item.style.borderLeftWidth = '5px';
            item.classList.add('abnormal-value');
            
            // Add warning icon
            const valueDiv = item.querySelector('.value');
            if (!valueDiv.querySelector('.warning-icon')) {
                const warningIcon = document.createElement('i');
                warningIcon.className = 'fas fa-exclamation-triangle warning-icon';
                warningIcon.style.color = '#ef4444';
                warningIcon.style.marginLeft = '8px';
                warningIcon.style.fontSize = '1rem';
                warningIcon.title = 'Value outside normal range';
                valueDiv.appendChild(warningIcon);
            }
        }
    });
}

/**
 * Add tooltips to elements
 */
function addTooltips() {
    // Add tooltips to clinical scores
    const sofaScore = document.querySelector('.clinical-scores .score-item:first-child');
    if (sofaScore) {
        sofaScore.title = 'Sequential Organ Failure Assessment: Evaluates dysfunction across multiple organ systems';
    }
    
    const sirsCount = document.querySelector('.clinical-scores .score-item:last-child');
    if (sirsCount) {
        sirsCount.title = 'Systemic Inflammatory Response Syndrome: Count of inflammatory criteria met';
    }
    
    // Add tooltips to abbreviations
    const abbreviations = {
        'HR': 'Heart Rate',
        'O2Sat': 'Oxygen Saturation',
        'Temp': 'Temperature',
        'SBP': 'Systolic Blood Pressure',
        'DBP': 'Diastolic Blood Pressure',
        'MAP': 'Mean Arterial Pressure',
        'Resp': 'Respiratory Rate',
        'WBC': 'White Blood Cell Count',
        'SOFA': 'Sequential Organ Failure Assessment',
        'SIRS': 'Systemic Inflammatory Response Syndrome',
        'ICU': 'Intensive Care Unit',
        'ARDS': 'Acute Respiratory Distress Syndrome'
    };
    
    document.querySelectorAll('.vital-item label').forEach(label => {
        const text = label.textContent;
        for (const [abbr, full] of Object.entries(abbreviations)) {
            if (text.includes(abbr)) {
                label.title = full;
                break;
            }
        }
    });
}

/**
 * Setup collapsible sections for better mobile experience
 */
function setupCollapsibleSections() {
    // This is optional - can be used to make sections collapsible on mobile
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        document.querySelectorAll('.results-card h2').forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const icon = this.querySelector('i:last-child');
                
                if (!icon || icon.classList.contains('fa-chevron-down') || icon.classList.contains('fa-chevron-up')) {
                    return; // Skip if already has chevron
                }
                
                // Add toggle functionality
                this.classList.toggle('collapsed');
                if (content) {
                    content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }
            });
        });
    }
}

/**
 * Generate summary text for easy sharing
 */
function generateSummaryText() {
    const results = {
        riskLevel: document.querySelector('.risk-level')?.textContent || 'N/A',
        probability: document.querySelector('.risk-probability')?.textContent || 'N/A',
        sofa: document.querySelector('#sofaScore')?.textContent || 'N/A',
        sirs: document.querySelector('#sirsCount')?.textContent || 'N/A',
        timestamp: document.querySelector('.results-timestamp')?.textContent || 'N/A'
    };
    
    return `
Sepsis Risk Assessment Results
==============================
${results.timestamp}

Risk Level: ${results.riskLevel}
${results.probability}

Clinical Scores:
- SOFA Score: ${results.sofa}
- SIRS Count: ${results.sirs}

This is an automated assessment. Always consult with healthcare professionals.
    `.trim();
}

/**
 * Copy summary to clipboard
 */
function copySummaryToClipboard() {
    const summary = generateSummaryText();
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(summary).then(() => {
            showNotification('Summary copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy summary', 'error');
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = summary;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showNotification('Summary copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy summary', 'error');
        }
        
        document.body.removeChild(textarea);
    }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 1.5rem';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    notification.style.fontWeight = '600';
    notification.style.animation = 'slideInRight 0.3s ease-out';
    
    // Set color based on type
    const colors = {
        success: { bg: '#10b981', text: 'white' },
        error: { bg: '#ef4444', text: 'white' },
        info: { bg: '#2563eb', text: 'white' }
    };
    
    notification.style.backgroundColor = colors[type].bg;
    notification.style.color = colors[type].text;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Add copy button to action buttons
 */
function addCopyButton() {
    const actionButtons = document.querySelector('.action-buttons');
    
    if (actionButtons && !document.querySelector('.copy-summary-btn')) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn btn-secondary copy-summary-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Summary';
        copyBtn.onclick = copySummaryToClipboard;
        
        actionButtons.appendChild(copyBtn);
    }
}

/**
 * Calculate and display time elapsed
 */
function updateTimeElapsed() {
    const timestampElement = document.querySelector('.results-timestamp');
    if (!timestampElement) return;
    
    const timestampText = timestampElement.textContent;
    const match = timestampText.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    
    if (match) {
        const assessmentTime = new Date(match[0]);
        const now = new Date();
        const diffMs = now - assessmentTime;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) {
            const elapsed = document.createElement('span');
            elapsed.style.color = '#64748b';
            elapsed.style.marginLeft = '10px';
            elapsed.textContent = `(${diffMins} minutes ago)`;
            timestampElement.appendChild(elapsed);
        }
    }
}

/**
 * Add keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + P for print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            printResults();
        }
        
        // Ctrl/Cmd + C for copy summary (when not in input field)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.target.matches('input, textarea')) {
            // Allow default copy behavior
        }
        
        // Escape to go back
        if (e.key === 'Escape') {
            const newAssessmentBtn = document.querySelector('a[href="/predict"]');
            if (newAssessmentBtn) {
                window.location.href = newAssessmentBtn.href;
            }
        }
    });
}

/**
 * Track user interactions (for analytics)
 */
function trackInteraction(action, label) {
    console.log(`User interaction: ${action} - ${label}`);
    
    // If Google Analytics is available
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': 'Results Page',
            'event_label': label
        });
    }
}

/**
 * Add smooth scroll behavior
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
}

/**
 * Initialize all additional features
 */
function initializeAdditionalFeatures() {
    addCopyButton();
    updateTimeElapsed();
    setupKeyboardShortcuts();
    setupSmoothScroll();
}

// Initialize additional features when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdditionalFeatures);
} else {
    initializeAdditionalFeatures();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .abnormal-value {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        50% {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        }
    }
`;
document.head.appendChild(style);

// Export functions for external use
window.SepsisResults = {
    printResults,
    copySummaryToClipboard,
    generateSummaryText,
    exportToPDF
};