export function createModal(modalId, content, confirmCallback, cancelCallback) {
    console.log(`Creating modal with ID: ${modalId}`); // Debugging line
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.id = modalId;

    modal.innerHTML = `
        <div class="modal-content">
            ${content}
            <button id="confirm-${modalId}">Save</button>
            <button id="cancel-${modalId}">Cancel</button>
        </div>
    `;

    document.body.appendChild(modal);
    console.log(`Modal with ID: ${modalId} added to the DOM`); // Debugging line

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
    console.log(`Modal with ID: ${modalId} displayed`); // Debugging line
    console.log(modal); // Debugging line
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
        console.log(`Modal with ID: ${modalId} removed from the DOM`); // Debugging line
    }
}
