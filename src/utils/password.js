// Penyimpanan password: SHA-256 + salt acak per-user, format "sha256$<salt>$<hash>".
// Nilai lama yang masih teks polos tetap terbaca (dibandingkan langsung) dan
// otomatis di-upgrade ke hash saat login berhasil.
// ponytail: hashing di sisi client (bukan bcrypt di server); cukup untuk mencegah
// password terbaca polos di tabel. Upgrade path: Supabase Auth.

const buf2hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

const sha256hex = async (text) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return buf2hex(digest);
};

export const hashPassword = async (password) => {
  const salt = buf2hex(crypto.getRandomValues(new Uint8Array(8)));
  return `sha256$${salt}$${await sha256hex(salt + password)}`;
};

export const isHashed = (stored) => typeof stored === 'string' && stored.startsWith('sha256$');

export const verifyPassword = async (password, stored) => {
  if (!stored) return true; // akun lama tanpa password
  if (!isHashed(stored)) return stored === password; // legacy teks polos
  const [, salt, hash] = stored.split('$');
  return (await sha256hex(salt + password)) === hash;
};
