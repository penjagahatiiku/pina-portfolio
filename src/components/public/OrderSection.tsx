'use client';

import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import type { OrderFormData } from '@/lib/types';
import styles from './OrderSection.module.css';

// Inline SVG icons for social platforms (lucide-react removed brand icons)
const GithubIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);
const LinkedinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);
const XIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.963 6.817H1.684l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);
const InstagramIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const socialLinks = [
  { icon: <GithubIcon />, label: 'GitHub', url: 'https://github.com/pinasubholding' },
  { icon: <LinkedinIcon />, label: 'LinkedIn', url: 'https://linkedin.com/company/pinasubholding' },
  { icon: <XIcon />, label: 'X', url: 'https://twitter.com/pinasubholding' },
  { icon: <InstagramIcon />, label: 'Instagram', url: 'https://instagram.com/pinasubholding' },
  { icon: <span aria-hidden="true">◉</span>, label: 'WhatsApp', url: 'https://wa.me/6281326842285' },
  { icon: <span aria-hidden="true">☎</span>, label: '0813 2684 2285', url: 'tel:+6281326842285' },
];

export default function OrderSection() {
  const sectionRef = useScrollAnimation();
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    customer_email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // Client-side validation
    if (!formData.customer_name || !formData.customer_email || !formData.subject || !formData.message) {
      setStatus('error');
      setErrorMsg('Semua field harus diisi.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customer_email)) {
      setStatus('error');
      setErrorMsg('Format email tidak valid.');
      return;
    }

    try {
      const res = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengirim pesanan');
      }

      setStatus('success');
      setFormData({ customer_name: '', customer_email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  return (
    <section id="order" className={`section ${styles.order}`} ref={sectionRef}>
      <div className={`bg-gradient-orb ${styles.orb1}`} />
      <div className={`bg-gradient-orb ${styles.orb2}`} />

      <div className="container">
        <div className="section-title scroll-animate">
          <h2>Pesan Jasa</h2>
          <p>Punya proyek menarik? Hubungi kami dan wujudkan ide Anda menjadi kenyataan</p>
        </div>

        <div className={styles.grid}>
          <form
            className={`${styles.form} glass-card scroll-animate slide-left`}
            onSubmit={handleSubmit}
          >
            <div className={styles.formGroup}>
              <label htmlFor="customer_name">Nama Lengkap</label>
              <input
                id="customer_name"
                name="customer_name"
                type="text"
                className="input-glass"
                placeholder="Masukkan nama Anda"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="customer_email">Email</label>
              <input
                id="customer_email"
                name="customer_email"
                type="email"
                className="input-glass"
                placeholder="nama@email.com"
                value={formData.customer_email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject">Jenis Jasa</label>
              <select
                id="subject"
                name="subject"
                className="input-glass"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Pilih jenis jasa</option>
                <option value="Website Development">Website Development</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="IT Consulting">IT Consulting</option>
                <option value="Custom Software">Custom Software</option>
                <option value="Maintenance & Support">Maintenance & Support</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Deskripsi Proyek</label>
              <textarea
                id="message"
                name="message"
                className="input-glass"
                placeholder="Ceritakan tentang proyek atau kebutuhan Anda..."
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>

            {status === 'error' && (
              <div className={styles.alert + ' ' + styles.alertError}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {status === 'success' && (
              <div className={styles.alert + ' ' + styles.alertSuccess}>
                <CheckCircle size={18} />
                <span>Pesan berhasil dikirim! Kami akan menghubungi Anda segera.</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'loading'}
              style={{ width: '100%' }}
            >
              {status === 'loading' ? (
                <>Mengirim...</>
              ) : (
                <>
                  <Send size={18} />
                  Kirim Pesan
                </>
              )}
            </button>
          </form>

          <div className={`${styles.info} scroll-animate slide-right`}>
            <div className={`${styles.infoCard} glass-card`}>
              <h3>Mari Bekerja Sama</h3>
              <p>
                Kami siap membantu Anda mewujudkan proyek digital impian.
                Dari konsultasi awal hingga deployment, tim kami akan mendampingi
                setiap langkah perjalanan Anda.
              </p>

              <div className={styles.features}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🚀</span>
                  <div>
                    <h4>Pengerjaan Cepat</h4>
                    <p>Timeline yang realistis dan terukur</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>💡</span>
                  <div>
                    <h4>Solusi Inovatif</h4>
                    <p>Teknologi terdepan untuk hasil terbaik</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🛡️</span>
                  <div>
                    <h4>Garansi Kualitas</h4>
                    <p>Support & maintenance pasca-pengerjaan</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.socialSection}>
              <h4>Hubungi Kami di</h4>
              <div className={styles.socials}>
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    title={link.label}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
