import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Moon, Sun, Bell, LogOut, User, Shield, Layers, AlertTriangle, CheckCircle } from 'lucide-react';
import { getMaterials, getRequests } from '../../utils/storage';
import logoImg from '../../assets/logo1.jpeg';

export const Navbar = ({ onNavigate, currentPage }) => {
  const { currentUser, logout, darkMode, toggleDarkMode, isAdmin } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [criticalItems, setCriticalItems] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Refresh indikator notifikasi setiap pindah halaman
  useEffect(() => {
    (async () => {
      try {
        const [materials, requests] = await Promise.all([getMaterials(), getRequests()]);
        setCriticalItems(materials.filter(m => m.stock <= m.min_stock));
        setPendingRequests(requests.filter(r => r.status === 'pending'));
      } catch (e) { /* koneksi gagal: biarkan kosong */ }
    })();
  }, [currentPage]);

  const notificationCount = criticalItems.length + (isAdmin ? pendingRequests.length : 0);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Title & Polbeng Identity */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img src={logoImg} alt="Logo Politeknik Negeri Bengkalis" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight font-sans">
                  SI-BHP
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                  v1.1 Polbeng
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                Inventaris Bahan Habis Pakai • Lab Bengkel Kerja
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & User Account Menu */}
        <div className="flex items-center gap-3">
          
          {/* Active Role Indicator Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Shield className={`w-3.5 h-3.5 ${isAdmin ? 'text-amber-500' : 'text-teal-500'}`} />
            <span>Role: {isAdmin ? 'Admin (Teknisi Lab)' : 'User (Mahasiswa/Dosen/Tendik)'}</span>
          </div>

          {/* Dark Mode Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={darkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-slide-down">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifikasi Alert</h4>
                  <span className="text-xs text-slate-500">{notificationCount} item</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {criticalItems.length > 0 && (
                    <div 
                      onClick={() => { onNavigate('low-stock'); setShowNotifications(false); }}
                      className="p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-900/60 cursor-pointer hover:bg-rose-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold text-xs">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{criticalItems.length} Bahan Dalam Stok Kritis!</span>
                      </div>
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                        Sisa stok di bawah batas minimum threshold.
                      </p>
                    </div>
                  )}

                  {isAdmin && pendingRequests.length > 0 && (
                    <div 
                      onClick={() => { onNavigate('requests'); setShowNotifications(false); }}
                      className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-900/60 cursor-pointer hover:bg-amber-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-xs">
                        <Layers className="w-4 h-4 flex-shrink-0" />
                        <span>{pendingRequests.length} Permohonan Menunggu Approval</span>
                      </div>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                        Klik untuk melihat & menyetujui permohonan bahan.
                      </p>
                    </div>
                  )}

                  {notificationCount === 0 && (
                    <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-1">
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                      <span>Semua stok aman & tidak ada request pending.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account Avatar & Dropdown */}
          <div className="relative border-l border-slate-200 dark:border-slate-800 pl-3">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Foto profil" className="w-9 h-9 rounded-xl object-cover shadow" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[130px]">
                  {currentUser?.name || 'Pengguna'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  {currentUser?.role}
                </p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-slide-down">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {currentUser?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {currentUser?.email}
                  </p>
                </div>

                <button
                  onClick={() => { onNavigate('profile'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profil & Pengaturan</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                <button
                  onClick={() => { logout(); setShowProfileMenu(false); onNavigate('login'); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar / Switch Role</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
