export class DictionaryStorage {
    constructor(storageKey) {
        this.storageKey = storageKey;
        this.words = JSON.parse(localStorage.getItem(this.storageKey)) || {};
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.words));
    }

    addWord(word, data) {
        this.words[word] = data;
        this.save();
    }

    getWord(word) {
        return this.words[word];
    }

    getWords() {
        return Object.keys(this.words);
    }

    getWordsByCategory(category) {
        return Object.keys(this.words).filter(word => this.words[word].category === category);
    }

    deleteWord(word) {
        if (this.words[word]) {
            delete this.words[word];
            this.save();
            return true;
        }
        return false;
    }

    updateWord(word, data) {
        if (this.words[word]) {
            this.words[word] = data;
            this.save();
            return true;
        }
        return false;
    }
}

// Create an instance for the dictionary
const dictionaryStorage = new DictionaryStorage('dictionaryStorage');

// Initial words
const initialWords = [
    {
        word: "apple",
        data: {
            translation: "яблоко",
            example: "I eat an apple every day.",
            category: "Fruits",
            imageUrl: "https://example.com/apple.jpg",
            audioUrl: "https://example.com/apple.mp3"
        }
    },
    {
        word: "banana",
        data: {
            translation: "банан",
            example: "Bananas are yellow.",
            category: "Fruits",
            imageUrl: "https://example.com/banana.jpg",
            audioUrl: "https://example.com/banana.mp3"
        }
    },
    {
        word: "car",
        data: {
            translation: "машина",
            example: "I drive a car.",
            category: "Vehicles",
            imageUrl: "https://example.com/car.jpg",
            audioUrl: "https://example.com/car.mp3"
        }
    },
    {
        word: "bicycle",
        data: {
            translation: "велосипед",
            example: "I ride a bicycle.",
            category: "Vehicles",
            imageUrl: "https://example.com/bicycle.jpg",
            audioUrl: "https://example.com/bicycle.mp3"
        }
    },
    {
        word: "dog",
        data: {
            translation: "собака",
            example: "The dog is barking.",
            category: "Animals",
            imageUrl: "https://example.com/dog.jpg",
            audioUrl: "https://example.com/dog.mp3"
        }
    },
    {
        word: "cat",
        data: {
            translation: "кошка",
            example: "The cat is sleeping.",
            category: "Animals",
            imageUrl: "https://example.com/cat.jpg",
            audioUrl: "https://example.com/cat.mp3"
        }
    }
];

// Add initial words to the dictionary
initialWords.forEach(item => {
    dictionaryStorage.addWord(item.word, item.data);
});
