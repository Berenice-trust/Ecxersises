// Class to manage local storage for objects

class ObjStorageClass {
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

    // Add a new key-value to the storage
    addValue(key, value) {
        this.storage[key] = value;
        this.saveChanges(); // Save changes to localStorage
    }

    // get a value by key from the storage
    getValue(key) {
        return this.storage[key];
    }

    // Delete a key-value pair from the storage
    deleteValue(key) {
        if (this.storage.hasOwnProperty(key)) {
            delete this.storage[key];
            this.saveChanges(); // Save changes to localStorage
            return true;
        }
        return false;
    }

    // Get all keys from the storage
    getKeys() {
        return Object.keys(this.storage);
    }
}

export { ObjStorageClass };

// Create instances for storing cocktail and dish recipes
let coctailsStorage = new ObjStorageClass('coctailsStorage');
let dishesStorage = new ObjStorageClass('dishesStorage');

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
initialCocktailRecipes.forEach(recipe => {
    coctailsStorage.addValue(recipe.name, recipe.data);
});

// Add initial dish recipes to the storage
initialDishRecipes.forEach(recipe => {
    dishesStorage.addValue(recipe.name, recipe.data);
});

class AJAXStorage {
    constructor(lskey) {
        this.lskey = lskey;
        this.storage = {};
        this.ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
        this.readFromServer();
    }

    saveToServer() {
        let sp = new URLSearchParams();
        sp.append('f', 'LOCKGET');
        sp.append('n', this.lskey);
        sp.append('p', 'password');

        fetch(this.ajaxHandlerScript, { method: 'post', body: sp })
            .then(response => response.json())
            .then(data => {
                let sp2 = new URLSearchParams();
                sp2.append('f', 'UPDATE');
                sp2.append('n', this.lskey);
                sp2.append('p', 'password');
                sp2.append('v', JSON.stringify(this.storage));

                return fetch(this.ajaxHandlerScript, { method: 'post', body: sp2 });
            })
            .catch(error => console.error(error));
    }

    readFromServer() {
        let sp = new URLSearchParams();
        sp.append('f', 'READ');
        sp.append('n', this.lskey);

        fetch(this.ajaxHandlerScript, { method: 'post', body: sp })
            .then(response => response.json())
            .then(data => {
                if (data.result) {
                    this.storage = JSON.parse(data.result);
                }
            })
            .catch(error => console.error(error));
    }

    addValue(key, value) {
        this.storage[key] = value;
        this.saveToServer();
    }

    getValue(key) {
        return this.storage[key];
    }

    deleteValue(key) {
        if (this.storage.hasOwnProperty(key)) {
            delete this.storage[key];
            this.saveToServer();
            return true;
        }
        return false;
    }

    getKeys() {
        return Object.keys(this.storage);
    }
}

export { AJAXStorage };



