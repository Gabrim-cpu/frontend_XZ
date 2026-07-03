// Read any File as a data URL (no processing). Used for video/audio uploads.
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// Read a Blob (e.g. a MediaRecorder recording) as a data URL.
export function blobToDataUrl(blob) {
  return fileToDataUrl(blob);
}

// Downscale + re-encode an image file to a JPEG data URL so base64 uploads
// stay well under reverse-proxy body limits (nginx defaults to 1MB → HTTP 413).
export function compressImage(file, { maxDim = 1280, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
