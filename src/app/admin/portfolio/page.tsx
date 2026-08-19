'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import type { Project, Technology } from '@/lib/types';
import styles from '../shared.module.css';

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: '', description: '', thumbnail_url: '', live_demo_url: '',
    github_url: '', is_featured: false, completion_date: '', technology_ids: [] as string[],
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin-token') : '';

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [projRes, techRes] = await Promise.all([
        fetch('/api/admin/projects', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/technologies', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (projRes.status === 401 || techRes.status === 401) {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        window.location.href = '/admin/login';
        return;
      }

      const projData = await projRes.json();
      const techData = await techRes.json();
      setProjects(projData.projects || []);
      setTechnologies(techData.technologies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreateModal = () => {
    setEditProject(null);
    setForm({ title: '', description: '', thumbnail_url: '', live_demo_url: '', github_url: '', is_featured: false, completion_date: '', technology_ids: [] });
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditProject(project);
    setForm({
      title: project.title,
      description: project.description,
      thumbnail_url: project.thumbnail_url || '',
      live_demo_url: project.live_demo_url || '',
      github_url: project.github_url || '',
      is_featured: project.is_featured,
      completion_date: project.completion_date || '',
      technology_ids: project.technologies?.map((t) => t.id) || [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      showToast('error', 'Judul dan deskripsi harus diisi');
      return;
    }

    try {
      const url = editProject
        ? `/api/admin/projects/${editProject.id}`
        : '/api/admin/projects';
      const method = editProject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to save');

      showToast('success', editProject ? 'Proyek berhasil diperbarui' : 'Proyek berhasil ditambahkan');
      setShowModal(false);
      fetchData();
    } catch {
      showToast('error', 'Gagal menyimpan proyek');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus proyek ini?')) return;

    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete');

      showToast('success', 'Proyek berhasil dihapus');
      fetchData();
    } catch {
      showToast('error', 'Gagal menghapus proyek');
    }
  };

  const toggleTech = (id: string) => {
    setForm((prev) => ({
      ...prev,
      technology_ids: prev.technology_ids.includes(id)
        ? prev.technology_ids.filter((t) => t !== id)
        : [...prev.technology_ids, id],
    }));
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className={styles.emptyState}><p>Memuat data...</p></div>;

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h4>Total Proyek</h4>
          <span className={styles.statValue}>{projects.length}</span>
        </div>
        <div className={styles.statCard}>
          <h4>Proyek Unggulan</h4>
          <span className={styles.statValue}>{projects.filter((p) => p.is_featured).length}</span>
        </div>
        <div className={styles.statCard}>
          <h4>Teknologi</h4>
          <span className={styles.statValue}>{technologies.length}</span>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          <input
            className={styles.searchInput}
            placeholder="Cari proyek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button className={styles.addBtn} onClick={openCreateModal}>
          <Plus size={18} /> Tambah Proyek
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Belum ada proyek{search ? ` yang cocok dengan "${search}"` : ''}</p>
          </div>
        ) : (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Judul</th>
                <th>Status</th>
                <th>Teknologi</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id}>
                  <td style={{ fontWeight: 600, color: '#f0f0f0' }}>{project.title}</td>
                  <td>
                    {project.is_featured && (
                      <span className={`${styles.badge} ${styles.badgeFeatured}`}>⭐ Unggulan</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {project.technologies?.slice(0, 3).map((t) => (
                        <span key={t.id} style={{
                          padding: '2px 8px', background: 'rgba(0,192,255,0.1)',
                          borderRadius: 12, fontSize: '0.7rem', color: '#00C0FF'
                        }}>
                          {t.name}
                        </span>
                      ))}
                      {(project.technologies?.length || 0) > 3 && (
                        <span style={{ fontSize: '0.7rem', color: '#666' }}>
                          +{(project.technologies?.length || 0) - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#888' }}>
                    {project.completion_date
                      ? new Date(project.completion_date).toLocaleDateString('id-ID')
                      : '-'}
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.editBtn} onClick={() => openEditModal(project)}>
                        <Pencil size={14} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(project.id)}>
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

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{editProject ? 'Edit Proyek' : 'Tambah Proyek Baru'}</h2>

            <div className={styles.formField}>
              <label>Judul Proyek *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Masukkan judul proyek" />
            </div>

            <div className={styles.formField}>
              <label>Deskripsi *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi detail proyek" />
            </div>

            <div className={styles.formField}>
              <label>Thumbnail URL</label>
              <input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://..." />
            </div>

            <div className={styles.formField}>
              <label>Live Demo URL</label>
              <input value={form.live_demo_url} onChange={(e) => setForm({ ...form, live_demo_url: e.target.value })} placeholder="https://..." />
            </div>

            <div className={styles.formField}>
              <label>GitHub URL</label>
              <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." />
            </div>

            <div className={styles.formField}>
              <label>Tanggal Selesai</label>
              <input type="date" value={form.completion_date} onChange={(e) => setForm({ ...form, completion_date: e.target.value })} />
            </div>

            <div className={styles.checkboxField}>
              <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
              <label htmlFor="is_featured">Tandai sebagai proyek unggulan</label>
            </div>

            <div className={styles.formField}>
              <label>Teknologi</label>
              <div className={styles.techCheckboxes}>
                {technologies.map((tech) => (
                  <label
                    key={tech.id}
                    className={`${styles.techCheckbox} ${form.technology_ids.includes(tech.id) ? styles.selected : ''}`}
                  >
                    <input type="checkbox" checked={form.technology_ids.includes(tech.id)} onChange={() => toggleTech(tech.id)} />
                    {tech.name}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Batal</button>
              <button className={styles.saveBtn} onClick={handleSave}>
                {editProject ? 'Simpan Perubahan' : 'Tambah Proyek'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
