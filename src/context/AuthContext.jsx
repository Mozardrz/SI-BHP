import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { saveUser, updateUserProfile } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Session check: ambil ulang data user dari database agar selalu segar
      const savedUser = localStorage.getItem('sibap_auth_session');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          const { data } = await supabase.from('users').select('*').eq('id', parsed.id).single();
          if (data && data.is_active) {
            setCurrentUser(data);
          } else {
            localStorage.removeItem('sibap_auth_session');
          }
        } catch (e) {
          localStorage.removeItem('sibap_auth_session');
        }
      }

      // Theme preference
      const savedTheme = localStorage.getItem('sibap_theme');
      const isDark = savedTheme === 'dark';
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);

      setLoading(false);
    };
    init();
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    localStorage.setItem('sibap_theme', nextDark ? 'dark' : 'light');
  };

  const loginWithCredentials = async (username, password) => {
    const cleanUsername = username.trim().toLowerCase();
    const { data: matched, error } = await supabase
      .from('users').select('*').eq('username', cleanUsername).single();

    if (error || !matched) {
      throw new Error("Username tidak ditemukan. Silakan daftarkan akun terlebih dahulu.");
    }
    if (matched.password && matched.password !== password) {
      throw new Error("Password yang Anda masukkan salah.");
    }
    if (!matched.is_active) {
      throw new Error("Akun ini telah dinonaktifkan oleh administrator.");
    }

    setCurrentUser(matched);
    localStorage.setItem('sibap_auth_session', JSON.stringify({ id: matched.id }));
    return matched;
  };

  const registerNewAccount = async ({ first_name, last_name, username, password, user_type }) => {
    // mahasiswa & dosen/tendik adalah user biasa; admin/teknisi punya role admin.
    const role = user_type === 'admin' ? 'admin' : 'user';
    const newUser = await saveUser({
      first_name,
      last_name,
      username: username.trim().toLowerCase(),
      password,
      role,
      user_type,
      is_active: true
    });
    return newUser;
  };

  const updateProfile = async (patch) => {
    if (!currentUser) throw new Error("Tidak ada sesi aktif.");
    const updated = await updateUserProfile(currentUser.id, patch);
    setCurrentUser(updated);
    return updated;
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!currentUser) throw new Error("Tidak ada sesi aktif.");
    if (currentUser.password && currentUser.password !== oldPassword) {
      throw new Error("Kata sandi lama yang Anda masukkan salah.");
    }
    return updateProfile({ password: newPassword });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sibap_auth_session');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        darkMode,
        loading,
        toggleDarkMode,
        loginWithCredentials,
        registerNewAccount,
        updateProfile,
        changePassword,
        logout,
        isAdmin: currentUser?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
