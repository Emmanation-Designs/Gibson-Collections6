
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES, ADMIN_EMAILS } from '../types';
import { useStore } from '../store/useStore';
import { Upload as UploadIcon, X, Loader2, ArrowLeft, Tag, DollarSign, Layers, FileText, Image as ImageIcon, Percent, Palette } from 'lucide-react';

const extractErrorMessage = (err: any): string => {
  if (!err) return 'An unknown error occurred.';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object') {
    if (err.message) return err.message;
    if (err.error_description) return err.error_description;
    
    // Check for nested error objects
    if (err.error && typeof err.error === 'object' && err.error.message) return err.error.message;

    try {
      const json = JSON.stringify(err);
      if (json !== '{}' && !json.includes('[object Object]')) return `Error: ${json}`;
    } catch { /* ignore */ }
  }
  return 'Operation failed with an unexpected error.';
};

export const Upload: React.FC = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  
  // New States for Discount and Colors
  const [discount, setDiscount] = useState('');
  const [colors, setColors] = useState(''); // Store as comma separated string for input

  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const isAuthorized = user?.email && ADMIN_EMAILS.some(email => email.toLowerCase() === user.email?.toLowerCase());

  if (!user || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <X className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">You need admin privileges to access this page.</p>
        <button 
          onClick={() => navigate('/')} 
          className="text-primary font-medium hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </button>
      </div>
    );
  }

  useEffect(() => {
    if (!editId) return;

    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', editId)
          .single();

        if (error) throw error;
        if (data) {
          setName(data.name);
          setPrice(data.price.toString());
          setCategory(data.category);
          setDescription(data.description);
          setExistingImages(data.image_urls || []);
          setPreviews(data.image_urls || []);
          
          // Populate new fields
          setDiscount(data.discount ? data.discount.toString() : '');
          setColors(data.colors ? data.colors.join(', ') : '');
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        alert(extractErrorMessage(err));
        navigate('/admin/upload');
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [editId, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: File[] = Array.from(e.target.files);
      const totalImages = existingImages.length + files.length + newFiles.length;
      
      if (totalImages > 5) {
        alert("Maximum 5 images allowed total");
        return;
      }
      
      setFiles([...files, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const isExisting = index < existingImages.length;

    if (isExisting) {
      const newExisting = [...existingImages];
      newExisting.splice(index, 1);
      setExistingImages(newExisting);
    } else {
      const fileIndex = index - existingImages.length;
      const newFiles = [...files];
      newFiles.splice(fileIndex, 1);
      setFiles(newFiles);
    }

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previews.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Please enter a valid price.");
      return;
    }

    setUploading(true);

    try {
      const newImageUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        newImageUrls.push(data.publicUrl);
      }

      const finalImages = [...existingImages, ...newImageUrls];
      
      // Parse colors from comma-separated string to array
      const colorArray = colors
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const productData = {
        name,
        price: priceNum,
        category,
        description,
        image_urls: finalImages,
        discount: discount ? parseFloat(discount) : 0,
        colors: colorArray // Save the array to Supabase
      };

      if (editId) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editId);

        if (updateError) throw updateError;
        alert('Product updated successfully!');
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
        alert('Product created successfully!');
      }

      navigate('/');
    } catch (error: any) {
      console.error(error);
      alert(extractErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-gray-500 hover:text-primary transition mb-6 px-4 md:px-0"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h1 className="text-xl font-bold text-gray-800">{editId ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-sm text-gray-500">
            {editId ? 'Update product details and availability.' : 'Fill in the details to publish a new item.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" /> Product Images
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previews.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-blue-50 transition group"
                >
                  <div className="bg-white p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition">
                    <UploadIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">Add Image</span>
                </button>
              )}
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="bg-white text-red-500 rounded-full p-2 hover:bg-red-50 transition transform hover:scale-110 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" /> Product Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" /> Price (₦)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gray-400" /> Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Optional (e.g. 10)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> Available Colors
              </label>
              <input
                type="text"
                placeholder="Separate colors with comma (e.g. Red, Blue, Navy Green, White)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-white"
                value={colors}
                onChange={e => setColors(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2 ml-1">
                These will show as colored dots on the product card. Use standard color names (e.g. Red, Pink, Cyan) for best results.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" /> Category
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" /> Description
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition shadow-lg shadow-blue-900/10 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {uploading ? <><Loader2 className="animate-spin w-5 h-5" /> Processing...</> : (editId ? 'Update Product' : 'Publish Product')}
          </button>
        </form>
      </div>
    </div>
  );
};
