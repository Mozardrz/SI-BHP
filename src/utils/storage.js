import { supabase } from './supabase';
import { hashPassword, isHashed } from './password';

// ============================================================
// SI-BHP data layer — Supabase edition.
// Semua fungsi async; nama & perilaku dipertahankan dari versi
// localStorage supaya perubahan di halaman minimal.
// ============================================================

const throwIf = (error) => {
  if (error) throw new Error(error.message);
};

// LABORATORIUM SERVICES
export const getLabs = async () => {
  const { data, error } = await supabase.from('labs').select('*').order('id');
  throwIf(error);
  return data;
};

export const saveLab = async (labData) => {
  if (!labData.lab_name?.trim()) throw new Error("Nama laboratorium wajib diisi.");
  if (!labData.head_name?.trim()) throw new Error("Nama kepala lab wajib diisi.");

  if (labData.id) {
    const { error } = await supabase.from('labs').update(labData).eq('id', labData.id);
    throwIf(error);
    return labData;
  }
  const newItem = { ...labData, id: `lab-${Date.now()}` };
  const { error } = await supabase.from('labs').insert(newItem);
  throwIf(error);
  return newItem;
};

export const deleteLab = async (id) => {
  const { error } = await supabase.from('labs').delete().eq('id', id);
  throwIf(error);
};

// MATA KULIAH TERKAIT (PRACTICAL COURSES) SERVICES
export const getCourses = async () => {
  const { data, error } = await supabase.from('courses').select('*').order('created_at');
  throwIf(error);
  return data;
};

export const saveCourse = async (courseData) => {
  if (courseData.id) {
    const { error } = await supabase.from('courses').update(courseData).eq('id', courseData.id);
    throwIf(error);
    return courseData;
  }
  const newItem = { ...courseData, id: `mk-${Date.now()}` };
  const { error } = await supabase.from('courses').insert(newItem);
  throwIf(error);
  return newItem;
};

export const deleteCourse = async (id) => {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  throwIf(error);
};

// MATERIALS SERVICES
export const getMaterials = async () => {
  const { data, error } = await supabase.from('materials').select('*').order('no');
  throwIf(error);
  return data;
};

export const saveMaterial = async (materialData) => {
  const numStock = Number(materialData.stock) || 0;
  const numMinStock = Number(materialData.min_stock) || 0;
  if (numStock < 0 || numMinStock < 0) {
    throw new Error("Stok dan batas minimum tidak boleh bernilai negatif.");
  }

  const payload = {
    ...materialData,
    stock: numStock,
    min_stock: numMinStock,
    semester: Number(materialData.semester),
    practical_hours: Number(materialData.practical_hours),
    updated_at: new Date().toISOString()
  };

  if (materialData.id) {
    const { error } = await supabase.from('materials').update(payload).eq('id', materialData.id);
    throwIf(error);
    return payload;
  }

  const { data: maxRow } = await supabase.from('materials').select('no').order('no', { ascending: false }).limit(1);
  const newItem = { ...payload, id: `mat-${Date.now()}`, no: (maxRow?.[0]?.no || 0) + 1 };
  const { error } = await supabase.from('materials').insert(newItem);
  throwIf(error);
  return newItem;
};

export const deleteMaterial = async (id) => {
  const { error } = await supabase.from('materials').delete().eq('id', id);
  throwIf(error);
};

// STOCK TRANSACTIONS & RECORDING
export const getTransactions = async () => {
  const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
  throwIf(error);
  return data;
};

const insertTransaction = async (tx) => {
  const { error } = await supabase.from('transactions').insert({
    id: `tx-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    ...tx
  });
  throwIf(error);
};

// ponytail: update stok dibaca-lalu-ditulis (bukan atomik); guard .gte mencegah
// stok minus. Kalau nanti sering dipakai bersamaan banyak admin, pindah ke RPC.
const changeStock = async (material, delta) => {
  const newStock = material.stock + delta;
  if (newStock < 0) {
    throw new Error(`Stok tidak mencukupi! Sisa stok ${material.material_name} adalah ${material.stock} ${material.unit}.`);
  }
  let q = supabase.from('materials')
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq('id', material.id);
  if (delta < 0) q = q.gte('stock', -delta);
  const { data, error } = await q.select();
  throwIf(error);
  if (!data?.length) throw new Error("Stok berubah saat diproses. Muat ulang lalu coba lagi.");
};

const getMaterialOrThrow = async (id) => {
  const { data, error } = await supabase.from('materials').select('*').eq('id', id).single();
  if (error || !data) throw new Error("Material tidak ditemukan.");
  return data;
};

export const recordIncomingStock = async ({ material_id, quantity, date, recorded_by, note }) => {
  const qty = Number(quantity);
  if (!qty || qty <= 0) throw new Error("Jumlah stok masuk harus lebih dari 0.");

  const mat = await getMaterialOrThrow(material_id);
  await changeStock(mat, qty);
  await insertTransaction({
    material_id,
    type: 'in',
    quantity: qty,
    date: date || new Date().toISOString().split('T')[0],
    recorded_by,
    note: note || 'Stok masuk baru (Pengadaan / Penambahan)'
  });
};

// USAGE REQUESTS & APPROVAL ENGINE
export const getRequests = async () => {
  const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
  throwIf(error);
  return data;
};

const getRequestOrThrow = async (id) => {
  const { data, error } = await supabase.from('requests').select('*').eq('id', id).single();
  if (error || !data) throw new Error("Permohonan tidak ditemukan.");
  return data;
};

export const createUsageRequest = async (requestData) => {
  const qty = Number(requestData.quantity);
  if (!qty || qty <= 0) throw new Error("Jumlah barang yang diminta harus lebih besar dari 0.");

  const mat = await getMaterialOrThrow(requestData.material_id);
  const newRequest = {
    id: `req-${Date.now()}`,
    material_id: requestData.material_id,
    course_id: mat.course_id,
    user_id: requestData.user_id,
    quantity: qty,
    semester: Number(requestData.semester || mat.semester),
    practical_hours: Number(requestData.practical_hours || mat.practical_hours),
    practical_date: requestData.practical_date || new Date().toISOString().split('T')[0],
    status: 'pending',
    admin_note: ''
  };
  const { error } = await supabase.from('requests').insert(newRequest);
  throwIf(error);
  return newRequest;
};

export const approveUsageRequest = async ({ requestId, adminId, adminNote }) => {
  const req = await getRequestOrThrow(requestId);
  if (req.status !== 'pending') throw new Error("Permohonan ini sudah diproses sebelumnya.");

  const mat = await getMaterialOrThrow(req.material_id);
  if (mat.stock < req.quantity) {
    throw new Error(`Stok tidak mencukupi! Sisa stok ${mat.material_name} adalah ${mat.stock} ${mat.unit}, namun permohonan meminta ${req.quantity} ${mat.unit}.`);
  }

  await changeStock(mat, -req.quantity);
  await insertTransaction({
    material_id: req.material_id,
    type: 'out',
    quantity: req.quantity,
    recorded_by: adminId,
    note: `Disetujui untuk permohonan ID: ${req.id}. ${adminNote ? 'Catatan: ' + adminNote : ''}`
  });

  const { error } = await supabase.from('requests')
    .update({ status: 'approved', admin_note: adminNote || 'Disetujui', processed_by: adminId })
    .eq('id', requestId);
  throwIf(error);
  return { success: true };
};

export const rejectUsageRequest = async ({ requestId, adminId, adminNote }) => {
  const req = await getRequestOrThrow(requestId);
  if (req.status !== 'pending') throw new Error("Permohonan ini sudah diproses sebelumnya.");

  const { error } = await supabase.from('requests')
    .update({ status: 'rejected', admin_note: adminNote || 'Permohonan ditolak oleh admin lab.', processed_by: adminId })
    .eq('id', requestId);
  throwIf(error);
  return { success: true };
};

// Hard-delete a request that never touched stock (pending / rejected). Logged to the ledger.
export const deleteUsageRequest = async ({ requestId, adminId, reason }) => {
  if (!reason?.trim()) throw new Error("Alasan penghapusan wajib diisi.");
  const req = await getRequestOrThrow(requestId);
  if (req.status === 'approved') {
    throw new Error("Permohonan yang sudah disetujui tidak boleh dihapus. Gunakan 'Batalkan' agar stok dikembalikan.");
  }

  const { error } = await supabase.from('requests').delete().eq('id', requestId);
  throwIf(error);

  const { data: mat } = await supabase.from('materials').select('unit').eq('id', req.material_id).single();
  await insertTransaction({
    material_id: req.material_id,
    type: 'adjustment',
    quantity: 0,
    recorded_by: adminId,
    note: `Permohonan (${req.status}) ${req.quantity} ${mat?.unit || ''} dihapus oleh admin. Alasan: ${reason.trim()}`
  });
  return { success: true };
};

// Cancel an APPROVED request: return the stock and record a reversal in the ledger.
export const cancelApprovedRequest = async ({ requestId, adminId, reason }) => {
  if (!reason?.trim()) throw new Error("Alasan pembatalan wajib diisi.");
  const req = await getRequestOrThrow(requestId);
  if (req.status !== 'approved') throw new Error("Hanya permohonan berstatus Disetujui yang dapat dibatalkan.");

  const mat = await getMaterialOrThrow(req.material_id);
  await changeStock(mat, req.quantity);
  await insertTransaction({
    material_id: req.material_id,
    type: 'in',
    quantity: req.quantity,
    recorded_by: adminId,
    note: `Pembatalan permohonan disetujui — pengembalian stok ${req.quantity} ${mat.unit || ''}. Alasan: ${reason.trim()}`
  });

  const { error } = await supabase.from('requests')
    .update({ status: 'cancelled', admin_note: `Dibatalkan: ${reason.trim()}`, processed_by: adminId })
    .eq('id', requestId);
  throwIf(error);
  return { success: true };
};

// USER MANAGEMENT SERVICES (USERNAME BASED)
export const getUsers = async () => {
  const { data, error } = await supabase.from('users').select('*').order('created_at');
  throwIf(error);
  return data;
};

export const saveUser = async (userData) => {
  // Only derive name from first/last when those parts are supplied (registration);
  // admin-created users pass `name` directly and must not be overwritten.
  const hasParts = userData.first_name !== undefined || userData.last_name !== undefined;
  const derivedName = hasParts
    ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
    : (userData.name || '');

  // Password selalu disimpan sebagai hash
  if (userData.password && !isHashed(userData.password)) {
    userData = { ...userData, password: await hashPassword(userData.password) };
  }

  if (userData.id) {
    const payload = { ...userData, name: derivedName || userData.name };
    const { error } = await supabase.from('users').update(payload).eq('id', userData.id);
    throwIf(error);
    return payload;
  }

  const newUser = {
    ...userData,
    id: `usr-${Date.now()}`,
    name: derivedName || userData.name || 'Pengguna',
    is_active: true
  };
  const { error } = await supabase.from('users').insert(newUser);
  if (error?.message?.includes('users_username_key')) {
    throw new Error("Username ini sudah digunakan. Silakan pilih username lain.");
  }
  throwIf(error);
  return newUser;
};

export const updateUserProfile = async (userId, patch) => {
  const { data: current, error: e1 } = await supabase.from('users').select('*').eq('id', userId).single();
  if (e1 || !current) throw new Error("Pengguna tidak ditemukan.");

  if (patch.password && !isHashed(patch.password)) {
    patch = { ...patch, password: await hashPassword(patch.password) };
  }
  const merged = { ...current, ...patch };
  if (patch.first_name !== undefined || patch.last_name !== undefined) {
    merged.name = `${merged.first_name || ''} ${merged.last_name || ''}`.trim() || merged.name;
  }
  const { error } = await supabase.from('users').update(merged).eq('id', userId);
  throwIf(error);
  return merged;
};

export const toggleUserStatus = async (userId) => {
  const { data: usr, error: e1 } = await supabase.from('users').select('is_active').eq('id', userId).single();
  if (e1 || !usr) throw new Error("Pengguna tidak ditemukan.");
  const { error } = await supabase.from('users').update({ is_active: !usr.is_active }).eq('id', userId);
  throwIf(error);
};
