import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import { Toast } from '../components/common/Toast';
import {
  Boxes,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  PlusCircle,
  Filter,
  BookOpen
} from 'lucide-react';
import {
  getMaterials,
  getCourses,
  getLabs,
  saveMaterial,
  deleteMaterial,
  recordIncomingStock
} from '../utils/storage';
import {
  exportMaterialsPDF,
  exportMaterialsExcel
} from '../utils/exportUtils';
import { getQualityBadge } from '../utils/formatters';

export const Materials = () => {
  const { isAdmin, currentUser } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [labsList, setLabsList] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    material_name: '',
    specification: '',
    course_id: '',
    lab_id: '',
    semester: 1,
    practical_hours: 4,
    quality: 'good',
    unit: 'Pcs',
    stock: 10,
    min_stock: 5
  });

  const [restockData, setRestockData] = useState({
    quantity: 10,
    note: ''
  });

  const [toast, setToast] = useState(null);

  const loadData = async () => {
    try {
      const [mats, crs, labs] = await Promise.all([getMaterials(), getCourses(), getLabs()]);
      setMaterials(mats);
      setCoursesList(crs);
      setLabsList(labs);
    } catch (e) {
      setToast({ type: 'error', message: e.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const courseMap = new Map(coursesList.map(c => [c.id, c]));
  const labMap = new Map(labsList.map(l => [l.id, l]));

  // Filtering Logic
  const filteredMaterials = materials.filter(m => {
    const crs = courseMap.get(m.course_id);
    const crsName = crs ? crs.course_name : '';
    const matchesSearch =
      m.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crsName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSemester = semesterFilter === 'all' || m.semester === Number(semesterFilter);
    const matchesQuality = qualityFilter === 'all' || m.quality === qualityFilter;
    const matchesStock =
      stockStatusFilter === 'all'
        ? true
        : stockStatusFilter === 'critical'
        ? m.stock <= m.min_stock
        : m.stock > m.min_stock;

    return matchesSearch && matchesSemester && matchesQuality && matchesStock;
  });

  const handleOpenAdd = () => {
    setSelectedMaterial(null);
    setFormData({
      material_name: '',
      specification: '',
      course_id: coursesList[0]?.id || '',
      lab_id: labsList[0]?.id || '',
      semester: 1,
      practical_hours: 4,
      quality: 'good',
      unit: 'Pcs',
      stock: 10,
      min_stock: 5
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (material) => {
    setSelectedMaterial(material);
    setFormData({
      material_name: material.material_name,
      specification: material.specification || '',
      course_id: material.course_id,
      lab_id: material.lab_id || '',
      semester: material.semester,
      practical_hours: material.practical_hours,
      quality: material.quality,
      unit: material.unit,
      stock: material.stock,
      min_stock: material.min_stock
    });
    setIsAddEditOpen(true);
  };

  const handleOpenRestock = (material) => {
    setSelectedMaterial(material);
    setRestockData({ quantity: 10, note: 'Restock pengadaan baru' });
    setIsRestockOpen(true);
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      if (!formData.material_name.trim()) throw new Error("Nama bahan tidak boleh kosong.");
      await saveMaterial({
        ...(selectedMaterial ? { id: selectedMaterial.id, no: selectedMaterial.no } : {}),
        ...formData
      });
      setToast({ type: 'success', message: `Bahan ${formData.material_name} berhasil disimpan.` });
      setIsAddEditOpen(false);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleSaveRestock = async (e) => {
    e.preventDefault();
    try {
      await recordIncomingStock({
        material_id: selectedMaterial.id,
        quantity: restockData.quantity,
        recorded_by: currentUser.id,
        note: restockData.note
      });
      setToast({ type: 'success', message: `Stok ${selectedMaterial.material_name} berhasil ditambah (+${restockData.quantity} ${selectedMaterial.unit}).` });
      setIsRestockOpen(false);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (material) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data master bahan: "${material.material_name}"?`)) {
      try {
        await deleteMaterial(material.id);
        setToast({ type: 'info', message: `Material ${material.material_name} telah dihapus.` });
        loadData();
      } catch (err) {
        setToast({ type: 'error', message: err.message });
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Master Data Bahan Habis Pakai (BHP)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              {filteredMaterials.length} Items
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pengelolaan stok kikir, gergaji, elektroda las, pahat, dan bahan habis pakai praktikum Bengkel Kerja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => exportMaterialsPDF(filteredMaterials, coursesList)}
            variant="outline"
            size="sm"
            icon={FileText}
          >
            Ekspor PDF
          </Button>

          <Button
            onClick={() => exportMaterialsExcel(filteredMaterials, coursesList)}
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
          >
            Ekspor Excel
          </Button>

          {isAdmin && (
            <Button
              onClick={handleOpenAdd}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              Tambah Bahan Baru
            </Button>
          )}
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari nama bahan, mata kuliah terkait, atau spesifikasi..."
        />

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter:</span>
          </div>

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Semua Semester</option>
            {[1, 2, 3, 4, 5, 6].map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          <select
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Semua Kualitas</option>
            <option value="good">Kualitas Baik</option>
            <option value="fair">Kualitas Cukup</option>
            <option value="poor">Kualitas Kurang</option>
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Semua Status Stok</option>
            <option value="safe">Stok Aman</option>
            <option value="critical">Stok Kritis (Reorder)</option>
          </select>
        </div>
      </div>

      {/* Materials Master Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">No</th>
                <th className="px-4 py-3.5">Nama Bahan Habis Pakai (BHP)</th>
                <th className="px-4 py-3.5">Mata Kuliah Terkait</th>
                <th className="px-4 py-3.5">Laboratorium</th>
                <th className="px-4 py-3.5 text-center">Sem.</th>
                <th className="px-4 py-3.5 text-center">Jam Prac</th>
                <th className="px-4 py-3.5 text-center">Kualitas</th>
                <th className="px-4 py-3.5 text-center">Sisa Stok</th>
                <th className="px-4 py-3.5 text-center">Threshold Min</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                {isAdmin && <th className="px-4 py-3.5 text-right">Aksi Management</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredMaterials.map((item, index) => {
                const isCritical = item.stock <= item.min_stock;
                const qualityBadge = getQualityBadge(item.quality);
                const crs = courseMap.get(item.course_id);
                const lab = labMap.get(item.lab_id);

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                      isCritical ? 'bg-rose-500/5 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="px-4 py-4 text-center font-mono text-slate-500">
                      {item.no || index + 1}
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{item.material_name}</span>
                        {isCritical && (
                          <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 animate-bounce" title="Stok Kritis!" />
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {crs ? (
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{crs.course_name}</div>
                          <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                            {crs.day_of_week} ({crs.start_time} - {crs.end_time})
                          </div>
                        </div>
                      ) : (
                        'Umum / Praktikum'
                      )}
                    </td>

                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {lab ? lab.lab_name : '—'}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        Sem {item.semester}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-300 font-mono">
                      {item.practical_hours} Jam
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${qualityBadge.bg}`}>
                        {qualityBadge.label}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center font-black text-sm font-sans">
                      <span className={isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}>
                        {item.stock} {item.unit}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center text-slate-500 font-mono">
                      {item.min_stock} {item.unit}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {isCritical ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          KRITIS (Reorder)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Aman
                        </span>
                      )}
                    </td>

                    {isAdmin && (
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenRestock(item)}
                            className="p-1.5 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/60 rounded-lg transition-colors"
                            title="Restock Tambah Stok"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors"
                            title="Edit Data Master"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                            title="Hapus Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 11 : 10} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Tidak ada data bahan yang cocok dengan pencarian.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Master Data Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={selectedMaterial ? `Edit Data: ${selectedMaterial.material_name}` : 'Tambah Master Bahan (BHP) Baru'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Bahan Habis Pakai (BHP) *
            </label>
            <input
              type="text"
              value={formData.material_name}
              onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
              placeholder="Contoh: Kikir Datar Halus 10 Inci"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Spesifikasi
            </label>
            <input
              type="text"
              value={formData.specification}
              onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
              placeholder="Contoh: Baja HSS, panjang 25 cm, grade halus"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Ditampilkan pada kolom Spesifikasi di surat permohonan.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Laboratorium *
            </label>
            <select
              value={formData.lab_id}
              onChange={(e) => setFormData({ ...formData, lab_id: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {labsList.length === 0 && <option value="">(Belum ada Laboratorium — tambah di menu Laboratorium)</option>}
              {labsList.map(lab => (
                <option key={lab.id} value={lab.id}>{lab.lab_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Mata Kuliah Terkait *
              </label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {coursesList.map(crs => (
                  <option key={crs.id} value={crs.id}>
                    {crs.course_name} ({crs.day_of_week} {crs.start_time}-{crs.end_time})
                  </option>
                ))}
                {coursesList.length === 0 && (
                  <option value="">(Belum Ada Mata Kuliah - Tambah di menu Mata Kuliah)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Semester Digunakan *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jam Practical *
              </label>
              <input
                type="number"
                min="1"
                value={formData.practical_hours}
                onChange={(e) => setFormData({ ...formData, practical_hours: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kualitas *
              </label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="good">Baik</option>
                <option value="fair">Cukup</option>
                <option value="poor">Kurang</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Satuan Ukuran *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Pcs, Kg, Meter, Lembar"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Stok Awal Saat Ini *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Threshold Batas Min (Warning) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
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
              Simpan Data Master
            </Button>
          </div>
        </form>
      </Modal>

      {/* Restock Modal */}
      <Modal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        title={`Pencatatan Stok Masuk (Restock): ${selectedMaterial?.material_name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveRestock} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
            <p className="text-slate-500">Sisa Stok Saat Ini: <span className="font-bold text-slate-900 dark:text-white">{selectedMaterial?.stock} {selectedMaterial?.unit}</span></p>
            <p className="text-slate-500">Batas Min Threshold: <span className="font-bold text-slate-900 dark:text-white">{selectedMaterial?.min_stock} {selectedMaterial?.unit}</span></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Jumlah Stok Masuk ({selectedMaterial?.unit}) *
            </label>
            <input
              type="number"
              min="1"
              value={restockData.quantity}
              onChange={(e) => setRestockData({ ...restockData, quantity: Number(e.target.value) })}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Pengadaan *
            </label>
            <textarea
              rows={2}
              value={restockData.note}
              onChange={(e) => setRestockData({ ...restockData, note: e.target.value })}
              placeholder="Contoh: Pengadaan bahan rutin semester ganjil dari distributor"
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
              variant="secondary"
              size="sm"
              icon={PlusCircle}
            >
              Proses Stok Masuk
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
