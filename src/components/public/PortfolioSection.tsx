'use client';

import { useState, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { supabase } from '@/lib/supabase/client';
import type { Project } from '@/lib/types';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import styles from './PortfolioSection.module.css';

export default function PortfolioSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const sectionRef = useScrollAnimation([projects, loading]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        // Fetch projects
        const { data: projectsData, error: projError } = await supabase
          .from('projects')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('completion_date', { ascending: false });

        if (projError) throw projError;

        if (projectsData && projectsData.length > 0) {
          // Fetch technologies for all projects
          const { data: ptData } = await supabase
            .from('project_technologies')
            .select('project_id, technology_id, technologies(id, name, icon_url, category)')
            .in('project_id', projectsData.map((p) => p.id));

          // Map technologies to projects
          const projectsWithTech = projectsData.map((project) => ({
            ...project,
            technologies: ptData
              ?.filter((pt) => pt.project_id === project.id)
              .map((pt) => (pt as unknown as { technologies: { id: string; name: string; icon_url: string | null; category: string | null } }).technologies)
              .filter(Boolean) || [],
          }));

          setProjects(projectsWithTech);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return (
    <section id="portfolio" className={`section ${styles.portfolio}`} ref={sectionRef}>
      <div className={`bg-gradient-orb ${styles.orb}`} />

      <div className="container">
        <div className="section-title scroll-animate">
          <h2>Portofolio Proyek</h2>
          <p>Kumpulan proyek terbaik yang telah kami kerjakan dengan penuh dedikasi</p>
        </div>

        {loading ? (
          <div className={styles.loadingGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className={styles.empty}>
            <p>Belum ada proyek yang ditambahkan. Kembali lagi nanti!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}
