import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import firebaseConfig from './firebaseConfig.js';

// Инициализируем Firebase и базу данных
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export class AudioRecorder {
    constructor(audioPlayerId, recordButtonId, stopButtonId, uploadButtonId, audioFileInputId) {
        this.audioPlayer = document.getElementById(audioPlayerId);
        this.recordButton = document.getElementById(recordButtonId);
        this.stopButton = document.getElementById(stopButtonId);
        this.uploadButton = document.getElementById(uploadButtonId);
        this.audioFileInput = document.getElementById(audioFileInputId);
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.mediaStream = null;

        this.init();
    }

    async init() {
        if (this.audioFileInput) {
            this.audioFileInput.addEventListener('change', (event) => {
                this.audioFile = event.target.files[0];
                this.uploadButton.disabled = !this.audioFile;
            });

            this.uploadButton.addEventListener('click', async () => {
                if (this.audioFile) {
                    const audioBase64 = await this.fileToBase64(this.audioFile);
                    await this.saveAudioToFirebase('saved_audio', audioBase64);
                    const audioUrl = `data:audio/webm;base64,${audioBase64}`;
                    this.audioPlayer.src = audioUrl;
                }
            });
        }

        if (this.recordButton && this.stopButton) {
            this.recordButton.addEventListener('click', async () => {
                const recording = await this.startRecording();
                if (recording) {
                    this.mediaRecorder = recording.mediaRecorder;
                    this.audioChunks = recording.audioChunks;
                    this.mediaStream = recording.mediaStream;
                    this.recordButton.disabled = true;
                    this.stopButton.disabled = false;
                }
            });

            this.stopButton.addEventListener('click', async () => {
                if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                    const audioBlob = await this.stopRecording(this.mediaRecorder, this.audioChunks, this.mediaStream);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    this.audioPlayer.src = audioUrl;
                    const audioBase64 = await this.fileToBase64(audioBlob);
                    await this.saveAudioToFirebase('saved_audio', audioBase64);
                    this.stopButton.disabled = true;
                    this.recordButton.disabled = false;
                }
            });
        }
    }

    async startRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Ваш браузер не поддерживает запись аудио.');
            return;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(mediaStream);
            const audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.start();

            return { mediaRecorder, audioChunks, mediaStream };
        } catch (error) {
            console.error('Error accessing microphone or starting MediaRecorder:', error);
            alert('Error accessing microphone or starting MediaRecorder. Please ensure you have granted permission and your browser supports MediaRecorder.');
            return null;
        }
    }

    async stopRecording(mediaRecorder, audioChunks, mediaStream) {
        return new Promise((resolve, reject) => {
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                mediaStream.getTracks().forEach(track => track.stop()); // Останавливаем все треки медиа потока
                resolve(audioBlob);
            };

            mediaRecorder.onerror = (event) => {
                reject(event.error);
            };

            mediaRecorder.stop();
        });
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    }

    async saveAudioToFirebase(fileName, base64String) {
        try {
            const audioRef = ref(db, `audio/${this.sanitizeFileName(fileName)}`);
            await set(audioRef, base64String);
            console.log('Аудиофайл сохранен в Firebase Database');
        } catch (error) {
            console.error('Ошибка сохранения аудиоданных в Firebase Database:', error);
            alert('Ошибка сохранения аудиоданных в Firebase Database. Пожалуйста, попробуйте еще раз.');
        }
    }

    sanitizeFileName(fileName) {
        return fileName.replace(/[.#$[\]]/g, '_');
    }
}
