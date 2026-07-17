import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { BookOpen, Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { getCourses, saveCourse, deleteCourse, getMaterials, getLabs } from '../utils/storage';
import { formatDate } from '../utils/formatters';

export const Courses = () => {
  const { isAdmin } = useAuth();
  const [coursesList, setCoursesList] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [labs, setLabs] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    lab_id: '',
    semester: 1,
    day_of_week: 'Senin',
    start_time: '08:00',
    end_time: '12:00',
    description: ''
  });

  const [toast, setToast] = useState(null);

  const loadData = async () => {
    try {
      const [crs, mats, lbs] = await Promise.all([getCourses(), getMaterials(), getLabs()]);
      setCoursesList(crs);
      setMaterials(mats);
      setLabs(lbs);
    } catch (e) {
      setToast({ type: 'error', message: e.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedCourse(null);
    setFormData({
      course_code: '',
      course_name: '',
      lab_id: labs[0]?.id || '',
      semester: 1,
      day_of_week: 'Senin',
      start_time: '08:00',
      end_time: '12:00',
      description: ''
    });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      course_code: course.course_code || '',
      course_name: course.course_name,
      lab_id: course.lab_id || '',
      semester: course.semester || 1,
      day_of_week: course.day_of_week || 'Senin',
      start_time: course.start_time || '08:00',
      end_time: course.end_time || '12:00',
      description: course.description || ''
    });
    setIsOpenModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!formData.course_name.trim()) throw new Error("Nama mata kuliah wajib diisi.");
      await saveCourse({
        ...(selectedCourse ? { id: selectedCourse.id } : {}),
        ...formData
      });
      setToast({ type: 'success', message: `Mata kuliah "${formData.course_name}" tersimpan.` });
      setIsOpenModal(false);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (course) => {
    const linkedCount = materials.filter(m => m.course_id === course.id).length;
    if (linkedCount > 0) {
      setToast({ type: 'warning', message: `Tidak dapat menghapus "${course.course_name}" karena terikat pada ${linkedCount} jenis bahan BHP.` });
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus data mata kuliah: "${course.course_name}"?`)) {
      try {
        await deleteCourse(course.id);
        setToast({ type: 'info', message: `Mata kuliah "${course.course_name}" telah dihapus.` });
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
              Master Data Mata Kuliah Terkait
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              {coursesList.length} Mata Kuliah Praktikum
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pengelolaan mata kuliah praktikum, jadwal hari, dan rentang jam pelaksanaan di Laboratorium Bengkel Kerja.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={handleOpenAdd}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            Tambah Mata Kuliah
          </Button>
        )}
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coursesList.map((course) => {
          const linkedMaterials = materials.filter(m => m.course_id === course.id);
          const courseLab = labs.find(l => l.id === course.lab_id);

          return (
            <div
              key={course.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                    <BookOpen className="w-5 h-5" />
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(course)}
                        className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Mata Kuliah"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Hapus Mata Kuliah"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  {course.course_code && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {course.course_code}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {course.course_name}
                  </h3>
                </div>

                {/* Schedule Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>{course.day_of_week} ({course.start_time} - {course.end_time} WIB)</span>
                </div>

                {courseLab && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-900 text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                    {courseLab.lab_name}
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {course.description || 'Praktikum jurusan Teknik Mesin Polbeng.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  {linkedMaterials.length} Jenis BHP Digunakan
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Sem {course.semester}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {coursesList.length === 0 && (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Belum Ada Data Mata Kuliah Praktikum
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Klik tombol "Tambah Mata Kuliah" untuk memasukkan data mata kuliah praktikum beserta jadwal hari dan jamnya.
          </p>
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title={selectedCourse ? `Edit Mata Kuliah: ${selectedCourse.course_name}` : 'Tambah Mata Kuliah Praktikum Baru'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode MK
              </label>
              <input
                type="text"
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                placeholder="MK-01"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Mata Kuliah *
              </label>
              <input
                type="text"
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                placeholder="Contoh: Praktikum Pengelasan SMAW"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Laboratorium *
            </label>
            <select
              value={formData.lab_id}
              onChange={(e) => setFormData({ ...formData, lab_id: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {labs.length === 0 && <option value="">(Belum ada Laboratorium — tambah di menu Laboratorium)</option>}
              {labs.map(lab => (
                <option key={lab.id} value={lab.id}>{lab.lab_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Semester Praktikum *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hari Pelaksanaan *
              </label>
              <select
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Slot Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jam Mulai Praktikum *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jam Selesai Praktikum *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan / Deskripsi
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi peruntukan modul praktikum..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              onClick={() => setIsOpenModal(false)}
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
              Simpan Mata Kuliah
            </Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
