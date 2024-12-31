import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import firebaseConfig from './firebaseConfig.js';

// Initialize Firebase app and database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Class to handle dictionary storage operations with Firebase
export class DictionaryStorage {
    constructor(storageKey) {
        this.storageKey = storageKey; // Key to identify the storage in Firebase
        this.words = {}; // Object to store words and their data
        this.db = db; // Firebase database instance
        this.initializeStorage(); // Initialize storage with data from Firebase
    }

    // Save the current state of words to Firebase
    async save() {
        try {
            await set(ref(this.db, this.storageKey), this.words);
        } catch (error) {
            console.error(`Error saving data to Firebase: ${error}`);
        }
    }

    // Initialize storage by reading data from Firebase
    async initializeStorage() {
        try {
            const snapshot = await get(child(ref(this.db), this.storageKey));
            if (snapshot.exists()) {
                this.words = snapshot.val(); // Load words from Firebase
            } else {
                console.log(`No data available for ${this.storageKey}`);
            }
        } catch (error) {
            console.error(`Error reading data from Firebase: ${error}`);
        }
    }

    // Add a new word to the storage and save to Firebase
    addWord(word, data) {
        this.words[word] = data;
        this.save();
    }

    // Get data for a specific word
    getWord(word) {
        return this.words[word];
    }

    // Get a list of all words
    getWords() {
        return Object.keys(this.words);
    }

    // Get words filtered by category
    getWordsByCategory(category) {
        return Object.keys(this.words).filter(word => this.words[word].category === category);
    }

    // Delete a word from the storage and save to Firebase
    deleteWord(word) {
        if (this.words[word]) {
            delete this.words[word];
            this.save();
            return true;
        }
        return false;
    }

    // Update data for an existing word and save to Firebase
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

// Initial words to populate the dictionary
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
