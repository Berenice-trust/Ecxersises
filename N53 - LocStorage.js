class ObjStorageClass {
    constructor(lskey) {
        this.lskey = lskey;
        this.storage = {};
        this.loadChanges();
    }

    saveChanges() {
        localStorage[this.lskey] = JSON.stringify(this.storage);
    }

    loadChanges() {
        if (localStorage[this.lskey]) {
            try {
                this.storage = JSON.parse(localStorage[this.lskey]);
            } catch (er) {
                console.error("Error", er);
            }
        }
    }

    addValue(key, value) {
        this.storage[key] = value;
        this.saveChanges();
    }

    getValue(key) {
        return this.storage[key];
    }

    deleteValue(key) {
        if (this.storage.hasOwnProperty(key)) {
            delete this.storage[key];
            this.saveChanges();
            return true;
        }
        return false;
    }

    getKeys() {
        return Object.keys(this.storage);
    }
}

export { ObjStorageClass };

let coctailsStorage = new ObjStorageClass('coctailsStorage');
let dishesStorage = new ObjStorageClass('dishesStorage');

coctailsStorage.addValue("Маргарита", {
    isAlcoholic: true,
    ingredients: [
        { name: "Водка Finlandia", amount: "50мл" },
        { name: "Кофейный ликер", amount: "25мл" },
        { name: "Лед в кубиках", amount: "120г" }
    ],
    recipe: "Наполни стакан кубиками льда доверху, затем налей кофейный ликер 25 мл, водку 50 мл и размешай коктейльной ложкой."
});

coctailsStorage.addValue("Пеликан", {
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
});

coctailsStorage.addValue("Мохито", {
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
});

coctailsStorage.addValue("Космополитан", {
isAlcoholic: true,
ingredients: [
    { name: "Водка", amount: "45мл" },
    { name: "Клюквенный сок", amount: "30мл" },
    { name: "Ликер Triple Sec", amount: "15мл" },
    { name: "Сок лайма", amount: "15мл" },
    { name: "Лед", amount: "по вкусу" }
],
recipe: "В шейкере смешайте водку, клюквенный сок, ликер Triple Sec и сок лайма. Добавьте лед и хорошо встряхните. Процедите в охлажденный бокал для коктейлей. Украсьте цедрой лайма или вишней."
});

coctailsStorage.addValue("Пина Колада", {
isAlcoholic: true,
ingredients: [
    { name: "Ром", amount: "60мл" },
    { name: "Ананасовый сок", amount: "90мл" },
    { name: "Кокосовое молоко", amount: "30мл" },
    { name: "Лед", amount: "по вкусу" },
    { name: "Ванильное мороженое", amount: "1-2 шарика" }
],
recipe: "В блендере смешайте ром, ананасовый сок, кокосовое молоко и лед. Взбейте до получения однородной массы. Добавьте мороженое и взбейте ещё раз до образовани�� кремовой текстуры. Перелейте в бокал и украсьте кусочком ананаса и вишней."
});

dishesStorage.addValue("Цезарь", {
    ingredients: [
        { name: "Куриное филе", amount: "200г" },
        { name: "Салат Ромэн", amount: "100г" },
        { name: "Пармезан", amount: "50г" },
        { name: "Сухарики", amount: "50г" },
        { name: "Соус Цезарь", amount: "50мл" }
    ],
    recipe: "Обжарьте куриное филе до готовности. Нарежьте салат Ромэн и выложите на тарелку. Добавьте нарезанное куриное филе, сухарики и полейте соусом Цезарь. Посыпьте тертым пармезаном."
});

dishesStorage.addValue("Борщ", {
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
});



