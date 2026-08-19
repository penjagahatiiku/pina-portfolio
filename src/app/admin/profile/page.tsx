'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import type { User, SocialLink } from '@/lib/types';
import styles from '../shared.module.css';

export default function AdminProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [bio, setBio] = useState('');
  const [profession, setProfession] = useState('');
  const [email, setEmail] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin-token') : '';

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setBio(data.user.bio || '');
        setProfession(data.user.profession || '');
        setEmail(data.user.email || '');
        setSocialLinks(data.user.social_links || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: user.id,
          bio,
          profession,
          email,
          social_links: socialLinks.filter((l) => l.platform && l.url),
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        window.location.href = '/admin/login';
        return;
      }

      if (!res.ok) throw new Error('Failed');

      showToast('success', 'Profil berhasil diperbarui');
      fetchProfile();
    } catch {
      showToast('error', 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  if (loading) return <div className={styles.emptyState}><p>Memuat data...</p></div>;
  if (!user) return <div className={styles.emptyState}><p>Profil tidak ditemukan</p></div>;

  return (
    <>
      <div style={{ maxWidth: 700 }}>
        <div style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 24, color: '#f0f0f0' }}>Informasi Publik</h3>

          <div className={styles.formField}>
            <label>Username</label>
            <input value={user.username} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>

          <div className={styles.formField}>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@pinasubholding.com" />
          </div>

          <div className={styles.formField}>
            <label>Profesi / Fokus Utama</label>
            <input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="IT Consultant & Software House" />
          </div>

          <div className={styles.formField}>
            <label>Bio / Deskripsi</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Deskripsi tentang PINA subholding..."
              style={{ minHeight: 120 }}
            />
          </div>
        </div>

        <div style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', color: '#f0f0f0' }}>Media Sosial</h3>
            <button onClick={addSocialLink} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', background: 'rgba(0,192,255,0.1)',
              border: '1px solid rgba(0,192,255,0.2)', borderRadius: 8,
              color: '#00C0FF', fontSize: '0.8rem', cursor: 'pointer',
            }}>
              <Plus size={14} /> Tambah
            </button>
          </div>

          {socialLinks.length === 0 ? (
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Belum ada tautan media sosial</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {socialLinks.map((link, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <select
                    value={link.platform}
                    onChange={(e) => updateSocialLink(i, 'platform', e.target.value)}
                    style={{
                      padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                      color: '#f0f0f0', fontSize: '0.85rem', minWidth: 130,
                    }}
                  >
                    <option value="">Platform</option>
                    <option value="GitHub">GitHub</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Website">Website</option>
                  </select>
                  <input
                    value={link.url}
                    onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                    placeholder="https://..."
                    style={{
                      flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                      color: '#f0f0f0', fontSize: '0.85rem',
                    }}
                  />
                  <button onClick={() => removeSocialLink(i)} style={{
                    padding: 6, background: 'none', border: '1px solid rgba(255,71,87,0.2)',
                    borderRadius: 6, color: '#FF4757', cursor: 'pointer',
                  }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={saving} className={styles.saveBtn} style={{ width: '100%', padding: 14 }}>
          <Save size={18} style={{ marginRight: 8, display: 'inline' }} />
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
