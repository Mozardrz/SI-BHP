import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import {
  AlertTriangle,
  PlusCircle,
  CheckCircle2
} from 'lucide-react';
import { getMaterials, getCourses, recordIncomingStock } from '../utils/storage';

export const LowStock = () => {
  const { isAdmin, currentUser } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [coursesList, setCoursesList] = useState([]);

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [restockQty, setRestockQty] = useState(20);
  const [restockNote, setRestockNote] = useState('Restock darurat barang kritis');
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    try {
      const [mats, crs] = await Promise.all([getMaterials(), getCourses()]);
      setMaterials(mats);
      setCoursesList(crs);
    } catch (e) {
      setToast({ type: 'error', message: e.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const courseMap = new Map(coursesList.map(c => [c.id, c]));
  const criticalMaterials = materials.filter(m => m.stock <= m.min_stock);

  const handleOpenRestock = (mat) => {
    setSelectedMaterial(mat);
    const recommendedQty = Math.max(10, (mat.min_stock * 3) - mat.stock);
    setRestockQty(recommendedQty);
    setRestockNote(`Pengadaan ulang darurat untuk sisa stok kritis (${mat.stock} ${mat.unit})`);
    setIsRestockOpen(true);
  };

  const handleSaveRestock = async (e) => {
    e.preventDefault();
    try {
      await recordIncomingStock({
        material_id: selectedMaterial.id,
        quantity: restockQty,
        recorded_by: currentUser.id,
        note: restockNote
      });
      setToast({ type: 'success', message: `Restock ${selectedMaterial.material_name} (+${restockQty} ${selectedMaterial.unit}) berhasil diproses!` });
      setIsRestockOpen(false);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 text-white border border-rose-800/80 shadow-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-lg">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-sans tracking-tight">
              Peringatan Stok Kritis (Critical Low-Stock Hub)
            </h2>
            <p className="text-xs text-rose-200 mt-0.5">
              Daftar bahan habis pakai praktikum yang berada pada atau di bawah batas minimum threshold reorder.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Stock Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criticalMaterials.map((mat) => {
          const recommendedReorder = Math.max(10, (mat.min_stock * 3) - mat.stock);
          const crs = courseMap.get(mat.course_id);

          return (
            <div
              key={mat.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-900/80 shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      KRITIS REORDER
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {mat.material_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {crs ? crs.course_name : 'Mata Kuliah Praktikum'} • Semester {mat.semester}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-sans">
                      {mat.stock}
                    </span>
                    <span className="text-xs text-slate-500 font-medium block">
                      {mat.unit} tersisa
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Batas Min Threshold:</span>
                    <span className="font-bold">{mat.min_stock} {mat.unit}</span>
                  </div>
                  <div className="flex justify-between text-teal-600 dark:text-teal-400 font-semibold">
                    <span>Rekomendasi Reorder:</span>
                    <span>+{recommendedReorder} {mat.unit}</span>
                  </div>
                </div>
              </div>

              {isAdmin ? (
                <Button
                  onClick={() => handleOpenRestock(mat)}
                  variant="primary"
                  size="sm"
                  icon={PlusCircle}
                  className="w-full"
                >
                  Restock Bahan Sekarang
                </Button>
              ) : (
                <p className="text-[11px] text-center text-slate-400 italic">
                  Notifikasi otomatis telah dikirimkan ke Teknisi Lab untuk pengadaan.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {criticalMaterials.length === 0 && (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Semua Stok Bahan Dalam Kondisi Aman!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Tidak ada persediaan bahan habis pakai yang di bawah batas minimum threshold saat ini.
          </p>
        </div>
      )}

      {/* Restock Modal */}
      <Modal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        title={`Restock Darurat: ${selectedMaterial?.material_name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveRestock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Jumlah Tambahan Stok Masuk ({selectedMaterial?.unit}) *
            </label>
            <input
              type="number"
              min="1"
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Pengadaan / Distributor *
            </label>
            <textarea
              rows={2}
              value={restockNote}
              onChange={(e) => setRestockNote(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              onClick={() => setIsRestockOpen(false)}
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
              Proses Tambah Stok
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
