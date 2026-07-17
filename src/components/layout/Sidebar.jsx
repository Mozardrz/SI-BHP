import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  FlaskConical,
  BookOpen,
  FileSpreadsheet,
  AlertTriangle,
  History,
  Users
} from 'lucide-react';
import { getMaterials, getRequests } from '../../utils/storage';

export const Sidebar = ({ currentPage, onNavigate }) => {
  const { isAdmin } = useAuth();
  const [criticalCount, setCriticalCount] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  // Refresh badge counts setiap pindah halaman
  useEffect(() => {
    (async () => {
      try {
        const [materials, requests] = await Promise.all([getMaterials(), getRequests()]);
        setCriticalCount(materials.filter(m => m.stock <= m.min_stock).length);
        setPendingRequestCount(requests.filter(r => r.status === 'pending').length);
      } catch (e) { /* koneksi gagal: biarkan badge kosong */ }
    })();
  }, [currentPage]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      roles: ['admin', 'user']
    },
    {
      id: 'materials',
      label: 'Stok Bahan (BHP)',
      icon: Boxes,
      roles: ['admin', 'user']
    },
    {
      id: 'labs',
      label: 'Laboratorium',
      icon: FlaskConical,
      roles: ['admin', 'user']
    },
    {
      id: 'courses',
      label: 'Mata Kuliah Terkait',
      icon: BookOpen,
      roles: ['admin', 'user']
    },
    {
      id: 'requests',
      label: 'Permohonan Bahan',
      icon: FileSpreadsheet,
      badge: pendingRequestCount > 0 ? pendingRequestCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
      roles: ['admin', 'user']
    },
    {
      id: 'low-stock',
      label: 'Peringatan Stok Kritis',
      icon: AlertTriangle,
      badge: criticalCount > 0 ? criticalCount : null,
      badgeColor: 'bg-rose-500 text-white font-bold',
      roles: ['admin', 'user']
    },
    {
      id: 'history',
      label: 'Riwayat & Audit Log',
      icon: History,
      roles: ['admin', 'user']
    },
    {
      id: 'users',
      label: 'Kelola Pengguna',
      icon: Users,
      roles: ['admin']
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Menu Utama
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              if (item.roles && !item.roles.includes(isAdmin ? 'admin' : 'user')) {
                return null;
              }

              const isActive = currentPage === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-polbeng-blue text-white shadow-md shadow-polbeng-blue/20 dark:bg-sky-600 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400 dark:text-sky-200' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Lab Bengkel Kerja © 2026
        </p>
        <p className="text-[9px] text-slate-400 dark:text-slate-600 font-mono mt-0.5">
          Politeknik Negeri Bengkalis
        </p>
      </div>
    </aside>
  );
};
