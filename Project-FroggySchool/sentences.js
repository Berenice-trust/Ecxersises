import { DictionaryStorage } from './dictionaryStorage.js';

const dictionaryStorage = new DictionaryStorage('dictionaryStorage');
let sentences = [];
let currentIndex = 0;
let correctOrder = [];

document.addEventListener('DOMContentLoaded', () => {
    const startGameButton = document.getElementById('start-game');
    startGameButton.addEventListener('click', startGame);
});

async function startGame() {
    const startGameButton = document.getElementById('start-game');
    startGameButton.textContent = 'Restart Game';

    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = ''; // Clear the game container
    gameContainer.style.transition = 'height 2s ease, opacity 2s ease';
    gameContainer.style.height = 'auto';
    gameContainer.style.opacity = '1';

    await loadSentences();
    currentIndex = 0;
    showNextSentence();
}

async function loadSentences() {
    const category = document.getElementById('category-filter').value;
    const words = category ? dictionaryStorage.getWordsByCategory(category) : dictionaryStorage.getWords();
    sentences = words.map(word => {
        const data = dictionaryStorage.getWord(word);
        return {
            example: data.example,
            exampleTranslation: data.exampleTranslation || ''
        };
    }).filter(sentence => sentence.example);
}

function showNextSentence() {
    const gameContainer = document.getElementById('game-container');

    if (sentences.length === 0) {
        gameContainer.innerHTML = '<p>No valid sentences available for the selected category. Please choose another category.</p>';
        return;
    }

    if (currentIndex >= sentences.length) {
        gameContainer.innerHTML = '<p>Поздравляю, вы все прошли!</p><button id="reset-game">Reset</button>';
        document.getElementById('reset-game').addEventListener('click', startGame);
        return;
    }

    const sentenceData = sentences[currentIndex];
    const words = sentenceData.example.split(' ').map((text, index) => ({ order: (index + 1).toString(), text }));
    correctOrder = words.map(word => word.order);

    const shuffledWords = words.sort(() => Math.random() - 0.5);
    const sentence = createSentence(shuffledWords);

    gameContainer.innerHTML = `
        <h3>Please, drag the words and put them in the correct order</h3>
        ${sentenceData.exampleTranslation ? `<p>Translation: ${sentenceData.exampleTranslation}</p>` : ''}
        <div id="word-container" class="word-container">${sentence}</div>
        <div class="game-buttons">
            <button id="check-sentence" class="btn-check">Check Sentence</button>
            <button id="next-sentence" class="next-sentence" disabled>Next Sentence</button>
        </div>
        <div id="messages" class="messages"></div>
    `;

    addDragAndDropHandlers();
    document.getElementById('check-sentence').addEventListener('click', checkOrder);
    document.getElementById('next-sentence').addEventListener('click', () => {
        currentIndex++;
        showNextSentence();
    });
}

function createSentence(words) {
    return words.map(word => `<div class="word-item" draggable="true" data-order="${word.order}">${word.text}</div>`).join('');
}

function addDragAndDropHandlers() {
    const wordContainer = document.getElementById('word-container');
    const wordItems = Array.from(document.querySelectorAll('.word-item'));
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

    wordContainer.addEventListener('dragover', function(event) {
        event.preventDefault();
        const afterElement = getDragAfterElement(wordContainer, event.clientX);
        if (afterElement == null) {
            wordContainer.appendChild(draggedItem);
        } else {
            wordContainer.insertBefore(draggedItem, afterElement);
        }
    });
}

function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.word-item:not(.dragging)')];

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

function checkOrder() {
    const wordContainer = document.getElementById('word-container');
    const items = wordContainer.querySelectorAll('.word-item');
    let isCorrect = true;

    items.forEach((item, index) => {
        if (item.getAttribute('data-order') === correctOrder[index]) {
            item.classList.add('correct');
            item.classList.remove('incorrect');
        } else {
            item.classList.add('incorrect');
            item.classList.remove('correct');
            isCorrect = false;
        }
    });

    if (isCorrect) {
        document.getElementById('next-sentence').disabled = false;
    }

    addMessage(isCorrect ? 'Correct order!' : 'Incorrect order. Try again.');
}

function addMessage(text) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = text;
    messageDiv.classList.add('message', text.includes('Correct') ? 'correct' : 'incorrect');
    messagesDiv.prepend(messageDiv);

    if (messagesDiv.children.length > 6) {
        messagesDiv.lastElementChild.remove();
    }
}
