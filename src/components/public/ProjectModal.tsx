'use client';

import { ExternalLink, X } from 'lucide-react';

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);
import type { Project } from '@/lib/types';
import styles from './ProjectModal.module.css';
import { useEffect } from 'react';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>

        <div className={styles.header}>
          <div className={styles.thumbnailArea}>
            {project.thumbnail_url ? (
              <img src={project.thumbnail_url} alt={project.title} className={styles.thumbnail} />
            ) : (
              <div className={styles.placeholderThumb}>
                <span>{project.title.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.body}>
          <h2 className={styles.title}>{project.title}</h2>

          {project.is_featured && (
            <span className={styles.featuredBadge}>⭐ Proyek Unggulan</span>
          )}

          <p className={styles.description}>{project.description}</p>

          {project.technologies && project.technologies.length > 0 && (
            <div className={styles.techSection}>
              <h4>Teknologi</h4>
              <div className={styles.techTags}>
                {project.technologies.map((tech) => (
                  <span key={tech.id} className={styles.techTag}>
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.completion_date && (
            <p className={styles.date}>
              Selesai: {new Date(project.completion_date).toLocaleDateString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          )}

          <div className={styles.actions}>
            {project.live_demo_url && (
              <a
                href={project.live_demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <ExternalLink size={18} />
                Live Demo
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-glass"
              >
                <GithubIcon />
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
