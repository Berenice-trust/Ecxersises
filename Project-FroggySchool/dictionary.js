import { DictionaryStorage } from './dictionaryStorage.js';
import { createModal } from './modal.js';

const dictionaryStorage = new DictionaryStorage('dictionaryStorage');
let wordToDelete = '';
let currentCategory = localStorage.getItem('currentCategory') || '';
let scrollPosition = 0;

function updateOutput(content, outputSelector) {
    let output = document.querySelector(outputSelector);
    output.innerHTML = content;

    if (content.trim()) {
        output.classList.add('show');
    } else {
        output.classList.remove('show');
    }
}

function updateList(items, listSelector) {
    let listContainer = document.querySelector(listSelector);
    let list = listContainer.querySelector('ul');

    list.innerHTML = items.map(function(item) {
        return `<li>${item}</li>`;
    }).join('');

    listContainer.classList.add('show');
}

function listWords(category = '') {
    currentCategory = category;
    localStorage.setItem('currentCategory', currentCategory);
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
            <button onclick="showEditModal('${word}')">Edit</button>
            <button onclick="showDeleteModal('${word}')">Delete</button>
            <div class="message"></div>
        `;
        wordList.appendChild(card);
    });

    document.querySelector('.word-list').classList.add('show');
    updateCategoryFilter();
}

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

window.showDeleteModal = function(word) {
    wordToDelete = word;
    const content = `
        <p>Are you sure you want to delete this word?</p>
    `;
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
    }, 'Yes', 'No');
};

window.showEditModal = function(word) {
    scrollPosition = window.scrollY; // Save the current scroll position
    history.scrollRestoration = 'manual'; // Disable automatic scroll restoration
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
            <button onclick="showEditModal('${newWord}')">Edit</button>
            <button onclick="showDeleteModal('${newWord}')">Delete</button>
            <div class="message">Changes saved</div>
        `;
        setTimeout(() => {
            const message = card.querySelector('.message');
            message.textContent = '';
        }, 3000);

        window.scrollTo(0, scrollPosition); // Restore the scroll position
    }, () => {
        // Cancel action
        window.scrollTo(0, scrollPosition); // Restore the scroll position
    }, 'Save', 'Cancel');
}

document.getElementById('list-words').onclick = function() {
    listWords();
};

document.getElementById('category-filter').onchange = function() {
    const category = this.value;
    listWords(category);
};

document.getElementById('add-word').onclick = function() {
    const word = prompt("Enter the word:");
    if (!word) return;

    const translation = prompt("Enter the translation:");
    const example = prompt("Enter an example sentence:");
    const category = prompt("Enter the category:");
    const imageUrl = prompt("Enter the image URL (optional):");
    const audioUrl = prompt("Enter the audio URL (optional):");

    const data = { translation, example, category, imageUrl, audioUrl };

    dictionaryStorage.addWord(word, data);
    listWords(currentCategory);
    updateCategoryFilter();
};

// Initial load
listWords(currentCategory);
updateCategoryFilter();
