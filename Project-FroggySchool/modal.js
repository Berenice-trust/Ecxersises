export function createModal(modalId, content, confirmCallback, cancelCallback, confirmText = 'Save', cancelText = 'Cancel', triggerElement) {
    const modal = document.createElement('div');
    modal.classList.add('modal-card');
    modal.id = modalId;

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-body" style="visibility: hidden;">
                ${content}
                <button id="confirm-${modalId}">${confirmText}</button>
                <button id="cancel-${modalId}">${cancelText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const modalContent = modal.querySelector('.modal-content');
    const modalBody = modal.querySelector('.modal-body');
    const triggerRect = triggerElement.getBoundingClientRect();
    const startX = triggerRect.left + triggerRect.width / 2;
    const startY = triggerRect.top + triggerRect.height / 2;

    modalContent.style.position = 'absolute';
    modalContent.style.left = `${startX}px`;
    modalContent.style.top = `${startY}px`;
    modalContent.style.width = '0';
    modalContent.style.height = '0';
    modalContent.style.opacity = '0';
    modalContent.style.visibility = 'visible';

    const finalWidth = 500; // Set the final width
    const finalHeight = 300; // Set the final height

    modalContent.style.transition = 'all 3s ease';
    requestAnimationFrame(() => {
        modalContent.style.width = `${finalWidth}px`;
        modalContent.style.height = `${finalHeight}px`;
        modalContent.style.left = '50%';
        modalContent.style.top = '50%';
        modalContent.style.transform = 'translate(-50%, -50%)';
        modalContent.style.opacity = '1';
    });

    setTimeout(() => {
        modalBody.style.visibility = 'visible';
    }, 3000); // Show the modal body after the animation

    document.getElementById(`confirm-${modalId}`).addEventListener('click', () => {
        confirmCallback();
        closeModal(modalId);
    });

    document.getElementById(`cancel-${modalId}`).addEventListener('click', () => {
        cancelCallback();
        closeModal(modalId, startX, startY);
    });

    // Display the modal
    modal.style.display = 'flex';
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        const modalBody = modal.querySelector('.modal-body');
        modalBody.style.visibility = 'hidden';
        modalContent.style.transition = 'opacity 1s ease';
        modalContent.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 1000); // Match the transition duration
    }
}
