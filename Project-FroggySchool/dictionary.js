import { DictionaryStorage } from './dictionaryStorage.js';

const dictionaryStorage = new DictionaryStorage('dictionaryStorage');
let wordToDelete = '';
let currentCategory = '';
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
            <button onclick="editWord('${word}')">Edit</button>
            <button onclick="showDeleteModal('${word}')">Delete</button>
            <div class="message"></div>
        `;
        wordList.appendChild(card);
    });

    document.querySelector('.word-list').classList.add('show');
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
}

window.editWord = function(word) {
    scrollPosition = window.scrollY;
    const data = dictionaryStorage.getWord(word);
    document.getElementById('edit-word-name').value = word;
    document.getElementById('edit-word').value = word;
    document.getElementById('edit-translation').value = data.translation;
    document.getElementById('edit-example').value = data.example;
    document.getElementById('edit-category').value = data.category;
    document.getElementById('edit-imageUrl').value = data.imageUrl;
    document.getElementById('edit-audioUrl').value = data.audioUrl;

    const card = document.querySelector(`.card h3[data-word="${word}"]`).parentElement;
    card.classList.add('expanded');
    setTimeout(() => {
        document.getElementById('edit-modal').style.display = 'flex';
    }, 300);
};

document.getElementById('cancel-edit').onclick = function() {
    document.getElementById('edit-modal').style.display = 'none';
    const word = document.getElementById('edit-word-name').value;
    const card = document.querySelector(`.card h3[data-word="${word}"]`).parentElement;
    card.classList.remove('expanded');
    window.scrollTo(0, scrollPosition);
};

document.getElementById('edit-form').onsubmit = function(event) {
    event.preventDefault();

    const oldWord = document.getElementById('edit-word-name').value;
    const newWord = document.getElementById('edit-word').value;
    const translation = document.getElementById('edit-translation').value;
    const example = document.getElementById('edit-example').value;
    const category = document.getElementById('edit-category').value;
    const imageUrl = document.getElementById('edit-imageUrl').value;
    const audioUrl = document.getElementById('edit-audioUrl').value;

    const data = { translation, example, category, imageUrl, audioUrl };

    if (oldWord !== newWord) {
        dictionaryStorage.deleteWord(oldWord);
    }
    dictionaryStorage.addWord(newWord, data);

    const card = document.querySelector(`.card h3[data-word="${oldWord}"]`).parentElement;
    card.querySelector('h3').textContent = newWord;
    card.querySelector('h3').dataset.word = newWord;
    card.querySelector('p strong').nextSibling.textContent = ` ${data.translation}`;
    card.querySelector('p strong').nextSibling.nextSibling.nextSibling.textContent = ` ${data.example}`;
    card.querySelector('p strong').nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.textContent = ` ${data.category}`;
    if (data.imageUrl) {
        if (card.querySelector('img')) {
            card.querySelector('img').src = data.imageUrl;
        } else {
            card.querySelector('p strong').nextSibling.nextSibling.nextSibling.nextSibling.insertAdjacentHTML('afterend', `<img src="${data.imageUrl}" alt="${newWord}">`);
        }
    } else {
        if (card.querySelector('img')) {
            card.querySelector('img').remove();
        }
    }
    if (data.audioUrl) {
        if (card.querySelector('audio')) {
            card.querySelector('audio').src = data.audioUrl;
        } else {
            card.querySelector('p strong').nextSibling.nextSibling.nextSibling.nextSibling.insertAdjacentHTML('afterend', `<audio controls src="${data.audioUrl}"></audio>`);
        }
    } else {
        if (card.querySelector('audio')) {
            card.querySelector('audio').remove();
        }
    }

    const message = card.querySelector('.message');
    message.textContent = 'Word updated.';
    setTimeout(() => {
        message.textContent = '';
    }, 3000);

    document.getElementById('edit-modal').style.display = 'none';
    card.classList.remove('expanded');
    window.scrollTo(0, scrollPosition);
};

document.getElementById('save-edit').onclick = function() {
    document.getElementById('edit-form').submit();
};

window.showDeleteModal = function(word) {
    wordToDelete = word;
    document.getElementById('delete-modal').style.display = 'flex';
};

document.getElementById('confirm-delete').onclick = function() {
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
    document.getElementById('delete-modal').style.display = 'none';
    updateCategoryFilter();
};

document.getElementById('cancel-delete').onclick = function() {
    document.getElementById('delete-modal').style.display = 'none';
};

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
listWords();
updateCategoryFilter();
