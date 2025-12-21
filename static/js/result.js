
document.addEventListener('DOMContentLoaded', function() {
    initializeResultsPage();
});

function initializeResultsPage() {
    setupScrollAnimations();
    setupPrintHandler();
    setupExportHandler();
    highlightAbnormalValues();
    addTooltips();
    setupCollapsibleSections();
    initializeMobileResultsFeatures();
    highlightDemographicRisks();
    
    console.log('Results page initialized successfully');
}

function initializeMobileResultsFeatures() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        setupSwipeNavigation();
        optimizeCardSpacing();
        addScrollToTopButton();
    }
}

function setupSwipeNavigation() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 100;
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                const predictBtn = document.querySelector('a[href="/predict"]');
                if (predictBtn && window.scrollY < 100) {
                    window.location.href = '/predict';
                }
            }
        }
    }
}

function addScrollToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'scroll-to-top-btn';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #2563eb;
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        font-size: 1.2rem;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(button);
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            button.style.display = 'flex';
        } else {
            button.style.display = 'none';
        }
    });
    
    button.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    });
}

function optimizeCardSpacing() {
    const cards = document.querySelectorAll('.results-card');
    cards.forEach(card => {
        card.style.marginBottom = '1rem';
    });
}

function highlightDemographicRisks() {
    const ageElement = document.querySelector('.vital-item label:contains("Age")');
    const genderElement = document.querySelector('.vital-item label:contains("Gender")');
    
    if (!ageElement) {
        const vitalItems = document.querySelectorAll('.vital-item');
        vitalItems.forEach(item => {
            const label = item.querySelector('label');
            if (!label) return;
            
            const labelText = label.textContent.toLowerCase();
            const valueElement = item.querySelector('.value');
            
            if (labelText.includes('age') && valueElement) {
                const age = parseInt(valueElement.textContent);
                
                if (age >= 75) {
                    item.style.borderLeftColor = '#dc2626';
                    item.style.borderLeftWidth = '5px';
                    item.classList.add('high-risk-demographic');
                    addRiskBadge(item, 'Very High Risk Age', 'danger');
                } else if (age >= 65) {
                    item.style.borderLeftColor = '#f59e0b';
                    item.style.borderLeftWidth = '5px';
                    item.classList.add('elevated-risk-demographic');
                    addRiskBadge(item, 'High Risk Age', 'warning');
                }
            }
            
            if (labelText.includes('gender') && valueElement) {
                const genderText = valueElement.textContent.toLowerCase();
                if (genderText.includes('male')) {
                    item.style.borderLeftColor = '#3b82f6';
                }
            }
        });
    }
}

function addRiskBadge(element, text, type) {
    const badge = document.createElement('span');
    badge.className = `risk-badge risk-badge-${type}`;
    badge.textContent = text;
    badge.style.cssText = `
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-left: 0.5rem;
        background: ${type === 'danger' ? '#fee2e2' : '#fef3c7'};
        color: ${type === 'danger' ? '#991b1b' : '#92400e'};
    `;
    
    const label = element.querySelector('label');
    if (label) {
        label.appendChild(badge);
    }
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    document.querySelectorAll('.results-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

function setupPrintHandler() {
    const printButtons = document.querySelectorAll('[onclick*="print"]');
    
    printButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            printResults();
        });
    });
}

function printResults() {
    document.body.classList.add('printing');
    if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
    }
    window.print();
    setTimeout(() => {
        document.body.classList.remove('printing');
    }, 1000);
}

function setupExportHandler() {
    const actionButtons = document.querySelector('.action-buttons');
    
    if (actionButtons && !document.querySelector('.export-btn')) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary export-btn';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export PDF';
        exportBtn.onclick = exportToPDF;
        const printBtn = document.querySelector('[onclick*="print"]');
        if (printBtn) {
            printBtn.parentNode.insertBefore(exportBtn, printBtn.nextSibling);
        }
    }
}

function exportToPDF() {
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
    
    showNotification('Generating PDF...', 'info');
    
    html2pdf().set(opt).from(element).save().then(() => {
        showNotification('PDF downloaded successfully!', 'success');
    }).catch(err => {
        console.error('PDF generation error:', err);
        showNotification('Failed to generate PDF', 'error');
    });
}

function highlightAbnormalValues() {
    const vitalItems = document.querySelectorAll('.vital-item');
    
    vitalItems.forEach(item => {
        const label = item.querySelector('label');
        if (!label) return;
        
        const labelText = label.textContent.toLowerCase();
        const valueText = item.querySelector('.value')?.textContent;
        if (!valueText) return;
        
        const value = parseFloat(valueText);
        
        if (isNaN(value)) return;
        
        let isAbnormal = false;
        const ranges = {
            'heart rate': { min: 60, max: 100 },
            'temperature': { min: 36.5, max: 37.5 },
            'respiratory rate': { min: 12, max: 20 },
            'o2 saturation': { min: 95, max: 100 },
            'o2': { min: 95, max: 100 },
            'systolic': { min: 90, max: 140 },
            'diastolic': { min: 60, max: 90 },
            'map': { min: 70, max: 100 },
            'wbc': { min: 4, max: 11 },
            'platelets': { min: 150, max: 400 },
            'creatinine': { min: 0.6, max: 1.2 },
            'lactate': { min: 0.5, max: 2.2 }
        };
        for (const [key, range] of Object.entries(ranges)) {
            if (labelText.includes(key)) {
                if (value < range.min || value > range.max) {
                    isAbnormal = true;
                    break;
                }
            }
        }
        if (isAbnormal) {
            item.style.borderLeftColor = '#ef4444';
            item.style.borderLeftWidth = '5px';
            item.classList.add('abnormal-value');
            const valueDiv = item.querySelector('.value');
            if (valueDiv && !valueDiv.querySelector('.warning-icon')) {
                const warningIcon = document.createElement('i');
                warningIcon.className = 'fas fa-exclamation-triangle warning-icon';
                warningIcon.style.cssText = `
                    color: #ef4444;
                    margin-left: 8px;
                    font-size: 1rem;
                    animation: pulse 2s infinite;
                `;
                warningIcon.title = 'Value outside normal range';
                valueDiv.appendChild(warningIcon);
            }
        }
    });
}

function addTooltips() {
    const sofaScore = document.querySelector('.clinical-scores .score-item:first-child');
    if (sofaScore) {
        sofaScore.title = 'Sequential Organ Failure Assessment: Evaluates dysfunction across multiple organ systems';
    }
    
    const sirsCount = document.querySelector('.clinical-scores .score-item:last-child');
    if (sirsCount) {
        sirsCount.title = 'Systemic Inflammatory Response Syndrome: Count of inflammatory criteria met';
    }
    const abbreviations = {
        'HR': 'Heart Rate',
        'O2Sat': 'Oxygen Saturation',
        'O2': 'Oxygen',
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

function setupCollapsibleSections() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        document.querySelectorAll('.results-card h2').forEach(header => {
            if (header.classList.contains('collapsible-header')) return;
            
            header.classList.add('collapsible-header');
            header.style.cursor = 'pointer';
            header.style.userSelect = 'none';
            const chevron = document.createElement('i');
            chevron.className = 'fas fa-chevron-down';
            chevron.style.cssText = `
                float: right;
                transition: transform 0.3s ease;
                font-size: 0.9rem;
                margin-top: 3px;
            `;
            header.appendChild(chevron);
            
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const isCollapsed = this.classList.toggle('collapsed');
                
                if (content) {
                    if (isCollapsed) {
                        content.style.display = 'none';
                        chevron.style.transform = 'rotate(-90deg)';
                    } else {
                        content.style.display = 'block';
                        chevron.style.transform = 'rotate(0deg)';
                    }
                }
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            });
        });
    }
}

function generateSummaryText() {
    const ageElement = document.querySelector('.vital-item label:contains("Age")');
    const genderElement = document.querySelector('.vital-item label:contains("Gender")');
    
    let demographics = '';
    const vitalItems = document.querySelectorAll('.vital-item');
    vitalItems.forEach(item => {
        const label = item.querySelector('label');
        const value = item.querySelector('.value');
        if (label && value) {
            if (label.textContent.includes('Age')) {
                demographics += `Age: ${value.textContent}\n`;
            }
            if (label.textContent.includes('Gender')) {
                demographics += `Gender: ${value.textContent}\n`;
            }
        }
    });
    
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

Patient Demographics:
${demographics}
Risk Level: ${results.riskLevel}
${results.probability}

Clinical Scores:
- SOFA Score: ${results.sofa}
- SIRS Count: ${results.sirs}

This is an automated assessment. Always consult with healthcare professionals.
    `.trim();
}

function copySummaryToClipboard() {
    const summary = generateSummaryText();
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(summary).then(() => {
            showNotification('Summary copied to clipboard!', 'success');
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 50]);
            }
        }).catch(err => {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy summary', 'error');
        });
    } else {
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
        max-width: 90%;
    `;
    const colors = {
        success: { bg: '#10b981', text: 'white' },
        error: { bg: '#ef4444', text: 'white' },
        info: { bg: '#2563eb', text: 'white' },
        warning: { bg: '#f59e0b', text: 'white' }
    };
    
    notification.style.backgroundColor = colors[type].bg;
    notification.style.color = colors[type].text;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentElement) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

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
            elapsed.style.cssText = `
                color: #64748b;
                margin-left: 10px;
                font-size: 0.9rem;
            `;
            elapsed.textContent = `(${diffMins} min${diffMins !== 1 ? 's' : ''} ago)`;
            timestampElement.appendChild(elapsed);
        }
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            printResults();
        }
        if (e.key === 'Escape') {
            const newAssessmentBtn = document.querySelector('a[href="/predict"]');
            if (newAssessmentBtn) {
                window.location.href = newAssessmentBtn.href;
            }
        }
    });
}

function trackInteraction(action, label) {
    console.log(`User interaction: ${action} - ${label}`);
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': 'Results Page',
            'event_label': label
        });
    }
}

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

function initializeAdditionalFeatures() {
    addCopyButton();
    updateTimeElapsed();
    setupKeyboardShortcuts();
    setupSmoothScroll();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdditionalFeatures);
} else {
    initializeAdditionalFeatures();
}
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
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
    
    .abnormal-value {
        animation: pulseRed 2s infinite;
    }
    
    @keyframes pulseRed {
        0%, 100% {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        50% {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        }
    }
    
    .scroll-to-top-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5);
    }
    
    .collapsible-header:active {
        transform: scale(0.98);
    }
    
    @media (max-width: 768px) {
        .notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: calc(100% - 20px);
        }
    }
`;
document.head.appendChild(style);
window.SepsisResults = {
    printResults,
    copySummaryToClipboard,
    generateSummaryText,
    exportToPDF,
    showNotification
};

console.log('✓ Results page enhanced with mobile support and demographics highlighting');