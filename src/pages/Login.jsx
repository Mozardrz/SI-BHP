import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/common/Toast';
import { ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
import gedungImg from '../assets/gedung.jpeg';
import logoImg from '../assets/logo1.jpeg';

export const Login = ({ onLoginSuccess }) => {
  const { loginWithCredentials, registerNewAccount, resetPasswordByEmail } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [toast, setToast] = useState(null);

  // Login States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Register States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regUserType, setRegUserType] = useState('mahasiswa');

  // Reset Password States
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  const switchMode = (next) => { setMode(next); setError(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginWithCredentials(username, password, rememberMe);
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
      if (!firstName.trim() || !lastName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
        throw new Error("Semua field pendaftaran wajib diisi.");
      }
      if (regPassword.length < 8) {
        throw new Error("Password minimal 8 karakter.");
      }

      await registerNewAccount({
        first_name: firstName,
        last_name: lastName,
        username: regUsername,
        email: regEmail,
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
      setMode('login');

      // Reset reg form
      setFirstName('');
      setLastName('');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (!resetUsername.trim() || !resetEmail.trim() || !resetNewPassword.trim()) {
        throw new Error("Semua field wajib diisi.");
      }
      if (resetNewPassword.length < 8) {
        throw new Error("Password baru minimal 8 karakter.");
      }

      await resetPasswordByEmail({
        username: resetUsername,
        email: resetEmail,
        newPassword: resetNewPassword
      });

      setToast({ type: 'success', message: 'Password berhasil di-reset! Silakan masuk dengan password baru Anda.' });
      setUsername(resetUsername);
      setPassword('');
      setMode('login');
      setResetUsername('');
      setResetEmail('');
      setResetNewPassword('');
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
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode !== 'register'
                    ? 'bg-white text-polbeng-blue shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Masuk Akun (Login)
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {mode === 'register' ? 'Registrasi Pengguna Baru' : mode === 'reset' ? 'Reset Password' : 'Masuk ke Sistem SI-BHP'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'register'
                  ? 'Isi nama, username, email, dan password untuk mendaftar akun.'
                  : mode === 'reset'
                  ? 'Masukkan username dan email yang terdaftar pada akun Anda, lalu buat password baru.'
                  : 'Gunakan username dan password Anda untuk masuk ke sistem.'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'login' ? (
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
                  <div className="flex items-center justify-between mt-1.5">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-polbeng-blue focus:ring-teal-500 accent-polbeng-blue"
                      />
                      <span>Ingat saya</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="text-[11px] font-bold text-polbeng-blue hover:underline"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-polbeng-blue hover:bg-slate-900 text-white font-bold text-xs transition-all shadow-md shadow-polbeng-blue/20 disabled:opacity-60"
                >
                  <span>{submitting ? 'Memproses...' : 'Masuk Aplikasi SI-BHP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>
            ) : mode === 'register' ? (
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
                    Email *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Dipakai untuk reset password jika Anda lupa kata sandi.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password * <span className="font-normal text-slate-400">(minimal 8 karakter)</span>
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {regPassword.length > 0 && regPassword.length < 8 && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1">Password kurang dari 8 karakter ({regPassword.length}/8)</p>
                  )}
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
            ) : (
              /* RESET PASSWORD FORM */
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                    placeholder="username akun Anda"
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Terdaftar *
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="email yang dipakai saat daftar"
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Harus sama dengan email yang terdaftar pada akun ini.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password Baru * <span className="font-normal text-slate-400">(minimal 8 karakter)</span>
                  </label>
                  <input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {resetNewPassword.length > 0 && resetNewPassword.length < 8 && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1">Password kurang dari 8 karakter ({resetNewPassword.length}/8)</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-60"
                >
                  <span>{submitting ? 'Memproses...' : 'Reset Password Sekarang'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full text-[11px] font-bold text-slate-500 hover:text-slate-800 py-1"
                >
                  ← Kembali ke halaman masuk
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
