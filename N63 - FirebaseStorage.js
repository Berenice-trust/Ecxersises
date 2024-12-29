import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import firebaseConfig from './firebaseConfig.js';

// Class to handle storage operations with Firebase
class FirebaseStorage {
    constructor(lskey, db) {
        this.lskey = lskey; // Local storage key
        this.storage = {}; // Local storage object
        this.db = db; // Firebase database instance
        this.initializeStorage(); // Initialize storage with initial data
    }

    // Save data to Firebase
    async saveToFirebase() {
        try {
            await set(ref(this.db, this.lskey), this.storage);
            console.log(`Data saved to Firebase for ${this.lskey}:`, this.storage);
        } catch (error) {
            console.error(`Error during saveToFirebase for ${this.lskey}:`, error);
        }
    }

    // Read data from Firebase
    async readFromFirebase() {
        try {
            const snapshot = await get(child(ref(this.db), this.lskey));
            if (snapshot.exists()) {
                this.storage = snapshot.val();
                console.log(`Data read from Firebase for ${this.lskey}:`, this.storage);
            } else {
                console.log(`No data available for ${this.lskey}`);
            }
        } catch (error) {
            console.error(`Error during readFromFirebase for ${this.lskey}:`, error);
        }
    }

    // Insert data to Firebase
    async insertToFirebase() {
        try {
            await set(ref(this.db, this.lskey), this.storage);
            console.log(`Data inserted to Firebase for ${this.lskey}:`, this.storage);
        } catch (error) {
            console.error(`Error during insertToFirebase for ${this.lskey}:`, error);
        }
    }

    // Add a value to the storage and save to Firebase
    addValue(key, value) {
        this.storage[key] = value;
        this.saveToFirebase();
    }

    // Get a value from the storage
    getValue(key) {
        return this.storage[key];
    }

    // Delete a value from the storage and save to Firebase
    deleteValue(key) {
        if (this.storage.hasOwnProperty(key)) {
            delete this.storage[key];
            this.saveToFirebase();
            return true;
        }
        return false;
    }

    // Get all keys from the storage
    getKeys() {
        return Object.keys(this.storage);
    }

    // Initialize the storage by reading from Firebase and adding initial recipes
    async initializeStorage() {
        await this.readFromFirebase();

        // Initial cocktail recipes
        const initialCocktailRecipes = [
            {
                name: "Маргарита",
                data: {
                    isAlcoholic: true,
                    ingredients: [
                        { name: "Водка Finlandia", amount: "50мл" },
                        { name: "Кофейный ликер", amount: "25мл" },
                        { name: "Лед в кубиках", amount: "120г" }
                    ],
                    recipe: "Наполни стакан кубиками льда доверху, затем налей кофейный ликер 25 мл, водку 50 мл и размешай коктейльной ложкой."
                }
            },
            // ...other cocktail recipes...
        ];

        // Initial dish recipes
        const initialDishRecipes = [
            {
                name: "Борщ",
                data: {
                    ingredients: [
                        { name: "Свекла", amount: "200г" },
                        { name: "Капуста", amount: "300г" },
                        { name: "Картофель", amount: "200г" },
                        { name: "Морковь", amount: "100г" },
                        { name: "Лук", amount: "100г" },
                        { name: "Томатная паста", amount: "50г" },
                        { name: "Говядина", amount: "300г" }
                    ],
                    recipe: "Отварите говядину до готовности. Нарежьте свеклу, капусту, картофель, морковь и лук. Обжарьте лук и морковь, добавьте томатную пасту. В кипящий бульон добавьте картофель, капусту и свеклу. Варите до готовности. Добавьте обжаренные лук и морковь. Варите еще 10 минут."
                }
            },
            // ...other dish recipes...
        ];

        // Add initial cocktail recipes to the storage
        if (this.lskey === 'Zhytnik_Drinks_CoctailsStorage') {
            for (let recipe of initialCocktailRecipes) {
                if (!this.storage[recipe.name]) {
                    this.addValue(recipe.name, recipe.data);
                }
            }
        }

        // Add initial dish recipes to the storage
        if (this.lskey === 'Zhytnik_Drinks_DishesStorage') {
            for (let recipe of initialDishRecipes) {
                if (!this.storage[recipe.name]) {
                    this.addValue(recipe.name, recipe.data);
                }
            }
        }

        // Insert to Firebase if storage is empty
        if (Object.keys(this.storage).length === 0) {
            this.insertToFirebase();
        }
    }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { FirebaseStorage, db };
