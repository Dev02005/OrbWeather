import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { matchRoute } from '../../routes';
import './Standalone.css';

export interface PageSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface StandaloneLayoutProps {
  title: string;
  /** Shown as "Last updated: …" under the title. */
  updated?: string;
  intro?: ReactNode;
  /** Numbered in order, with a table of contents above them. */
  sections?: PageSection[];
  children?: ReactNode;
}

const FOOTER_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Usage' },
  { href: '/contact', label: 'Contact' },
];

/**
 * The frame for pages that render outside the dashboard (privacy, terms,
 * contact). They are often opened directly from a search result or a shared
 * link, so each carries its own way back into the app and to its sibling pages.
 */
export function StandaloneLayout({ title, updated, intro, sections = [], children }: StandaloneLayoutProps) {
  const currentPath = matchRoute(window.location.pathname).path;

  return (
    <div className="legal-page">
      <header className="legal-header">
        <a href="/" className="legal-brand">OrbWeather</a>
        <a href="/" className="legal-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to app
        </a>
      </header>

      <main className="standalone-container">
        <h1 className="standalone-title">{title}</h1>
        {updated && <p className="standalone-updated">Last updated: {updated}</p>}

        <div className="standalone-content">
          {intro}

          {sections.length > 0 && (
            <nav className="legal-toc" aria-labelledby="legal-toc-title">
              <h2 id="legal-toc-title" className="legal-toc-title">On this page</h2>
              <ol>
                {sections.map(section => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="legal-section" aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>
                {index + 1}. {section.title}
              </h2>
              {section.content}
            </section>
          ))}

          {children}
        </div>
      </main>

      <footer className="legal-footer">
        <nav className="legal-footer-links" aria-label="Site pages">
          {FOOTER_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              aria-current={currentPath === link.href ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <p>© {new Date().getFullYear()} OrbWeather</p>
      </footer>
    </div>
  );
}
