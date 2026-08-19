'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

const navLinks = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Tentang Kami', href: '#about' },
  { label: 'Portofolio', href: '#portfolio' },
  { label: 'Pesan Jasa', href: '#order' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const sections = navLinks.map((l) => l.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 150) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`} id="navbar">
      <div className={styles.container}>
        <a href="#hero" className={styles.logo} onClick={(e) => handleNavClick(e, '#hero')}>
          <span className={styles.logoAccent}>PINA</span>
          <span className={styles.logoSub}>subholding</span>
        </a>
        <div className={`${styles.links} ${isMobileOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={`${styles.link} ${activeSection === link.href.slice(1) ? styles.active : ''}`} onClick={(e) => handleNavClick(e, link.href)}>{link.label}</a>
          ))}
        </div>
        <div className={styles.actions}>
          <button className={styles.hamburger} onClick={() => setIsMobileOpen(!isMobileOpen)} aria-label="Toggle menu">{isMobileOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </div>
      {isMobileOpen && <div className={styles.overlay} onClick={() => setIsMobileOpen(false)} />}
    </nav>
  );
}
