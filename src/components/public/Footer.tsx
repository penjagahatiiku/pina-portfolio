'use client';

import { Heart } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.logoAccent}>PINA</span>
          <span className={styles.logoSub}>subholding</span>
        </div>
        <p className={styles.copy}>
          © {new Date().getFullYear()} PINA subholding. Dibuat dengan{' '}
          <Heart size={14} className={styles.heart} /> di Indonesia.
        </p>
      </div>
    </footer>
  );
}
