import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import firebaseConfig from './firebaseConfig.js';
import { fileToBase64 } from './fileUtils.js';

// Initialize Firebase app and database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Class to handle dictionary storage operations with Firebase
export class DictionaryStorage {
    constructor() {
        this.username = localStorage.getItem('username');
        this.words = {}; // Object to store words and their data
        this.db = db; // Firebase database instance
        this.initializeStorage(); // Initialize storage with data from Firebase
    }

    // Save the current state of words to Firebase
    async save() {
        if (!this.username) {
            console.error('User is not authenticated');
            return;
        }
        try {
            await set(ref(this.db, `dictionaryStorage_${this.username}`), this.words);
        } catch (error) {
            console.error(`Error saving data to Firebase: ${error}`);
        }
    }

    // Initialize storage by reading data from Firebase
    async initializeStorage() {
        if (!this.username) {
            console.error('User is not authenticated');
            return;
        }
        try {
            const snapshot = await get(child(ref(this.db), `dictionaryStorage_${this.username}`));
            if (snapshot.exists()) {
                this.words = snapshot.val(); // Load words from Firebase
            } else {
                console.log(`No data available for dictionaryStorage_${this.username}`);
            }
            const loadingMessage = document.getElementById('loading-message');
            if (loadingMessage) {
                loadingMessage.style.display = 'none'; // Hide loading message
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
        // Hide loading message after words are loaded
        // document.getElementById('loading-message').style.display = 'none'; // Commented out to avoid error

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

    // Save audio data for a specific word to Firebase
    async saveAudio(word, file) {
        if (!this.username) {
            console.error('User is not authenticated');
            return null;
        }
        try {
            if (!(file instanceof Blob)) {
                throw new TypeError("Argument must be an instance of Blob");
            }
            const base64String = await fileToBase64(file);
            const audioRef = ref(this.db, `dictionaryStorage_${this.username}/${word}/audioUrl`);
            await set(audioRef, base64String);
            console.log('Audio file saved to Firebase Database');
            return base64String;
        } catch (error) {
            console.error('Error saving audio data to Firebase Database:', error);
            return null;
        }
    }

    // Load audio data for a specific word from Firebase
    async loadAudio(word) {
        if (!this.username) {
            console.error('User is not authenticated');
            return null;
        }
        try {
            const audioRef = ref(this.db, `dictionaryStorage_${this.username}/${word}/audioUrl`);
            const snapshot = await get(audioRef);
            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                console.log('Audio file not found in Firebase Database');
                return null;
            }
        } catch (error) {
            console.error('Error loading audio data from Firebase Database:', error);
            return null;
        }
    }

    // Delete audio data for a specific word from Firebase
    async deleteAudio(word) {
        if (!this.username) {
            console.error('User is not authenticated');
            return null;
        }
        try {
            const audioRef = ref(this.db, `dictionaryStorage_${this.username}/${word}/audioUrl`);
            await set(audioRef, null);
            console.log('Audio file deleted from Firebase Database');
            return true;
        } catch (error) {
            console.error('Error deleting audio data from Firebase Database:', error);
            return false;
        }
    }
}

// Экспортируем экземпляр для использования в других файлах
export const dictionaryStorage = new DictionaryStorage();

