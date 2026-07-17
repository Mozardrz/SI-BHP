import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { User, Key, Camera, Upload, Check, X, Save } from 'lucide-react';
import { formatDate } from '../utils/formatters';

// Downscale any image blob/file to a small square-ish JPEG data URL (keeps localStorage light).
const fileToAvatar = (blob, maxSize = 256) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });

export const Profile = () => {
  const { currentUser, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  // Camera capture state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ type: 'error', message: 'Nama tidak boleh kosong.' });
      return;
    }
    try {
      await updateProfile({ name: name.trim() });
      setToast({ type: 'success', message: 'Nama profil berhasil diperbarui.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ type: 'error', message: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }
    if (newPassword.length < 6) {
      setToast({ type: 'error', message: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }
    try {
      await changePassword(oldPassword, newPassword);
      setToast({ type: 'success', message: 'Kata sandi berhasil diperbarui.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const avatar = await fileToAvatar(file);
      await updateProfile({ avatar });
      setToast({ type: 'success', message: 'Foto profil berhasil diperbarui.' });
    } catch {
      setToast({ type: 'error', message: 'Gagal memproses gambar yang dipilih.' });
    }
    e.target.value = '';
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      setToast({ type: 'error', message: 'Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.' });
    }
  };

  // Attach the stream once the video element is mounted.
  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraOpen]);

  useEffect(() => () => stopCamera(), []);

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // center-crop to square
    const side = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - side) / 2;
    const sy = (video.videoHeight - side) / 2;
    ctx.drawImage(video, sx, sy, side, side, 0, 0, size, size);
    const avatar = canvas.toDataURL('image/jpeg', 0.82);
    try {
      await updateProfile({ avatar });
      setToast({ type: 'success', message: 'Foto profil dari kamera berhasil disimpan.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
    closeCamera();
  };

  const closeCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
  };

  const removeAvatar = async () => {
    try {
      await updateProfile({ avatar: '' });
      setToast({ type: 'info', message: 'Foto profil dihapus, kembali ke inisial.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Profile Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="Foto profil" className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-polbeng-blue to-teal-500 text-white flex items-center justify-center font-black text-3xl shadow-lg">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {currentUser?.name}
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              currentUser?.role === 'admin'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
            }`}>
              {currentUser?.role === 'admin' ? 'Admin / Teknisi Lab' : 'Pengguna Praktikum'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser?.email || currentUser?.username}
          </p>

          {/* Avatar actions */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-3">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFilePick} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" icon={Upload}>
              Pilih dari File
            </Button>
            <Button onClick={openCamera} variant="outline" size="sm" icon={Camera}>
              Ambil dari Kamera
            </Button>
            {currentUser?.avatar && (
              <Button onClick={removeAvatar} variant="ghost" size="sm" icon={X}>
                Hapus Foto
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Editable cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Edit Profile / Info */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-polbeng-blue dark:text-sky-400" />
            <span>Ubah Data Profil</span>
          </h3>

          <form onSubmit={handleSaveName} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <Button type="submit" variant="primary" size="sm" icon={Save} className="w-full">
              Simpan Perubahan
            </Button>
          </form>

          <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-800 pt-2">
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Username:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{currentUser?.username || '—'}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Hak Akses:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200 uppercase">{currentUser?.role}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Terdaftar Sejak:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{formatDate(currentUser?.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" />
            <span>Reset Kata Sandi</span>
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Kata Sandi Lama
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <Button type="submit" variant="primary" size="sm" className="w-full mt-2">
              Perbarui Kata Sandi
            </Button>
          </form>
        </div>

      </div>

      {/* Camera Modal */}
      <Modal isOpen={isCameraOpen} onClose={closeCamera} title="Ambil Foto Profil dari Kamera" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-square flex items-center justify-center">
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={closeCamera} variant="outline" size="sm" icon={X}>Batal</Button>
            <Button type="button" onClick={capturePhoto} variant="secondary" size="sm" icon={Check}>Ambil Foto</Button>
          </div>
        </div>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
