'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, Search } from 'lucide-react';
import type { Order } from '@/lib/types';
import styles from '../shared.module.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin-token') : '';

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        window.location.href = '/admin/login';
        return;
      }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) throw new Error('Failed');

      showToast('success', 'Status berhasil diperbarui');
      fetchOrders();

      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, status: status as Order['status'] } : null);
      }
    } catch {
      showToast('error', 'Gagal memperbarui status');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'New': return styles.badgeNew;
      case 'In Progress': return styles.badgeProgress;
      case 'Completed': return styles.badgeCompleted;
      case 'Rejected': return styles.badgeRejected;
      default: return '';
    }
  };

  const filtered = orders.filter((o) =>
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.subject.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className={styles.emptyState}><p>Memuat data...</p></div>;

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h4>Total Pesanan</h4>
          <span className={styles.statValue}>{orders.length}</span>
        </div>
        <div className={styles.statCard}>
          <h4>Pesanan Baru</h4>
          <span className={styles.statValue}>{orders.filter((o) => o.status === 'New').length}</span>
        </div>
        <div className={styles.statCard}>
          <h4>Diproses</h4>
          <span className={styles.statValue}>{orders.filter((o) => o.status === 'In Progress').length}</span>
        </div>
        <div className={styles.statCard}>
          <h4>Selesai</h4>
          <span className={styles.statValue}>{orders.filter((o) => o.status === 'Completed').length}</span>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          <input
            className={styles.searchInput}
            placeholder="Cari pesanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Belum ada pesanan{search ? ` yang cocok dengan "${search}"` : ''}</p>
          </div>
        ) : (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Jenis Jasa</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: '#f0f0f0' }}>{order.customer_name}</td>
                  <td style={{ fontSize: '0.85rem' }}>{order.customer_email}</td>
                  <td>{order.subject}</td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="New">Baru</option>
                      <option value="In Progress">Diproses</option>
                      <option value="Completed">Selesai</option>
                      <option value="Rejected">Ditolak</option>
                    </select>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#888' }}>
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td>
                    <button className={styles.viewBtn} onClick={() => setSelectedOrder(order)}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Detail Pesanan</h2>

            <div className={styles.detailPanel}>
              <div className={styles.detailField}>
                <label>Nama Pelanggan</label>
                <p>{selectedOrder.customer_name}</p>
              </div>
              <div className={styles.detailField}>
                <label>Email</label>
                <p>{selectedOrder.customer_email}</p>
              </div>
              <div className={styles.detailField}>
                <label>Jenis Jasa</label>
                <p>{selectedOrder.subject}</p>
              </div>
              <div className={styles.detailField}>
                <label>Status</label>
                <span className={`${styles.badge} ${getStatusBadgeClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className={styles.detailField}>
                <label>Pesan / Deskripsi Proyek</label>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedOrder.message}</p>
              </div>
              <div className={styles.detailField}>
                <label>Tanggal Pesan</label>
                <p>{new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setSelectedOrder(null)}>Tutup</button>
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
