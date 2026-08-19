'use client';

import { SplineScene } from "@/components/ui/splite";
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const scrollToPortfolio = () => {
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToOrder = () => {
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className={styles.hero}>
      {/* Background decorative orbs */}
      <div className={`bg-gradient-orb ${styles.orb1}`} />
      <div className={`bg-gradient-orb ${styles.orb2}`} />
      <div className={`bg-gradient-orb ${styles.orb3}`} />

      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            <span className={styles.titleLine}>PINA</span>
            <span className={styles.titleAccent}>subholding</span>
          </h1>

          <p className={styles.profession}>
            IT Consultant & Software House
          </p>

          <p className={styles.description}>
            Menghadirkan solusi digital inovatif dengan desain futuristik dan teknologi terdepan.
            Kami membangun pengalaman digital yang memukau.
          </p>

          <div className={styles.cta}>
            <button className="btn btn-primary" onClick={scrollToPortfolio}>
              Lihat Portofolio
              <span>↓</span>
            </button>
            <button className="btn btn-glass" onClick={scrollToOrder}>
              📋 Pesan Jasa
            </button>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>50+</span>
              <span className={styles.statLabel}>Proyek Selesai</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>30+</span>
              <span className={styles.statLabel}>Klien Puas</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>5+</span>
              <span className={styles.statLabel}>Tahun Pengalaman</span>
            </div>
          </div>
        </div>

        <div className={styles.robot} style={{ height: '600px', transform: 'scale(1.3)', transformOrigin: 'center' }}>
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel} />
        </div>
        <span>Scroll ke bawah</span>
      </div>
    </section>
  );
}
