import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import firebaseConfig from './firebaseConfig.js';
import { dictionaryStorage } from './dictionaryStorage.js';
import { fileToBase64 } from './fileUtils.js'; // Импортируем функцию из fileUtils.js

// Инициализируем Firebase и базу данных
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Функция для создания модального окна
export function createModal(modalId, content, confirmCallback, cancelCallback, confirmText = 'Save', cancelText = 'Cancel', triggerElement) {
    // Создаем элемент модального окна
    const modal = document.createElement('div');
    modal.classList.add('modal-card');
    modal.id = modalId;

    // Устанавливаем HTML-содержимое модального окна
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-body">
                ${content}
                <button id="confirm-${modalId}">${confirmText}</button>
                <button id="cancel-${modalId}">${cancelText}</button>
            </div>
        </div>
    `;

    // Добавляем модальное окно в тело документа
    document.body.appendChild(modal);

    // Получаем элементы модального окна
    const modalContent = modal.querySelector('.modal-content');
    const modalBody = modal.querySelector('.modal-body');
    const audioFileInput = modal.querySelector(`#audio-file-input-${modalId}`);
    const uploadButton = modal.querySelector(`#upload-button-${modalId}`);
    const audioPlayer = modal.querySelector(`#audio-player-${modalId}`);
    let audioFile;
    let audioBase64 = '';

    // Проверяем наличие сохраненного аудиофайла при загрузке модального окна
    const wordInput = document.getElementById('edit-word');
    if (wordInput) {
        const word = wordInput.value;
        checkAndLoadAudio(word, audioPlayer);
    }

    if (audioFileInput) {
        audioFileInput.addEventListener('change', (event) => {
            audioFile = event.target.files[0];
            uploadButton.disabled = !audioFile;
        });

        uploadButton.addEventListener('click', async () => {
            if (audioFile) {
                audioBase64 = await fileToBase64(audioFile);
                const audioUrl = `data:audio/webm;base64,${audioBase64}`;
                audioPlayer.src = audioUrl;
                audioPlayer.play();
            }
        });
    }

    // Получаем координаты элемента, вызвавшего модальное окно
    const triggerRect = triggerElement.getBoundingClientRect();
    const startX = triggerRect.left + triggerRect.width / 2;
    const startY = triggerRect.top + triggerRect.height / 2;

    // Устанавливаем начальные стили для анимации
    modalContent.style.position = 'fixed';
    modalContent.style.left = `${startX}px`;
    modalContent.style.top = `${startY}px`;
    modalContent.style.width = '0';
    modalContent.style.height = '0';
    modalContent.style.transform = 'translate(-50%, -50%)';
    modalContent.style.transition = 'left 2s ease, top 2s ease, width 2s ease, height 2s ease, opacity 2s ease';
    modalContent.style.opacity = '0';
    modalContent.style.visibility = 'visible';

    // Устанавливаем стили для модального окна через CSS
    modalContent.classList.add('modal-css');

    // Устанавливаем анимацию для модального окна
    requestAnimationFrame(() => {
        modalContent.style.left = '50%';
        modalContent.style.top = '50%'; // Опускаем ниже на экране
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '600px';
        modalContent.style.height = 'auto';
        modalContent.style.opacity = '1';
    });

    // Показываем содержимое модального окна после завершения анимации
    modalContent.addEventListener('transitionend', () => {
        modalBody.style.visibility = 'visible';
    });

    // Добавляем обработчики событий для кнопок подтверждения и отмены
    document.getElementById(`confirm-${modalId}`).addEventListener('click', async () => {
        const word = wordInput ? wordInput.value : '';
        if (audioFile) {
            audioBase64 = await fileToBase64(audioFile);
            await dictionaryStorage.saveAudio(word, audioFile); // Передаем файл напрямую
        }
        confirmCallback();
        closeModal(modalId);
    });

    document.getElementById(`cancel-${modalId}`).addEventListener('click', () => {
        cancelCallback();
        closeModal(modalId);
    });

    // Отображаем модальное окно
    modal.style.display = 'flex';
}

// Функция для закрытия модального окна
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.transition = 'opacity 1s ease';
        modalContent.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 1000); // Соответствие длительности перехода
    }
}

async function checkAndLoadAudio(word, audioPlayer) {
    try {
        const base64String = await dictionaryStorage.loadAudio(word);
        if (base64String) {
            const audioUrl = `data:audio/webm;base64,${base64String}`;
            audioPlayer.src = audioUrl;
            console.log('Аудиофайл загружен из Firebase Database');
        } else {
            console.log('Аудиофайл не найден в Firebase Database');
        }
    } catch (error) {
        console.error('Ошибка загрузки аудиофайла из Firebase Database:', error);
    }
}
