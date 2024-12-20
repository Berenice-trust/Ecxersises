export function createModal(modalId, content, confirmCallback, cancelCallback, confirmText = 'Save', cancelText = 'Cancel') {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.id = modalId;

    modal.innerHTML = `
        <div class="modal-content">
            ${content}
            <button id="confirm-${modalId}">${confirmText}</button>
            <button id="cancel-${modalId}">${cancelText}</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById(`confirm-${modalId}`).addEventListener('click', () => {
        confirmCallback();
        closeModal(modalId);
    });

    document.getElementById(`cancel-${modalId}`).addEventListener('click', () => {
        cancelCallback();
        closeModal(modalId);
    });

    // Display the modal
    modal.style.display = 'flex';
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}
