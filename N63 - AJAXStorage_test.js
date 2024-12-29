import { getDatabase, ref, set, get, child, remove } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";

class AJAXStorage {
    constructor(lskey, db) {
        this.lskey = lskey;
        this.storage = {};
        this.db = db;
        this.initializeStorage();
    }

    async saveToFirebase() {
        try {
            await set(ref(this.db, this.lskey), this.storage);
            console.log(`Data saved to Firebase for ${this.lskey}:`, this.storage);
        } catch (error) {
            console.error(`Error during saveToFirebase for ${this.lskey}:`, error);
        }
    }

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

    async insertToFirebase() {
        try {
            await set(ref(this.db, this.lskey), this.storage);
            console.log(`Data inserted to Firebase for ${this.lskey}:`, this.storage);
        } catch (error) {
            console.error(`Error during insertToFirebase for ${this.lskey}:`, error);
        }
    }

    addValue(key, value) {
        this.storage[key] = value;
        this.saveToFirebase();
    }

    getValue(key) {
        return this.storage[key];
    }

    deleteValue(key) {
        if (this.storage.hasOwnProperty(key)) {
            delete this.storage[key];
            this.saveToFirebase();
            return true;
        }
        return false;
    }

    getKeys() {
        return Object.keys(this.storage);
    }

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
            {
                name: "Пеликан",
                data: {
                    isAlcoholic: false,
                    ingredients: [
                        { name: "Гренадин Monin", amount: "10мл" },
                        { name: "Клубничный сироп Monin", amount: "10мл" },
                        { name: "Персиковый сок", amount: "150мл" },
                        { name: "Лимонный сок", amount: "15мл" },
                        { name: "Банан", amount: "110г" },
                        { name: "Клубника", amount: "50г" },
                        { name: "Дробленый лед", amount: "60г" }
                    ],
                    recipe: "Положи в блендер очищенную и нарезанную половинку банана и клубнику 2 ягоды. Налей лимонный сок 15 мл, гренадин 10 мл, клубничный сироп 10 мл и персиковый сок 150 мл. Добавь в блендер совок дробленого льда и взбей. Перелей в хайбол. Укрась кружком банана и половинкой клубники на коктейльной шпажке."
                }
            },
            {
                name: "Мохито",
                data: {
                    isAlcoholic: true,
                    ingredients: [
                        { name: "Ром", amount: "50мл" },
                        { name: "Лайм", amount: "1 шт." },
                        { name: "Мелисса (мелисса)", amount: "10 листочков" },
                        { name: "Сахар", amount: "2 чайные ложки" },
                        { name: "Сода", amount: "150мл" },
                        { name: "Лед в кубиках", amount: "по вкусу" }
                    ],
                    recipe: "Разрежьте лайм и выжмите сок. Добавьте сахар и разомните вместе с лаймом. Положите листья мелиссы и слегка помните их. Добавьте ром и лед. Залейте содовой и перемешайте. Подавайте с соломинкой."
                }
            },
            {
                name: "Космополитан",
                data: {
                    isAlcoholic: true,
                    ingredients: [
                        { name: "Водка", amount: "45мл" },
                        { name: "Клюквенный сок", amount: "30мл" },
                        { name: "Ликер Triple Sec", amount: "15мл" },
                        { name: "Сок лайма", amount: "15мл" },
                        { name: "Лед", amount: "по вкусу" }
                    ],
                    recipe: "В шейкере смешайте водку, клюквенный сок, ликер Triple Sec и сок лайма. Добавьте лед и хорошо встряхните. Процедите в охлажденный бокал для коктейлей. Украсьте цедрой лайма или вишней."
                }
            },
            {
                name: "Пина Колада",
                data: {
                    isAlcoholic: true,
                    ingredients: [
                        { name: "Ром", amount: "60мл" },
                        { name: "Ананасовый сок", amount: "90мл" },
                        { name: "Кокосовое молоко", amount: "30мл" },
                        { name: "Лед", amount: "по вкусу" },
                        { name: "Ванильное мороженое", amount: "1-2 шарика" }
                    ],
                    recipe: "В блендере смешайте ром, ананасовый сок, кокосовое молоко и лед. Взбейте до получения однородной массы. Добавьте мороженое и взбейте ещё раз до образования кремовой текстуры. Перелейте в бокал и украсьте кусочком ананаса и вишней."
                }
            }
        ];

        // Initial dish recipes
        const initialDishRecipes = [
            {
                name: "Цезарь",
                data: {
                    ingredients: [
                        { name: "Куриное филе", amount: "200г" },
                        { name: "Салат Ромэн", amount: "100г" },
                        { name: "Пармезан", amount: "50г" },
                        { name: "Сухарики", amount: "50г" },
                        { name: "Соус Цезарь", amount: "50мл" }
                    ],
                    recipe: "Обжарьте куриное филе до готовности. Нарежьте салат Ромэн и выложите на тарелку. Добавьте нарезанное куриное филе, сухарики и полейте соусом Цезарь. Посыпьте тертым пармезаном."
                }
            },
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
            {
                name: "Профитроли",
                data: {
                    ingredients: [
                        { name: "Молоко", amount: "250мл" },
                        { name: "Масло сливочное", amount: "100г" },
                        { name: "Мука", amount: "150г" },
                        { name: "Яйца", amount: "4 шт." },
                        { name: "Соль", amount: "щепотка" }
                    ],
                    recipe: "Вскипятите воду с маслом и солью. Добавьте муку и быстро размешайте до однородной массы. Остудите и вбейте яйца по одному, тщательно перемешивая. Выпекайте при 200°C до золотистого цвета."
                }
            }
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
const firebaseConfig = {
    apiKey: "AIzaSyCOmcuVCOLAyLPvQkn52t51j0P-vx6dLXQ",
            authDomain: "coctails-2e469.firebaseapp.com",
            databaseURL: "https://coctails-2e469-default-rtdb.firebaseio.com",
            projectId: "coctails-2e469",
            storageBucket: "coctails-2e469.appspot.com",
            messagingSenderId: "647084187818",
            appId: "1:647084187818:web:968579f3b6b234d510b0d3",
            measurementId: "G-EGDP5H3VRN"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { AJAXStorage, db };
