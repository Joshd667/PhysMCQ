// Default compression settings
const DEFAULT_MAX_WIDTH = 1200;
const DEFAULT_QUALITY = 0.8;

// Image compression utility
export const compressImage = (file, maxWidth = DEFAULT_MAX_WIDTH, quality = DEFAULT_QUALITY) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                file: compressedFile,
                dataUrl: e.target.result
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
