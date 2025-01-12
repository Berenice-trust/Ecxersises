import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import firebaseConfig from './firebaseConfig.js';
import { dictionaryStorage } from './dictionaryStorage.js';

// Инициализируем Firebase и базу данных
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export class AudioRecorder {
    constructor(audioPlayerId, recordButtonId, stopButtonId, uploadButtonId, audioFileInputId, word) {
        this.audioPlayer = document.getElementById(audioPlayerId);
        this.recordButton = document.getElementById(recordButtonId);
        this.stopButton = document.getElementById(stopButtonId);
        this.uploadButton = document.getElementById(uploadButtonId);
        this.audioFileInput = document.getElementById(audioFileInputId);
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.mediaStream = null;
        this.word = word;

        this.init();
    }

    async init() {
        console.log('Initializing AudioRecorder...');
        if (this.audioFileInput) {
            this.audioFileInput.addEventListener('change', (event) => {
                this.audioFile = event.target.files[0];
                this.uploadButton.disabled = !this.audioFile;
                console.log('Audio file selected:', this.audioFile);
            });

            this.uploadButton.addEventListener('click', async () => {
                if (this.audioFile) {
                    console.log('Uploading audio file...');
                    await dictionaryStorage.saveAudio(this.word, this.audioFile);
                    const audioBase64 = await dictionaryStorage.loadAudio(this.word);
                    const audioUrl = `data:audio/webm;base64,${audioBase64}`;
                    this.audioPlayer.src = audioUrl;
                    console.log('Audio file uploaded and played.');
                }
            });
        }

        if (this.recordButton && this.stopButton) {
            this.recordButton.addEventListener('click', async () => {
                console.log('Starting recording...');
                const recording = await this.startRecording();
                if (recording) {
                    this.mediaRecorder = recording.mediaRecorder;
                    this.audioChunks = recording.audioChunks;
                    this.mediaStream = recording.mediaStream;
                    this.recordButton.disabled = true;
                    this.stopButton.disabled = false;
                    console.log('Recording started.');
                }
            });

            this.stopButton.addEventListener('click', async () => {
                if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                    console.log('Stopping recording...');
                    const audioBlob = await this.stopRecording(this.mediaRecorder, this.audioChunks, this.mediaStream);
                    const localAudioUrl = URL.createObjectURL(audioBlob);
                    this.audioPlayer.src = localAudioUrl;
                    await dictionaryStorage.saveAudio(this.word, audioBlob);
                    const audioBase64 = await dictionaryStorage.loadAudio(this.word);
                    const firebaseAudioUrl = `data:audio/webm;base64,${audioBase64}`;
                    this.audioPlayer.src = firebaseAudioUrl;
                    this.stopButton.disabled = true;
                    this.recordButton.disabled = false;
                    console.log('Recording stopped and audio file saved.');
                }
            });
        }
    }

    async startRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Your brouser dont supported MediaRecorder.');
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
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                mediaStream.getTracks().forEach(track => track.stop()); // stop all media tracks
                resolve(audioBlob);
            };

            mediaRecorder.onerror = (event) => {
                reject(event.error);
            };

            mediaRecorder.stop();
        });
    }
}
