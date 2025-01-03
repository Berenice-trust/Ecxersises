import { DictionaryStorage } from './dictionaryStorage.js';
import { createModal } from './modal.js';

// Create an instance of DictionaryStorage
const dictionaryStorage = new DictionaryStorage('dictionaryStorage');
let wordToDelete = ''; // Variable to store the word to be deleted
let currentCategory = ''; // Variable to store the current category filter
let scrollPosition = 0; // Variable to store the scroll position

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

// Function to list words based on the selected category
function listWords(category = '') {
    currentCategory = category;
    let words;
    if (category) {
        words = dictionaryStorage.getWordsByCategory(category);
    } else {
        words = dictionaryStorage.getWords();
    }
    const wordList = document.querySelector('.word-list ul');
    wordList.innerHTML = '';

    words.forEach(word => {
        const data = dictionaryStorage.getWord(word);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3 data-word="${word}">${word}</h3>
            <p><strong>Translation:</strong> ${data.translation}</p>
            <p><strong>Example:</strong> ${data.example}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${word}">` : ''}
            ${data.audioUrl ? `<audio controls src="${data.audioUrl}"></audio>` : ''}
            <button onclick="showEditModal('${word}', this)">Edit</button>
            <button onclick="showDeleteModal('${word}', this)">Delete</button>
            <div class="message"></div>
        `;
        wordList.appendChild(card);
    });

    document.querySelector('.word-list').classList.add('show');
    updateCategoryFilter();
}

// Function to update the category filter dropdown
function updateCategoryFilter() {
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

// Function to show the delete confirmation modal
window.showDeleteModal = function(word, triggerElement) {
    wordToDelete = word;
    const content = `<p>Are you sure you want to delete this word?</p>`;

    createModal('delete-modal', content, () => {
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
    }, () => {
        // Cancel action
    }, 'Yes', 'No', triggerElement);
};

// Function to show the edit modal
window.showEditModal = function(word, triggerElement) {
    saveScrollPosition();
    const data = dictionaryStorage.getWord(word);
    const content = `
        <label>Word: <input type="text" id="edit-word" value="${word}"></label>
        <label>Translation: <input type="text" id="edit-translation" value="${data.translation}"></label>
        <label>Example: <input type="text" id="edit-example" value="${data.example}"></label>
        <label>Category: <input type="text" id="edit-category" value="${data.category}"></label>
        <label>Image URL: <input type="text" id="edit-imageUrl" value="${data.imageUrl || ''}"></label>
        <label>Audio URL: <input type="text" id="edit-audioUrl" value="${data.audioUrl || ''}"></label>
    `;

    createModal('edit-modal', content, () => {
        const newWord = document.getElementById('edit-word').value;
        const updatedData = {
            translation: document.getElementById('edit-translation').value,
            example: document.getElementById('edit-example').value,
            category: document.getElementById('edit-category').value,
            imageUrl: document.getElementById('edit-imageUrl').value,
            audioUrl: document.getElementById('edit-audioUrl').value
        };
        if (newWord !== word) {
            dictionaryStorage.deleteWord(word);
        }
        dictionaryStorage.addWord(newWord, updatedData);

        // Update the card content without reloading the entire list
        const card = document.querySelector(`.card h3[data-word="${word}"]`).parentElement;
        card.innerHTML = `
            <h3 data-word="${newWord}">${newWord}</h3>
            <p><strong>Translation:</strong> ${updatedData.translation}</p>
            <p><strong>Example:</strong> ${updatedData.example}</p>
            <p><strong>Category:</strong> ${updatedData.category}</p>
            ${updatedData.imageUrl ? `<img src="${updatedData.imageUrl}" alt="${newWord}">` : ''}
            ${updatedData.audioUrl ? `<audio controls src="${updatedData.audioUrl}"></audio>` : ''}
            <button onclick="showEditModal('${newWord}', this)">Edit</button>
            <button onclick="showDeleteModal('${newWord}', this)">Delete</button>
            <div class="message">Changes saved</div>
        `;
        setTimeout(() => {
            const message = card.querySelector('.message');
            message.textContent = '';
        }, 3000);

        restoreScrollPosition();
    }, () => {
        // Cancel action
        restoreScrollPosition();
    }, 'Save', 'Cancel', triggerElement);
}

// Function to save the current scroll position
function saveScrollPosition() {
    scrollPosition = window.scrollY;
    history.scrollRestoration = 'manual';
}

// Function to restore the saved scroll position
function restoreScrollPosition() {
    window.scrollTo(0, scrollPosition);
}

// Event handler for listing all words
document.getElementById('list-words').onclick = function() {
    listWords();
};

// Event handler for changing the category filter
document.getElementById('category-filter').onchange = function() {
    const category = this.value;
    listWords(category);
};

// Event handler for adding a new word
document.getElementById('add-word').onclick = function() {
    const word = prompt("Enter the word:");
    if (!word) return;

    const translation = prompt("Enter the translation:");
    const example = prompt("Enter an example sentence:");
    const category = prompt("Enter the category:");
    const imageUrl = prompt("Enter the image URL (optional):");
    const audioUrl = prompt("Enter the audio URL (optional):");

    const data = { translation, example, category, imageUrl, audioUrl };

    const content = `
        <label>Word: <input type="text" id="edit-word" value="${word}"></label>
        <label>Translation: <input type="text" id="edit-translation" value="${translation}"></label>
        <label>Example: <input type="text" id="edit-example" value="${example}"></label>
        <label>Category: <input type="text" id="edit-category" value="${category}"></label>
        <label>Image URL: <input type="text" id="edit-imageUrl" value="${imageUrl || ''}"></label>
        <label>Audio URL: <input type="text" id="edit-audioUrl" value="${audioUrl || ''}"></label>
    `;

    createModal('add-modal', content, () => {
        dictionaryStorage.addWord(word, data);
        listWords(currentCategory);
        updateCategoryFilter();
    }, () => {
        // Cancel action
    }, 'Add', 'Cancel', document.getElementById('add-word'));
};

// Initial load of words and category filter
listWords(currentCategory);
updateCategoryFilter();
