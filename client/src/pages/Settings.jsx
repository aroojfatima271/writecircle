import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GENRES = ['Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Literary Fiction', 'Horror', 'Historical Fiction', 'Young Adult', 'Poetry', 'Non-Fiction'];
const ACCENTS = ['#7A2E3B', '#3F6656', '#C9A227', '#1B1E2B', '#5C2129'];

const Settings = () => {
  const { user, updateUserLocal } = useAuth();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarColor, setAvatarColor] = useState(user.avatarColor);
  const [genres, setGenres] = useState(user.genres || []);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const toggleGenre = (g) => setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/users/me', { displayName, bio, avatarColor, genres });
      updateUserLocal(data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await api.patch('/users/me/password', { currentPassword, newPassword });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update password');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-14">
      <h1 className="font-display text-3xl text-ink mb-8">Settings</h1>

      <form onSubmit={handleSaveProfile} className="space-y-5 mb-14">
        <h2 className="font-medium text-ink">Profile</h2>
        <div>
          <label className="block text-sm text-inkSoft mb-1.5">Display name</label>
          <input className="input-field" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} />
        </div>
        <div>
          <label className="block text-sm text-inkSoft mb-1.5">Bio</label>
          <textarea className="input-field" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} />
        </div>
        <div>
          <label className="block text-sm text-inkSoft mb-2">Avatar color</label>
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button type="button" key={a} onClick={() => setAvatarColor(a)} className={`w-8 h-8 rounded-full border-2 ${avatarColor === a ? 'border-ink' : 'border-transparent'}`} style={{ backgroundColor: a }} />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-inkSoft mb-2">Genres you write</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button type="button" key={g} onClick={() => toggleGenre(g)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${genres.includes(g) ? 'bg-wine text-paper border-wine' : 'border-ink/15 text-inkSoft'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save profile'}</button>
      </form>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <h2 className="font-medium text-ink">Change password</h2>
        <input type="password" required placeholder="Current password" className="input-field" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <input type="password" required minLength={8} placeholder="New password (min 8 characters)" className="input-field" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button type="submit" disabled={changingPw} className="btn-secondary">{changingPw ? 'Updating…' : 'Update password'}</button>
      </form>
    </div>
  );
};

export default Settings;
