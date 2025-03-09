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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `site-notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="notification-icon fas ${getIconForType(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Animazione di entrata
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Auto-close dopo 5 secondi
    const timeout = setTimeout(() => {
        closeNotification(notification);
    }, 5000);

    // Pulsante di chiusura
    notification.querySelector('.notification-close').onclick = () => {
        clearTimeout(timeout);
        closeNotification(notification);
    };
}

function closeNotification(notification) {
    notification.classList.remove('show');
    notification.addEventListener('transitionend', () => {
        notification.remove();
    });
}

function getIconForType(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Sostituzione globale degli alert
window.alert = (message) => showNotification(message);
