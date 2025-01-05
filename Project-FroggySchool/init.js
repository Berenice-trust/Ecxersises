import { dictionaryStorage } from './dictionaryStorage.js';
import { listWords, updateCategoryFilter } from './dictionary.js';

document.addEventListener('DOMContentLoaded', async () => {
    await dictionaryStorage.initializeStorage(); // Ensure storage is initialized
    const savedCategory = sessionStorage.getItem('currentCategory');
    if (savedCategory) {
        document.getElementById('category-filter').value = savedCategory;
        listWords(savedCategory); // Display filtered words when the page loads
    } else {
        listWords(''); // Display all words when the page loads
    }
    updateCategoryFilter();
});


