export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!(file instanceof Blob)) {
            reject(new TypeError("Argument must be an instance of Blob"));
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
}
