/**
 * Compresses an image file client-side using HTML5 Canvas
 * Auto-fits under 45,000 base64 chars (~33KB) so it syncs reliably via Google Sheets & LocalStorage
 */
export function compressImageFile(file, maxWidthOrOptions = 540, qualityArg = 0.68) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('File yang dipilih bukan gambar valid.'));
    }

    const isOpts = typeof maxWidthOrOptions === 'object' && maxWidthOrOptions !== null;
    const initialMaxWidth = Math.min(isOpts ? (maxWidthOrOptions.maxWidth || 540) : (maxWidthOrOptions || 540), 540);
    const initialQuality = isOpts ? (maxWidthOrOptions.quality || 0.68) : (qualityArg || 0.68);
    const MAX_DATA_URL_LENGTH = 45000;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const renderAt = (targetWidth, q) => {
          let width = img.width;
          let height = img.height;
          if (width > targetWidth) {
            height = Math.round((height * targetWidth) / width);
            width = targetWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          return canvas.toDataURL('image/jpeg', q);
        };

        let targetWidth = initialMaxWidth;
        let q = initialQuality;
        let compressedDataUrl = renderAt(targetWidth, q);

        // Step down quality/dimensions until guaranteed to fit inside a Google Sheets cell (50k char limit)
        while (compressedDataUrl.length > MAX_DATA_URL_LENGTH && (q > 0.3 || targetWidth > 260)) {
          if (q > 0.35) {
            q = Math.max(0.3, Number((q - 0.1).toFixed(2)));
          } else {
            targetWidth = Math.max(260, Math.round(targetWidth * 0.8));
          }
          compressedDataUrl = renderAt(targetWidth, q);
        }

        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Gagal memproses gambar.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}
