'use client';

import { useEffect, useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@/lib/types';
import { Code2, Palette, Server, Smartphone, Globe, Database } from 'lucide-react';
import styles from './AboutSection.module.css';

const skillIcons: Record<string, React.ReactNode> = {
  'Frontend': <Code2 size={20} />,
  'Backend': <Server size={20} />,
  'Design': <Palette size={20} />,
  'Mobile': <Smartphone size={20} />,
  'DevOps': <Globe size={20} />,
  'Database': <Database size={20} />,
};

const defaultSkills = [
  { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Three.js'] },
  { category: 'Backend', items: ['Node.js', 'Express', 'Python', 'Supabase'] },
  { category: 'Database', items: ['PostgreSQL', 'MongoDB', 'Redis'] },
  { category: 'Mobile', items: ['Flutter', 'React Native'] },
  { category: 'DevOps', items: ['Docker', 'Vercel', 'AWS', 'CI/CD'] },
  { category: 'Design', items: ['Figma', 'Adobe XD', 'UI/UX Design'] },
];

export default function AboutSection() {
  const sectionRef = useScrollAnimation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .single();
      if (data) setUser(data);
    }
    fetchUser();
  }, []);

  const bio = user?.bio ||
    'PINA subholding adalah perusahaan konsultan IT dan pengembangan perangkat lunak yang berfokus pada solusi digital inovatif. Kami menggabungkan keahlian teknis dengan desain kreatif untuk menghadirkan produk digital berkualitas tinggi.';

  return (
    <section id="about" className={`section ${styles.about}`} ref={sectionRef}>
      <div className={`bg-gradient-orb ${styles.orb}`} />

      <div className="container">
        <div className="section-title scroll-animate">
          <h2>Tentang Kami</h2>
          <p>Mengenal lebih dekat PINA subholding dan keahlian yang kami tawarkan</p>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.bioCard} glass-card scroll-animate slide-left`}>
            <div className={styles.bioHeader}>
              <div className={styles.avatar}>
                <span>P</span>
              </div>
              <div>
                <h3>PINA subholding</h3>
                <p className={styles.bioRole}>{user?.profession || 'IT Consultant & Software House'}</p>
              </div>
            </div>
            <p className={styles.bioText}>{bio}</p>

            {user?.social_links && Array.isArray(user.social_links) && (
              <div className={styles.socialLinks}>
                {user.social_links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    title={link.platform}
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className={`${styles.skillsArea} scroll-animate slide-right`}>
            <h3 className={styles.skillsTitle}>Keahlian Kami</h3>
            <div className={styles.skillsGrid}>
              {defaultSkills.map((skill, i) => (
                <div key={skill.category} className={`${styles.skillGroup} stagger-${i + 1}`}>
                  <div className={styles.skillGroupHeader}>
                    {skillIcons[skill.category] || <Code2 size={20} />}
                    <span>{skill.category}</span>
                  </div>
                  <div className={styles.skillTags}>
                    {skill.items.map((item) => (
                      <span key={item} className={styles.skillTag}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
