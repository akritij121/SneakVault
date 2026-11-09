import { useState, useEffect } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';

const ProductForm = ({ initialData, onSubmit, isLoading, submitLabel = 'Save' }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [sizes, setSizes] = useState('');
  // 3 images: index 0 is main, 1 and 2 are extras
  const [images, setImages] = useState(['', '', '']);
  const [uploading, setUploading] = useState([false, false, false]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPrice(initialData.price || 0);
      setBrand(initialData.brand || '');
      setCategory(initialData.category || '');
      setCountInStock(initialData.countInStock || 0);
      setDescription(initialData.description || '');
      setSizes(initialData.sizes?.join(', ') || '');
      
      const loadedImages = ['', '', ''];
      if (initialData.image) loadedImages[0] = initialData.image;
      if (initialData.images) {
        if (initialData.images[0]) loadedImages[1] = initialData.images[0];
        if (initialData.images[1]) loadedImages[2] = initialData.images[1];
      }
      setImages(loadedImages);
    }
  }, [initialData]);

  const uploadFileHandler = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
    const newUploading = [...uploading];
    newUploading[index] = true;
    setUploading(newUploading);

    try {
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newImages = [...images];
      newImages[index] = data.image;
      setImages(newImages);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      newUploading[index] = false;
      setUploading(newUploading);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sizeArray = sizes.split(',').map((s) => Number(s.trim())).filter((s) => !isNaN(s));
    
    // Construct payload
    const payload = {
      name,
      price,
      brand,
      category,
      countInStock,
      description,
      sizes: sizeArray,
      image: images[0], // Main image
      images: images.slice(1).filter(Boolean), // Extra images
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Count In Stock</label>
          <input
            type="number"
            value={countInStock}
            onChange={(e) => setCountInStock(Number(e.target.value))}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">Images (Max 3)</label>
        <div className="grid gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative">
              <div className="flex gap-2 items-center">
                <span className="text-xs font-mono text-muted-foreground w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={img}
                  onChange={(e) => {
                    const newImages = [...images];
                    newImages[index] = e.target.value;
                    setImages(newImages);
                  }}
                  placeholder={index === 0 ? "Main Image URL" : `Image ${index + 1} URL`}
                  className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                  required={index === 0}
                />
                <label className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md flex items-center gap-2 transition-colors">
                  {uploading[index] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => uploadFileHandler(e, index)}
                  />
                </label>
              </div>
              {uploading[index] && (
                <div className="absolute bottom-0 left-8 right-14 h-0.5 bg-secondary overflow-hidden rounded-b-md">
                  <div className="h-full bg-primary animate-progress-indeterminate origin-left"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Brand</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Sizes (comma separated)</label>
        <input
          type="text"
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
          placeholder="7, 8, 9, 10"
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-primary outline-none resize-none"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-2 rounded-md font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
};

export default ProductForm;
