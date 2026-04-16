'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState({
    text: '',
    signature: '',
    theme: 'cherry-blossom',
    images: [] as string[],
    musicUrl: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(setContent);
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) setLoggedIn(true);
    else alert('Wrong password');
  };

  const save = async () => {
    await fetch('/api/content', {
      method: 'POST',
      body: JSON.stringify(content),
      headers: { 'Content-Type': 'application/json' }
    });
    alert('Saved! ✅');
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'music') => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const { url } = await res.json();
    
    if (type === 'image') {
      setContent({ ...content, images: [...content.images, url] });
    } else {
      setContent({ ...content, musicUrl: url });
    }
    setUploading(false);
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center font-sans">
        <form onSubmit={login} className="bg-white p-8 rounded-2xl shadow-xl border-4 border-pink-200">
          <h1 className="text-2xl font-bold text-pink-600 mb-4">🔐 Admin Login</h1>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-pink-200 rounded-lg mb-4 focus:outline-none focus:border-pink-400"
            placeholder="Enter admin password"
          />
          <button className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold hover:bg-pink-600 transition">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border-4 border-pink-200">
        <h1 className="text-3xl font-bold text-pink-600 mb-6">🎀 Edit Your Letter</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-pink-700 font-bold mb-2">Theme</label>
            <select 
              value={content.theme} 
              onChange={e => setContent({...content, theme: e.target.value})}
              className="w-full p-3 border-2 border-pink-200 rounded-lg"
            >
              <option value="cherry-blossom">🌸 Cherry Blossom</option>
              <option value="lavender-dream">💜 Lavender Dream</option>
              <option value="cream-puff">🍰 Cream Puff</option>
            </select>
          </div>

          <div>
            <label className="block text-pink-700 font-bold mb-2">Letter Text</label>
            <textarea 
              value={content.text} 
              onChange={e => setContent({...content, text: e.target.value})}
              className="w-full h-48 p-4 border-2 border-pink-200 rounded-lg font-mono text-sm"
              placeholder="Write your letter here..."
            />
          </div>

          <div>
            <label className="block text-pink-700 font-bold mb-2">Signature</label>
            <input 
              value={content.signature} 
              onChange={e => setContent({...content, signature: e.target.value})}
              className="w-full p-3 border-2 border-pink-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-pink-700 font-bold mb-2">Background Music (MP3)</label>
            <input 
              type="file" 
              accept="audio/mp3" 
              onChange={e => uploadFile(e, 'music')}
              className="w-full p-3 border-2 border-pink-200 rounded-lg"
            />
            {content.musicUrl && <p className="text-green-600 mt-1">✅ Music uploaded</p>}
          </div>

          <div>
            <label className="block text-pink-700 font-bold mb-2">Photos (up to 8)</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple
              onChange={e => uploadFile(e, 'image')}
              className="w-full p-3 border-2 border-pink-200 rounded-lg"
            />
            <div className="grid grid-cols-4 gap-2 mt-2">
              {content.images.map((img, i) => (
                <img key={i} src={img} className="w-full h-20 object-cover rounded-lg" />
              ))}
            </div>
          </div>

          <button 
            onClick={save}
            disabled={uploading}
            className="w-full bg-pink-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-pink-600 transition disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
