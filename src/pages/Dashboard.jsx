import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/common/MetricCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Boxes,
  AlertTriangle,
  FileClock,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Wrench
} from 'lucide-react';
import { getMaterials, getRequests, getTransactions } from '../utils/storage';
import { SemesterUsageChart } from '../components/charts/SemesterUsageChart';
import { StockStatusChart } from '../components/charts/StockStatusChart';
import { TopMaterialsChart } from '../components/charts/TopMaterialsChart';
import { formatDate, getRequestStatusBadge } from '../utils/formatters';

export const Dashboard = ({ onNavigate }) => {
  const { currentUser, isAdmin } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [requests, setRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [mats, reqs, txs] = await Promise.all([getMaterials(), getRequests(), getTransactions()]);
        setMaterials(mats);
        setRequests(reqs);
        setTransactions(txs);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const criticalItems = materials.filter(m => m.stock <= m.min_stock);
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');

  // Filter requests for regular users (their own) vs admin (all)
  const displayRequests = isAdmin
    ? requests.slice(0, 5)
    : requests.filter(r => r.user_id === currentUser?.id).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-polbeng-navy via-slate-900 to-polbeng-blue text-white overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>Praktikum Semester Ganjil TA 2026/2027</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
              Selamat datang kembali, {currentUser?.name}!
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {isAdmin
                ? 'Panel Pengelolaan Inventaris Bahan Habis Pakai (BHP) Laboratorium Bengkel Kerja Polbeng. Pantau sisa stok, verifikasi permohonan bahan, dan tinjau riwayat praktikum.'
                : 'Portal Permohonan Bahan Habis Pakai Praktikum Bengkel Kerja. Buat permintaan bahan praktikum dan pantau status persetujuan dari teknisi lab.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin ? (
              <>
                <Button
                  onClick={() => onNavigate('requests')}
                  variant="accent"
                  size="md"
                  icon={FileClock}
                >
                  Verifikasi ({pendingRequests.length})
                </Button>
                <Button
                  onClick={() => onNavigate('materials')}
                  variant="secondary"
                  size="md"
                  icon={Plus}
                >
                  Tambah Stok BHP
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onNavigate('requests')}
                variant="secondary"
                size="lg"
                icon={Plus}
              >
                Buat Permohonan Bahan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {criticalItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent border border-rose-500/30 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">
                Peringatan Dini Stok Kritis! ({criticalItems.length} Jenis Bahan)
              </h4>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                Item seperti <span className="font-semibold">{criticalItems[0]?.material_name}</span> berada pada atau di bawah threshold batas minimum. Segera buat pengadaan reorder.
              </p>
            </div>
          </div>
          <Button
            onClick={() => onNavigate('low-stock')}
            variant="danger"
            size="sm"
            icon={ArrowRight}
          >
            Tinjau Stok Kritis
          </Button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Jenis Bahan (BHP)"
          value={materials.length}
          unit="Item Master"
          icon={Boxes}
          color="blue"
          badgeText="Terdaftar di Lab"
        />
        <MetricCard
          title="Stok Kritis Threshold"
          value={criticalItems.length}
          unit="Bahan"
          icon={AlertTriangle}
          color={criticalItems.length > 0 ? "rose" : "emerald"}
          badgeText={criticalItems.length > 0 ? "Memerlukan Reorder" : "Semua Stok Aman"}
        />
        <MetricCard
          title="Permohonan Awaiting"
          value={pendingRequests.length}
          unit="Permintaan"
          icon={FileClock}
          color="amber"
          badgeText={isAdmin ? "Menunggu Approval" : "Pengajuan Anda"}
        />
        <MetricCard
          title="Total Transaksi Disetujui"
          value={approvedRequests.length}
          unit="Kegiatan"
          icon={CheckCircle2}
          color="emerald"
          badgeText="Praktikum Aktif"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Chart: Semester Breakdown */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-500" />
                <span>Distribusi Bahan & Pemakaian per Semester</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualisasi integrasi mata kuliah praktikum terhadap penggunaan material BHP.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Sem 1 - Sem 6</span>
          </div>

          <SemesterUsageChart materials={materials} requests={requests} />
        </div>

        {/* Side Chart: Stock Health Donut */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Status Keamanan Stok</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rasio persediaan aman vs stok kritis.
            </p>
          </div>

          <StockStatusChart materials={materials} />

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">Catatan Aturan System:</span> Pemotongan stok terjadi secara otomatis saat Admin menekan Approve.
          </div>
        </div>

      </div>

      {/* Lower Grid: Top Materials & Recent Requests Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Used Materials */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>BHP Paling Sering Digunakan</span>
            </h3>
          </div>

          <TopMaterialsChart materials={materials} requests={requests} />
        </div>

        {/* Recent Requests Table */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileClock className="w-4 h-4 text-polbeng-blue dark:text-sky-400" />
                <span>Permohonan Pemakaian Terbaru</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                5 aktivitas pengajuan terakhir dalam laboratorium.
              </p>
            </div>
            <Button
              onClick={() => onNavigate('requests')}
              variant="outline"
              size="sm"
            >
              Lihat Semua
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 rounded-l-lg">Bahan BHP</th>
                  <th className="px-3 py-2.5">Jumlah</th>
                  <th className="px-3 py-2.5">Tgl Prac</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {displayRequests.map((req) => {
                  const mat = materials.find(m => m.id === req.material_id);
                  const badge = getRequestStatusBadge(req.status);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {mat?.material_name || 'Material'}
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300 font-mono">
                        {req.quantity} {mat?.unit}
                      </td>
                      <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                        {formatDate(req.practical_date)}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
