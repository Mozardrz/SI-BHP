import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/common/Toast';
import { ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
import gedungImg from '../assets/gedung.jpeg';
import logoImg from '../assets/logo1.jpeg';

export const Login = ({ onLoginSuccess }) => {
  const { loginWithCredentials, registerNewAccount } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [toast, setToast] = useState(null);

  // Login States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Register States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regUserType, setRegUserType] = useState('mahasiswa');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginWithCredentials(username, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa kembali username dan password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (!firstName.trim() || !lastName.trim() || !regUsername.trim() || !regPassword.trim()) {
        throw new Error("Semua field pendaftaran wajib diisi.");
      }

      await registerNewAccount({
        first_name: firstName,
        last_name: lastName,
        username: regUsername,
        password: regPassword,
        user_type: regUserType
      });

      // Show success feedback
      setToast({
        type: 'success',
        message: `Akun "${regUsername}" berhasil dibuat! Silakan masuk dengan username Anda.`
      });

      // AUTO REDIRECT BACK TO LOGIN TAB WITH PRE-FILLED USERNAME
      setUsername(regUsername);
      setPassword('');
      setIsRegisterMode(false);

      // Reset reg form
      setFirstName('');
      setLastName('');
      setRegUsername('');
      setRegPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-polbeng-blue/10 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch z-10">

        {/* Left Side: Building Photo */}
        <div className="hidden lg:block lg:col-span-6">
          <div className="relative h-full min-h-[480px] rounded-3xl overflow-hidden shadow-2xl">
            <img src={gedungImg} alt="Politeknik Negeri Bengkalis" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 space-y-1">
              <h1 className="text-4xl font-black text-white leading-tight tracking-tight">SI-BHP</h1>
              <p className="text-slate-100 text-sm font-semibold">(Sistem Informasi Bahan Habis Pakai)</p>
              <p className="text-white text-xl font-bold pt-1">Jurusan Teknik Mesin</p>
              <p className="text-slate-300 text-xs">Politeknik Negeri Bengkalis</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login & Register Card */}
        <div className="lg:col-span-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xl space-y-6">

            {/* Polbeng Logo */}
            <div className="flex flex-col items-center gap-2 -mb-1">
              <img src={logoImg} alt="Logo Politeknik Negeri Bengkalis" className="w-16 h-16 object-contain" />
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  !isRegisterMode
                    ? 'bg-white text-polbeng-blue shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Masuk Akun (Login)
              </button>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  isRegisterMode
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {isRegisterMode ? 'Registrasi Pengguna Baru' : 'Masuk ke Sistem SI-BHP'}
              </h2>
              <p className="text-xs text-slate-500">
                {isRegisterMode
                  ? 'Isi nama, username, dan password untuk mendaftar akun.'
                  : 'Gunakan username dan password Anda untuk masuk ke sistem.'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!isRegisterMode ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-polbeng-blue hover:bg-slate-900 text-white font-bold text-xs transition-all shadow-md shadow-polbeng-blue/20 disabled:opacity-60"
                >
                  <span>{submitting ? 'Memproses...' : 'Masuk Aplikasi SI-BHP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Helper info */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800">Akun Master Admin Awal:</span>
                  <p className="font-mono text-slate-700">Username: <span className="font-bold">admin</span> | Password: <span className="font-bold">admin123</span></p>
                </div>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Budi"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Santoso"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username Unik *
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="budi_santoso"
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daftar Sebagai *
                  </label>
                  <select
                    value={regUserType}
                    onChange={(e) => setRegUserType(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="dosen">Dosen/Tendik</option>
                    <option value="admin">Admin / Teknisi Lab</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/20 disabled:opacity-60"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{submitting ? 'Memproses...' : 'Daftarkan Akun'}</span>
                </button>
              </form>
            )}

          </div>
        </div>

      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
