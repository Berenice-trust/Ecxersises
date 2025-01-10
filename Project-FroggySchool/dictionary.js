import { DictionaryStorage } from './dictionaryStorage.js';
import { createModal } from './modal.js';

// Create an instance of DictionaryStorage
const dictionaryStorage = new DictionaryStorage('dictionaryStorage');
let wordToDelete = ''; // Variable to store the word to be deleted
let currentCategory = ''; // Variable to store the current category filter
let isLoading = false; // Flag to prevent multiple simultaneous loads
let currentPage = 1; // Variable to store the current page
const itemsPerPage = 20; // Number of items per page

// Function to update the content of an output element
function updateOutput(content, outputSelector) {
    let output = document.querySelector(outputSelector);
    output.innerHTML = content;

    if (content.trim()) {
        output.classList.add('show');
    } else {
        output.classList.remove('show');
    }
}

// Function to update the list of items
function updateList(items, listSelector) {
    let listContainer = document.querySelector(listSelector);
    let list = listContainer.querySelector('ul');

    list.innerHTML = items.map(function(item) {
        return `<li>${item}</li>`;
    }).join('');

    listContainer.classList.add('show');
}

// Function to show the loading spinner
function showLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'block';
    }
}

// Function to hide the loading spinner
function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Function to list words based on the selected category with lazy loading
export function listWords(category = '', page = 1) {
    currentCategory = category;
    currentPage = page;
    isLoading = true;
    showLoadingSpinner(); // Show loading spinner

    let words;
    if (category) {
        words = dictionaryStorage.getWordsByCategory(category);
    } else {
        words = dictionaryStorage.getWords();
    }
    const wordList = document.querySelector('.word-list ul');
    if (page === 1) {
        wordList.innerHTML = '';
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, words.length);
    const paginatedWords = words.slice(startIndex, endIndex);

    paginatedWords.forEach(word => {
        const data = dictionaryStorage.getWord(word);
        const card = createCard(word, data);
        wordList.appendChild(card);
    });

    document.querySelector('.word-list').classList.add('show');
    updateCategoryFilter();
    isLoading = false; // Reset loading flag
    hideLoadingSpinner(); // Hide loading spinner
}

// Function to create a card element
function createCard(word, data) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h3 data-word="${word}">${word}</h3>
        <p><strong>Translation:</strong> ${data.translation}</p>
        <p><strong>Example:</strong> ${data.example}</p>
        <p><strong>Example Translation:</strong> ${data.exampleTranslation}</p>
        <p><strong>Category:</strong> ${data.category}</p>
        ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${word}">` : ''}
        ${data.audioUrl ? `<audio controls src="data:audio/webm;base64,${data.audioUrl}"></audio>` : ''}
        <button onclick="showEditModal('${word}', this)">Edit</button>
        <button onclick="showDeleteModal('${word}', this)">Delete</button>
        <div class="message"></div>
    `;
    return card;
}

// Function to update the category filter dropdown
export function updateCategoryFilter() {
    const categories = new Set(dictionaryStorage.getWords().map(word => dictionaryStorage.getWord(word).category));
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    categoryFilter.value = currentCategory;
}

// Function to handle delete confirmation
function handleDeleteConfirm() {
    const result = dictionaryStorage.deleteWord(wordToDelete);
    if (result) {
        const card = document.querySelector(`.card h3[data-word="${wordToDelete}"]`).parentElement;
        const cardHeight = card.getBoundingClientRect().height;
        const cardMarginTop = getComputedStyle(card).marginTop;
        const cardMarginBottom = getComputedStyle(card).marginBottom;
        const reducedMarginBottom = parseFloat(cardMarginBottom) / 2 + 'px';
        const reducedMarginTop = parseFloat(cardMarginTop) / 2 + 'px';

        card.style.transition = 'height 3s ease, opacity 3s ease, padding 3s ease, margin 3s ease';
        card.style.height = cardHeight + 'px';
        card.style.marginTop = cardMarginTop;
        card.style.marginBottom = cardMarginBottom;
        requestAnimationFrame(() => {
            card.style.height = '0';
            card.style.opacity = '0';
            card.style.paddingTop = '0';
            card.style.paddingBottom = '0';
            card.style.marginTop = `-${reducedMarginTop}`;
            card.style.marginBottom = `-${reducedMarginBottom}`;
        });
        setTimeout(() => {
            card.remove();
        }, 3000);
    }
    updateCategoryFilter();
}

// Function to handle delete cancel
function handleDeleteCancel() {
    // Cancel action
}

// Function to check if the URL is valid
function isValidUrl(url) {
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!urlPattern.test(url);
}

// Function to check if the URL points to a valid image
async function validateImageUrl(url) {
    if (url.startsWith('data:image/')) {
        return url; // Base64 encoded image data is considered valid
    }
    if (!isValidUrl(url)) {
        console.error('Invalid URL format');
        return null; // или 'path/to/default/image.png' для базовой картинки
    }
    try {
        const response = await fetch(url);
        if (response.ok && response.headers.get('content-type').startsWith('image/')) {
            return url;
        } else {
            throw new Error('Invalid image URL');
        }
    } catch (error) {
        console.error('Error validating image URL:', error);
        return null; // или 'path/to/default/image.png' для базовой картинки
    }
}

// Universal function to handle add/edit confirmation
async function handleConfirm(isEdit, word, data) {
    const newWord = document.getElementById('edit-word').value;
    const category = document.getElementById('edit-category').value;
    let imageUrl = document.getElementById('edit-imageUrl').value;

    imageUrl = await validateImageUrl(imageUrl);

    const updatedData = {
        translation: document.getElementById('edit-translation').value || '',
        example: document.getElementById('edit-example').value || '',
        exampleTranslation: document.getElementById('edit-example-translation').value || '',
        category: category || '',
        imageUrl: imageUrl || '',
        audioUrl: data ? data.audioUrl : '' // Сохраняем существующий аудиофайл для редактирования
    };

    // Check if the delete audio checkbox is checked
    const deleteAudioCheckbox = document.getElementById('delete-audio-checkbox');
    if (deleteAudioCheckbox && deleteAudioCheckbox.checked) {
        await dictionaryStorage.deleteAudio(newWord);
        updatedData.audioUrl = '';
    } else {
        const audioFileInput = document.getElementById(`audio-file-input-${isEdit ? 'edit' : 'add'}-modal`);
        const audioFile = audioFileInput.files[0];
        if (audioFile) {
            const audioBase64 = await dictionaryStorage.saveAudio(newWord, audioFile);
            updatedData.audioUrl = audioBase64;
        }
    }

    if (isEdit && newWord !== word) {
        dictionaryStorage.deleteWord(word);
    }

    dictionaryStorage.addWord(newWord, updatedData);

    // Update the card content without reloading the entire list
    if (isEdit) {
        const card = document.querySelector(`.card h3[data-word="${word}"]`).parentElement;
        card.innerHTML = `
            <h3 data-word="${newWord}">${newWord}</h3>
            <p><strong>Translation:</strong> ${updatedData.translation}</p>
            <p><strong>Example:</strong> ${updatedData.example}</p>
            <p><strong>Example Translation:</strong> ${updatedData.exampleTranslation}</p>
            <p><strong>Category:</strong> ${updatedData.category}</p>
            ${updatedData.imageUrl ? `<img src="${updatedData.imageUrl}" alt="${newWord}">` : ''}
            ${updatedData.audioUrl ? `<audio controls src="data:audio/webm;base64,${updatedData.audioUrl}"></audio>` : ''}
            <button onclick="showEditModal('${newWord}', this)">Edit</button>
            <button onclick="showDeleteModal('${newWord}', this)">Delete</button>
            <div class="message">Changes saved</div>
        `;
        card.classList.add('highlight-success');
        setTimeout(() => {
            const message = card.querySelector('.message');
            message.textContent = '';
            card.classList.remove('highlight-success');
        }, 3000);
    } else {
        // Add the new word to the list immediately
        const wordList = document.querySelector('.word-list ul');
        const card = createCard(newWord, updatedData);
        wordList.appendChild(card);
        document.querySelector('.word-list').classList.add('show');
    }
}

// Function to handle edit cancel
function handleEditCancel() {
    // Cancel action
}

// Function to handle add cancel
function handleAddCancel() {
    // Cancel action
}

// Function to show the delete confirmation modal
window.showDeleteModal = function(word, triggerElement) {
    wordToDelete = word;
    const content = `<p>Are you sure you want to delete this word?</p>`;

    createModal('delete-modal', content, handleDeleteConfirm, handleDeleteCancel, 'Yes', 'No', triggerElement);
};

// Function to show the edit modal
window.showEditModal = function(word, triggerElement) {
    const data = dictionaryStorage.getWord(word);
    const categories = new Set(dictionaryStorage.getWords().map(word => dictionaryStorage.getWord(word).category));
    const categoryOptions = Array.from(categories).map(category => `<option value="${category}">${category}</option>`).join('');
    const content = `
        <label>Word: <input type="text" id="edit-word" value="${word}"></label>
        <label>Translation: <input type="text" id="edit-translation" value="${data.translation}"></label>
        <label>Example: <input type="text" id="edit-example" value="${data.example}"></label>
        <label>Example Translation: <input type="text" id="edit-example-translation" value="${data.exampleTranslation || ''}"></label>
        <label>Category: 
            <input list="category-list" id="edit-category" value="${data.category}">
            <datalist id="category-list">
                ${categoryOptions}
            </datalist>
        </label>
        <label>Image URL: <input type="text" id="edit-imageUrl" value="${data.imageUrl || ''}" placeholder="Введите ссылку на изображение (URL)"></label>
        <label>Audio file: <input type="file" id="audio-file-input-edit-modal" accept="audio/*"></label>
        <button id="upload-button-edit-modal" disabled>Upload Audio</button>
        ${data.audioUrl ? `<div class='audio-delete-group'><input type="checkbox" id="delete-audio-checkbox" class='delete-checkbox' ><label for='delete-audio-checkbox'> Delete Audio</label>` : ''}
    `;

    createModal('edit-modal', content, () => handleConfirm(true, word, data), handleEditCancel, 'Save', 'Cancel', triggerElement);

    // Enable the upload button when a file is selected
    document.getElementById('audio-file-input-edit-modal').addEventListener('change', function() {
        document.getElementById('upload-button-edit-modal').disabled = !this.files.length;
    });
}

// Function to show the add modal
window.showAddModal = function(triggerElement) {
    const categories = new Set(dictionaryStorage.getWords().map(word => dictionaryStorage.getWord(word).category));
    const categoryOptions = Array.from(categories).map(category => `<option value="${category}">${category}</option>`).join('');
    const content = `
        <label>Word: <input type="text" id="edit-word" value=""></label>
        <label>Translation: <input type="text" id="edit-translation" value=""></label>
        <label>Example: <input type="text" id="edit-example" value=""></label>
        <label>Example Translation: <input type="text" id="edit-example-translation" value=""></label>
        <label>Category: 
            <input list="category-list" id="edit-category">
            <datalist id="category-list">
                ${categoryOptions}
            </datalist>
        </label>
        <label>Image URL: <input type="text" id="edit-imageUrl" value="" placeholder="Введите ссылку на изображение (URL)"></label>
        <label>Audio file: <input type="file" id="audio-file-input-add-modal" accept="audio/*"></label>
        <button id="upload-button-add-modal" disabled>Upload Audio</button>
    `;

    createModal('add-modal', content, () => handleConfirm(false, '', null), handleAddCancel, 'Save', 'Cancel', triggerElement);

    // Enable the upload button when a file is selected
    document.getElementById('audio-file-input-add-modal').addEventListener('change', function() {
        document.getElementById('upload-button-add-modal').disabled = !this.files.length;
    });
}

// Event handler for listing all words
document.getElementById('list-words').onclick = function() {
    listWords();
};

// Event handler for changing the category filter
document.getElementById('category-filter').onchange = function() {
    const category = this.value;
    listWords(category);
    sessionStorage.setItem('currentCategory', category); // Save the current category to sessionStorage
};

// Event handler for adding a new word
document.getElementById('add-word').onclick = function() {
    showAddModal(this);
};

// Save the current category to sessionStorage when it changes
document.getElementById('category-filter').addEventListener('change', (event) => {
    sessionStorage.setItem('currentCategory', event.target.value);
});

// Initial load of category filter
updateCategoryFilter();

// Event handler for lazy loading
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isLoading) {
        isLoading = true;
        currentPage++;
        listWords(currentCategory, currentPage);
    }
});
