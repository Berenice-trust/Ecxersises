class DictionaryStorage {
    constructor(lskey) {
        this.lskey = lskey; // Key to identify the storage in localStorage
        this.storage = {}; 
        this.loadChanges(); // Load existing data from localStorage
    }

    // Save the current state of storage to localStorage
    saveChanges() {
        localStorage[this.lskey] = JSON.stringify(this.storage);
    }

    // Load the state of storage from localStorage
    loadChanges() {
        if (localStorage[this.lskey]) {
            try {
                this.storage = JSON.parse(localStorage[this.lskey]);
            } catch (er) {
                console.error("Error in JSON"); // Log any errors during parsing
            }
        }
    }

    // Add a new word to the dictionary
    addWord(word, data) {
        this.storage[word] = data;
        this.saveChanges(); // Save changes to localStorage
    }

    // Get a word's data from the dictionary
    getWord(word) {
        return this.storage[word];
    }

    // Delete a word from the dictionary
    deleteWord(word) {
        if (this.storage.hasOwnProperty(word)) {
            delete this.storage[word];
            this.saveChanges(); // Save changes to localStorage
            return true;
        }
        return false;
    }

    // Get all words from the dictionary
    getWords() {
        return Object.keys(this.storage);
    }

    // Edit a word's data in the dictionary
    editWord(word, newData) {
        if (this.storage.hasOwnProperty(word)) {
            this.storage[word] = newData;
            this.saveChanges(); // Save changes to localStorage
            return true;
        }
        return false;
    }

    // Get words by category
    getWordsByCategory(category) {
        return Object.keys(this.storage).filter(word => this.storage[word].category === category);
    }
}

export { DictionaryStorage };

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
