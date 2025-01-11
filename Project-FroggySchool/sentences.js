import { DictionaryStorage } from './dictionaryStorage.js';

const dictionaryStorage = new DictionaryStorage('dictionaryStorage');
let completedSentences = new Set();
let currentWords = [];

document.addEventListener('DOMContentLoaded', () => {
    const startGameButton = document.getElementById('start-game');
    startGameButton.addEventListener('click', startGame);
});

async function startGame() {
    const startGameButton = document.getElementById('start-game');
    startGameButton.style.display = 'none';

    const gameContainer = document.getElementById('game-container');
    gameContainer.style.transition = 'height 2s ease, opacity 2s ease';
    gameContainer.style.height = 'auto';
    gameContainer.style.opacity = '1';

    await loadWords();
    loadNextSentence();
}

async function loadWords() {
    const category = document.getElementById('category-filter').value;
    currentWords = category ? dictionaryStorage.getWordsByCategory(category) : dictionaryStorage.getWords();
}

async function loadNextSentence() {
    const gameContainer = document.getElementById('game-container');

    if (currentWords.length > 0) {
        let word;
        let data;
        let example;
        let exampleTranslation;
        do {
            word = currentWords[Math.floor(Math.random() * currentWords.length)];
            data = dictionaryStorage.getWord(word);
            example = data.example;
            exampleTranslation = data.exampleTranslation;
        } while (completedSentences.has(example) && completedSentences.size < currentWords.length);

        const shuffledWords = shuffleArray(example.split(' '));
        const sentence = createSentence(shuffledWords);

        gameContainer.innerHTML = `
            <h3>Assemble the Sentence</h3>
            <p>Translation: ${exampleTranslation}</p>
            <div id="sentence-container" class="sentence-container">${sentence}</div>
            <div class="game-buttons">
                <button id="check-sentence">Check Sentence</button>
                <button id="next-sentence" class="next-sentence">Next Sentence</button>
            </div>
            <div id="result" class="result"></div>
        `;

        const checkSentenceButton = document.getElementById('check-sentence');
        checkSentenceButton.addEventListener('click', () => checkSentence(example));

        const nextSentenceButton = document.getElementById('next-sentence');
        nextSentenceButton.addEventListener('click', loadNextSentence);

        addDragAndDropHandlers();
    } else {
        gameContainer.innerHTML = '<p>No words available for the selected category.</p>';
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createSentence(words) {
    return words.map(word => `<span class="draggable-word" draggable="true">${word}</span>`).join(' ');
}

function addDragAndDropHandlers() {
    const wordItems = Array.from(document.querySelectorAll('.draggable-word'));
    let draggedItem = null;

    wordItems.forEach(item => {
        item.addEventListener('dragstart', function(event) {
            draggedItem = event.target;
            draggedItem.classList.add('dragging');
        });

        item.addEventListener('dragend', function() {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        });
    });

    const sentenceContainer = document.getElementById('sentence-container');
    sentenceContainer.addEventListener('dragover', function(event) {
        event.preventDefault();
        const afterElement = getDragAfterElement(sentenceContainer, event.clientX);
        if (afterElement == null) {
            sentenceContainer.appendChild(draggedItem);
        } else {
            sentenceContainer.insertBefore(draggedItem, afterElement);
        }
    });
}

function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.draggable-word:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function checkSentence(correctSentence) {
    const sentenceContainer = document.getElementById('sentence-container');
    const words = Array.from(sentenceContainer.children).map(wordElement => wordElement.textContent).join(' ');
    const resultContainer = document.getElementById('result');

    if (words === correctSentence) {
        resultContainer.textContent = 'Correct!';
        resultContainer.classList.add('correct');
        resultContainer.classList.remove('incorrect');
        completedSentences.add(correctSentence);
    } else {
        resultContainer.textContent = 'Incorrect. Try again.';
        resultContainer.classList.add('incorrect');
        resultContainer.classList.remove('correct');
    }
}
