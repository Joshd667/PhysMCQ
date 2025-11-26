import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Plus, ChevronRight, X } from '../icons';
import { compressImage } from '../../utils/imageUtils';

function BulkImageUpload({ bulkImages, setBulkImages, setBulkStage }) {
  const [currentImage, setCurrentImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    if (file && file.type.startsWith('image/')) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);
        setCurrentImage({
          file: compressed.file,
          dataUrl: compressed.dataUrl,
          name: file.name
        });
      } catch (error) {
        console.error('Image compression failed:', error);
        // Fallback to uncompressed
        const reader = new FileReader();
        reader.onload = (e) => {
          setCurrentImage({
            file,
            dataUrl: e.target.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleMultipleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    // Convert FileList to array and filter for images
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    // Sort files by their original filename using alphanumeric sorting
    imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    setIsCompressing(true);
    const processedImages = [];

    try {
      // Process each file sequentially to maintain order
      for (const file of imageFiles) {
        try {
          const compressed = await compressImage(file);
          processedImages.push({
            file: compressed.file,
            dataUrl: compressed.dataUrl,
            name: file.name
          });
        } catch (error) {
          console.error('Image compression failed:', error);
          // Fallback to uncompressed
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          processedImages.push({
            file,
            dataUrl,
            name: file.name
          });
        }
      }

      // Add all processed images to the bulk images list
      setBulkImages(prev => [...prev, ...processedImages]);
    } finally {
      setIsCompressing(false);
    }
  };

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        handleImageUpload(file);
        e.preventDefault();
        break;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const addCurrentImage = () => {
    if (currentImage) {
      setBulkImages(prev => [...prev, currentImage]);
      setCurrentImage(null);
    }
  };

  const removeImage = (index) => {
    setBulkImages(prev => prev.filter((_, i) => i !== index));
  };

  const proceed = () => {
    if (bulkImages.length > 0) {
      setBulkStage('metadata');
    } else {
      alert('Please add at least one image');
    }
  };

  return (
    <div className="container mx-auto px-4 pb-12 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold mb-4">Add Image</h3>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors mb-4"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleMultipleImageUpload(e.target.files)}
              className="hidden"
            />
            {currentImage ? (
              <img src={currentImage.dataUrl} alt="Preview" className="max-h-64 mx-auto rounded" />
            ) : (
              <div>
                <div className="inline-block mb-4"><Upload /></div>
                <p className="text-gray-600 text-lg font-medium">Click to upload images or paste image</p>
                <p className="text-gray-500 text-sm mt-2">(Ctrl/Cmd + V)</p>
              </div>
            )}
          </div>
          {currentImage && (
            <button
              onClick={addCurrentImage}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add to List
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Images Added ({bulkImages.length})</h3>
            {bulkImages.length > 0 && (
              <button
                onClick={proceed}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {bulkImages.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No images added yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
              {bulkImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img.dataUrl} alt={`Question ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => removeImage(idx)}
                      className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold">
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkImageUpload;
