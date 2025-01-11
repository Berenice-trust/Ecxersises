import { DictionaryStorage } from './dictionaryStorage.js';

const dictionaryStorage = new DictionaryStorage('dictionaryStorage');

export async function displayAllWords(category = '') {
    await dictionaryStorage.initializeStorage();
    const words = category ? dictionaryStorage.getWordsByCategory(category) : dictionaryStorage.getWords();
    const wordList = document.getElementById('word-list');
    if (words.length > 0) {
        wordList.innerHTML = `<ul>${words.map(word => `<li>${word}</li>`).join('')}</ul>`;
        wordList.innerHTML += '<button id="hide-word-list">Hide List</button>';
        document.getElementById('hide-word-list').addEventListener('click', () => {
            collapseElement(document.getElementById('word-list-container'));
            document.getElementById('toggle-word-list').textContent = 'Show List';
        });
    } else {
        wordList.innerHTML = '<p>No words found in the database.</p>';
    }
}

export async function updateCategoryFilter() {
    await dictionaryStorage.initializeStorage();
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

export function initializeWordSelector() {
    document.addEventListener('DOMContentLoaded', () => {
        updateCategoryFilter();
        displayAllWords();

        document.getElementById('category-filter').onchange = function() {
            const category = this.value;
            displayAllWords(category);
        };

        const toggleButton = document.getElementById('toggle-word-list');
        toggleButton.addEventListener('click', () => {
            const wordListContainer = document.getElementById('word-list-container');
            if (wordListContainer.style.height === '0px' || wordListContainer.style.height === '') {
                expandElement(wordListContainer);
                toggleButton.textContent = 'Hide List';
            } else {
                collapseElement(wordListContainer);
                toggleButton.textContent = 'Show List';
            }
        });

        const scrollToTopButton = document.getElementById('scroll-to-top');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopButton.classList.add('show');
            } else {
                scrollToTopButton.classList.remove('show');
            }
        });

        scrollToTopButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
}

function expandElement(element) {
    element.style.position = 'absolute';
    element.style.visibility = 'hidden';
    element.style.height = 'auto';
    const targetHeight = element.offsetHeight;
    element.style.height = '0px';
    element.style.position = '';
    element.style.visibility = '';
    setTimeout(() => {
        element.style.height = targetHeight + 'px';
    }, 0);
}

function collapseElement(element) {
    element.style.height = '0px';
}
