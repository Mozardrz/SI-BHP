import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { Users, Plus, Shield, User, Power, Mail, Calendar } from 'lucide-react';
import { getUsers, saveUser, toggleUserStatus } from '../utils/storage';
import { formatDate } from '../utils/formatters';

export const UserManagement = () => {
  const { currentUser } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const emptyForm = { name: '', username: '', password: '', email: '', user_type: 'mahasiswa' };
  const [formData, setFormData] = useState(emptyForm);

  const [toast, setToast] = useState(null);

  const loadData = async () => {
    setUsersList(await getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
        throw new Error("Nama, username, dan password wajib diisi.");
      }
      // mahasiswa & dosen/tendik -> role user; admin/teknisi -> role admin
      const role = formData.user_type === 'admin' ? 'admin' : 'user';
      await saveUser({ ...formData, username: formData.username.trim().toLowerCase(), role });
      setToast({ type: 'success', message: `Pengguna baru "${formData.name}" berhasil ditambahkan.` });
      setIsModalOpen(false);
      setFormData(emptyForm);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleToggleActive = async (usr) => {
    if (usr.id === currentUser.id) {
      setToast({ type: 'warning', message: "Anda tidak dapat menonaktifkan akun sendiri yang sedang aktif." });
      return;
    }
    try {
      await toggleUserStatus(usr.id);
      setToast({ type: 'info', message: `Status akun ${usr.name} berhasil diperbarui.` });
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Manajemen Pengguna & Pengaturan Peran
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {usersList.length} Akun Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pengelolaan hak akses teknisi lab (admin) dan mahasiswa/dosen praktikum (user).
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          size="sm"
          icon={Plus}
        >
          Tambah Akun Pengguna
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Nama Pengguna</th>
                <th className="px-4 py-3.5">Username</th>
                <th className="px-4 py-3.5 text-center">Tipe / Peran</th>
                <th className="px-4 py-3.5 text-center">Tgl Registrasi</th>
                <th className="px-4 py-3.5 text-center">Status Akun</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {usersList.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                        {usr.name.charAt(0)}
                      </div>
                      <span>{usr.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-mono">
                    {usr.username || '—'}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      usr.role === 'admin'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300'
                    }`}>
                      {usr.user_type || usr.role}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center font-mono text-slate-500">
                    {formatDate(usr.created_at)}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      usr.is_active
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {usr.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleToggleActive(usr)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        usr.is_active ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                      }`}
                      title={usr.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrasi Pengguna Baru SI-BHP"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap & Gelar *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Muhammad Rafli, S.ST."
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="mrafli"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 6 karakter"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Email Kampus (opsional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="nama@polbeng.ac.id"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Daftar Sebagai *
            </label>
            <select
              value={formData.user_type}
              onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="mahasiswa">Mahasiswa</option>
              <option value="dosen">Dosen/Tendik</option>
              <option value="admin">Admin / Teknisi Lab</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              variant="outline"
              size="sm"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Simpan Pengguna
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
