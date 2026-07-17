import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { FlaskConical, Plus, Edit, Trash2, UserCog, BadgeCheck } from 'lucide-react';
import { getLabs, saveLab, deleteLab, getMaterials, getCourses } from '../utils/storage';

export const Labs = () => {
  const { isAdmin } = useAuth();
  const [labsList, setLabsList] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);

  const [formData, setFormData] = useState({
    lab_name: '',
    head_name: '',
    head_nip: ''
  });

  const [toast, setToast] = useState(null);

  const loadData = async () => {
    try {
      const [labs, mats, crs] = await Promise.all([getLabs(), getMaterials(), getCourses()]);
      setLabsList(labs);
      setMaterials(mats);
      setCourses(crs);
    } catch (e) {
      setToast({ type: 'error', message: e.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedLab(null);
    setFormData({ lab_name: '', head_name: '', head_nip: '' });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (lab) => {
    setSelectedLab(lab);
    setFormData({
      lab_name: lab.lab_name || '',
      head_name: lab.head_name || '',
      head_nip: lab.head_nip || ''
    });
    setIsOpenModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await saveLab({
        ...(selectedLab ? { id: selectedLab.id } : {}),
        ...formData
      });
      setToast({ type: 'success', message: `Laboratorium "${formData.lab_name}" tersimpan.` });
      setIsOpenModal(false);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (lab) => {
    const linked = materials.filter(m => m.lab_id === lab.id).length + courses.filter(c => c.lab_id === lab.id).length;
    if (linked > 0) {
      setToast({ type: 'warning', message: `Tidak dapat menghapus "${lab.lab_name}" karena masih terikat pada ${linked} data mata kuliah/bahan.` });
      return;
    }
    if (confirm(`Hapus data laboratorium: "${lab.lab_name}"?`)) {
      try {
        await deleteLab(lab.id);
        setToast({ type: 'info', message: `Laboratorium "${lab.lab_name}" telah dihapus.` });
        loadData();
      } catch (err) {
        setToast({ type: 'error', message: err.message });
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Master Data Laboratorium
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
              {labsList.length} Laboratorium
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data laboratorium beserta kepala lab & NIP. Nama kepala lab digunakan untuk tanda tangan surat permohonan/persetujuan.
          </p>
        </div>

        {isAdmin && (
          <Button onClick={handleOpenAdd} variant="primary" size="sm" icon={Plus}>
            Tambah Laboratorium
          </Button>
        )}
      </div>

      {/* Lab Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labsList.map((lab) => {
          const linkedMaterials = materials.filter(m => m.lab_id === lab.id).length;
          return (
            <div key={lab.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEdit(lab)} className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Edit Laboratorium">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(lab)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Hapus Laboratorium">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {lab.lab_name}
                </h3>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <UserCog className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                    <span className="font-semibold">{lab.head_name || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono">
                    <BadgeCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>NIP. {lab.head_nip || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-semibold text-violet-600 dark:text-violet-400">
                  {linkedMaterials} Jenis Bahan Terkait
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {labsList.length === 0 && (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <FlaskConical className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Belum Ada Data Laboratorium
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Klik "Tambah Laboratorium" untuk mendaftarkan laboratorium beserta kepala lab dan NIP-nya.
          </p>
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title={selectedLab ? `Edit Laboratorium: ${selectedLab.lab_name}` : 'Tambah Laboratorium Baru'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Laboratorium *
            </label>
            <input
              type="text"
              value={formData.lab_name}
              onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
              placeholder="Contoh: Laboratorium Bengkel Kerja"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Kepala Lab *
            </label>
            <input
              type="text"
              value={formData.head_name}
              onChange={(e) => setFormData({ ...formData, head_name: e.target.value })}
              placeholder="Contoh: Nama Kepala Lab, S.T., M.T."
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Digunakan sebagai penanda tangan surat permohonan/persetujuan.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              NIP Kepala Lab
            </label>
            <input
              type="text"
              value={formData.head_nip}
              onChange={(e) => setFormData({ ...formData, head_nip: e.target.value })}
              placeholder="Contoh: 19910515 202601 1 002"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" onClick={() => setIsOpenModal(false)} variant="outline" size="sm">Batal</Button>
            <Button type="submit" variant="primary" size="sm">Simpan Laboratorium</Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
