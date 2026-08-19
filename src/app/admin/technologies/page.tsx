'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Technology } from '@/lib/types';
import styles from '../shared.module.css';

const categories = ['Frontend', 'Backend', 'Database', 'Mobile', 'DevOps', 'Design', 'Other'];

export default function AdminTechnologiesPage() {
  const [techs, setTechs] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTech, setEditTech] = useState<Technology | null>(null);
  const [form, setForm] = useState({ name: '', icon_url: '', category: '' });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin-token') : '';

  const fetchTechs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/technologies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      setTechs(data.technologies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchTechs(); }, [fetchTechs]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setEditTech(null);
    setForm({ name: '', icon_url: '', category: '' });
    setShowModal(true);
  };

  const openEdit = (tech: Technology) => {
    setEditTech(tech);
    setForm({ name: tech.name, icon_url: tech.icon_url || '', category: tech.category || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { showToast('error', 'Nama harus diisi'); return; }

    try {
      const method = editTech ? 'PUT' : 'POST';
      const body = editTech ? { id: editTech.id, ...form } : form;

      const res = await fetch('/api/admin/technologies', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        window.location.href = '/admin/login';
        return;
      }

      if (!res.ok) throw new Error('Failed');

      showToast('success', editTech ? 'Teknologi diperbarui' : 'Teknologi ditambahkan');
      setShowModal(false);
      fetchTechs();
    } catch {
      showToast('error', 'Gagal menyimpan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus teknologi ini?')) return;

    try {
      const res = await fetch(`/api/admin/technologies?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        window.location.href = '/admin/login';
        return;
      }

      if (!res.ok) throw new Error('Failed');

      showToast('success', 'Teknologi dihapus');
      fetchTechs();
    } catch {
      showToast('error', 'Gagal menghapus');
    }
  };

  // Group by category
  const grouped = techs.reduce((acc, tech) => {
    const cat = tech.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tech);
    return acc;
  }, {} as Record<string, Technology[]>);

  if (loading) return <div className={styles.emptyState}><p>Memuat data...</p></div>;

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h4>Total Teknologi</h4>
          <span className={styles.statValue}>{techs.length}</span>
        </div>
        <div className={styles.statCard}>
          <h4>Kategori</h4>
          <span className={styles.statValue}>{Object.keys(grouped).length}</span>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div />
        <button className={styles.addBtn} onClick={openCreate}>
          <Plus size={18} /> Tambah Teknologi
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {techs.length === 0 ? (
          <div className={styles.emptyState}><p>Belum ada teknologi</p></div>
        ) : (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {techs.map((tech) => (
                <tr key={tech.id}>
                  <td style={{ fontWeight: 600, color: '#f0f0f0' }}>{tech.name}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', background: 'rgba(0,192,255,0.1)',
                      borderRadius: 12, fontSize: '0.75rem', color: '#00C0FF'
                    }}>
                      {tech.category || 'Other'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.editBtn} onClick={() => openEdit(tech)}>
                        <Pencil size={14} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(tech.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{editTech ? 'Edit Teknologi' : 'Tambah Teknologi'}</h2>
            <div className={styles.formField}>
              <label>Nama *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: React" />
            </div>
            <div className={styles.formField}>
              <label>Kategori</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Pilih kategori</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.formField}>
              <label>Icon URL (opsional)</label>
              <input value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Batal</button>
              <button className={styles.saveBtn} onClick={handleSave}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
