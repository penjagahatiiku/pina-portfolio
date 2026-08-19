'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  ShoppingBag,
  Cpu,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import styles from './admin.module.css';

const navItems = [
  { label: 'Portofolio', href: '/admin/portfolio', icon: <FolderOpen size={20} /> },
  { label: 'Pemesanan', href: '/admin/orders', icon: <ShoppingBag size={20} /> },
  { label: 'Teknologi', href: '/admin/technologies', icon: <Cpu size={20} /> },
  { label: 'Profil', href: '/admin/profile', icon: <User size={20} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setMounted(true);
    if (!isLoginPage) {
      const token = localStorage.getItem('admin-token');
      if (!token) {
        router.push('/admin/login');
      }
    }
  }, [isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    router.push('/admin/login');
  };

  if (!mounted) return null;

  // Login page gets its own layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin-token') : null;
  if (!token) return null;

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <LayoutDashboard size={24} />
            <div>
              <span className={styles.logoAccent}>PINA</span>
              <span className={styles.logoSub}>Admin Panel</span>
            </div>
          </div>
          <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.navActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(item.href);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className={styles.main}>
        <header className={styles.header}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className={styles.pageTitle}>
            {navItems.find((i) => i.href === pathname)?.label || 'Dashboard'}
          </h1>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
