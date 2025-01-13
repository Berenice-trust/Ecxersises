import { DictionaryStorage } from './dictionaryStorage.js';

const dictionaryStorage = new DictionaryStorage('dictionaryStorage');
let words = [];
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const startGameButton = document.getElementById('start-game');
    startGameButton.addEventListener('click', startGame);

    document.addEventListener('keydown', handleKeyPress);

    // Show loading message initially
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.style.display = 'block';
    startGameButton.disabled = true; // Disable the start game button initially

    await dictionaryStorage.initializeStorage(); // Wait for storage initialization
    loadWords(); // Load words when the page is loaded
});

async function startGame() {
    const startGameButton = document.getElementById('start-game');
    startGameButton.textContent = 'Restart Game';

    const gameContainer = document.getElementById('game-container');
    gameContainer.style.transition = 'height 0.5s ease, width 0.5s ease';
    gameContainer.style.height = '470px'; // Adjust the height
    gameContainer.style.width = '500px'; // Adjust the width

    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = ''; // Clear the card container
    cardContainer.style.transition = 'height 0.5s ease, width 0.5s ease';
    cardContainer.style.height = '400px'; // Adjust the height
    cardContainer.style.width = '350px'; // Adjust the width
    cardContainer.style.margin = '0 auto'; // Center the container
    cardContainer.style.opacity = '1';

    const gameContainerText = document.getElementById('game-container-text');
    gameContainerText.textContent = 'Do you know the translation of this word?';

    currentIndex = 0;
    showNextCard();
}

async function loadWords() {
    const category = document.getElementById('category-filter').value;
    const wordList = category ? dictionaryStorage.getWordsByCategory(category) : dictionaryStorage.getWords();
    words = wordList.map(word => {
        const data = dictionaryStorage.getWord(word);
        return {
            word: word,
            translation: data.translation || '',
            example: data.example || '',
            exampleTranslation: data.exampleTranslation || '',
            imageUrl: data.imageUrl || '',
            known: false
        };
    }).filter(word => word.word);

    // Show start game button if words are loaded
    const loadingMessage = document.getElementById('loading-message');
    const startGameButton = document.getElementById('start-game');
    if (words.length > 0) {
        startGameButton.disabled = false; // Enable the start game button
        startGameButton.style.display = 'block'; // Ensure the button is visible
        if (loadingMessage) {
            loadingMessage.style.display = 'none'; // Hide loading message
        }
    } else {
        document.getElementById('game-container-text').textContent = 'No words available for the selected category.';
    }
}

function showNextCard() {
    const cardContainer = document.getElementById('card-container');

    if (words.length === 0) {
        cardContainer.innerHTML = '<p>No valid words available for the selected category. Please choose another category.</p>';
        document.getElementById('know-word').style.display = 'none';
        document.getElementById('dont-know-word').style.display = 'none';
        return;
    }

    if (currentIndex >= words.length) {
        currentIndex = 0;
    }

    const wordData = words[currentIndex];
    const nextWordData = words[(currentIndex + 1) % words.length];

    cardContainer.innerHTML = `
        <div class="card current-card">
            ${wordData.imageUrl ? `<img src="${wordData.imageUrl}" alt="${wordData.word}" class="card-image">` : ''}
            <p>Translation: ${wordData.translation}</p>
            ${wordData.exampleTranslation ? `<p>Example Translation: ${wordData.exampleTranslation}</p>` : ''}
        </div>
        <div class="card next-card">
            ${nextWordData.imageUrl ? `<img src="${nextWordData.imageUrl}" alt="${nextWordData.word}" class="card-image">` : ''}
            <p>Translation: ${nextWordData.translation}</p>
            ${nextWordData.exampleTranslation ? `<p>Example Translation: ${nextWordData.exampleTranslation}</p>` : ''}
        </div>
    `;

    const currentCard = cardContainer.querySelector('.current-card');
    currentCard.addEventListener('click', () => {
        currentCard.innerHTML = `
            ${wordData.imageUrl ? `<img src="${wordData.imageUrl}" alt="${wordData.word}" class="card-image">` : ''}
            <p>Word: ${wordData.word}</p>
            <p>Translation: ${wordData.translation}</p>
            ${wordData.example ? `<p>Example: ${wordData.example}</p>` : ''}
            ${wordData.exampleTranslation ? `<p>Example Translation: ${wordData.exampleTranslation}</p>` : ''}
        `;
    });

    document.getElementById('know-word').style.display = 'inline-block';
    document.getElementById('dont-know-word').style.display = 'inline-block';

    document.getElementById('know-word').onclick = () => handleSwipe('left');
    document.getElementById('dont-know-word').onclick = () => handleSwipe('right');
}

function handleSwipe(direction) {
    const currentCard = document.querySelector('.current-card');
    if (!currentCard) return;
    currentCard.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    currentCard.style.transform = direction === 'right' ? 'translateX(100%)' : 'translateX(-100%)';
    currentCard.style.opacity = '0';

    currentCard.addEventListener('transitionend', () => {
        if (direction === 'right') {
            handleDontKnowWord();
        } else {
            handleKnowWord();
        }
    }, { once: true });
}

function handleKnowWord() {
    if (currentIndex < words.length) {
        words[currentIndex].known = true;
        words = words.filter(word => !word.known);
    }
    const cardContainer = document.getElementById('card-container');
    if (words.length === 0) {
        cardContainer.innerHTML = '<p>Congratulations, you have reviewed all words!</p>';
        document.getElementById('know-word').style.display = 'none';
        document.getElementById('dont-know-word').style.display = 'none';
    } else {
        currentIndex++;
        showNextCard();
    }
}

function handleDontKnowWord() {
    const word = words.splice(currentIndex, 1)[0];
    words.push(word);
    currentIndex++;
    showNextCard();
}

function handleKeyPress(event) {
    if (words.length === 0) return;
    if (event.key === 'ArrowLeft') {
        handleSwipe('left');
    } else if (event.key === 'ArrowRight') {
        handleSwipe('right');
    }
}
