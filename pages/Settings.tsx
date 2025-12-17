import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, Save, User } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setAvatarUrl(user.avatar_url || null);
    } else {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `profiles/${user?.id}-${Date.now()}.${fileExt}`;
    
    setUploading(true);
    try {
      // Reuse product-images bucket but in profiles folder to ensure permissions
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setAvatarUrl(data.publicUrl);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl
        }
      });

      if (error) throw error;

      if (data.user && user) {
        setUser({
          ...user,
          full_name: data.user.user_metadata.full_name,
          avatar_url: data.user.user_metadata.avatar_url
        });
        alert('Profile updated successfully!');
        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => navigate('/profile')} 
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner bg-gray-100 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <Camera className="w-8 h-8 text-white" />
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              )}
            </div>
            <p className="text-sm text-primary font-medium mt-3 cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
              Change Profile Photo
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Display Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-gray-900 bg-white placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};
