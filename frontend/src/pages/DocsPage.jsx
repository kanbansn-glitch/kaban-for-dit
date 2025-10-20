import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { docsSections, quickFilters } from '../features/docs/docsContent.js';
import './DocsPage.css';

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, term) {
  if (!term) {
    return text;
  }

  const pattern = new RegExp(`(${escapeRegExp(term)})`, 'ig');
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (part.toLowerCase() === term.toLowerCase()) {
      return (
        <mark key={`${part}-${index}`} className="docs-highlight">
          {part}
        </mark>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function collectItemStrings(item) {
  switch (item.type) {
    case 'callout':
      return [item.title, ...(item.body ?? []), item.path ?? ''];
    case 'bullets':
      return [
        item.title,
        ...(item.bullets ?? []).flatMap((bullet) => [
          bullet.label ?? '',
          bullet.description ?? '',
          bullet.path ?? '',
        ]),
      ];
    case 'timeline':
      return [
        item.title,
        ...(item.events ?? []).flatMap((event) => [event.label ?? '', event.detail ?? '', event.path ?? '']),
      ];
    case 'code':
      return [item.title, item.description ?? '', item.code ?? ''];
    case 'steps':
      return [item.title, ...(item.steps ?? [])];
    case 'table':
      return [
        item.title,
        ...(item.headers ?? []),
        ...(item.rows ?? []).flatMap((row) => row),
      ];
    case 'grid':
      return [
        item.title,
        ...(item.columns ?? []).flatMap((col) => [col.heading ?? '', ...(col.points ?? [])]),
      ];
    default:
      return [item.title ?? ''];
  }
}

function collectSectionStrings(section) {
  const base = [section.title, section.summary, section.badge ?? '', section.emoji ?? ''];
  const fromItems = (section.items ?? []).flatMap(collectItemStrings);
  return [...base, ...fromItems].filter(Boolean);
}

function DocsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [expandedSections, setExpandedSections] = useState(() => new Set(docsSections.map((section) => section.id)));
  const [copiedValue, setCopiedValue] = useState(null);
  const copyTimeoutRef = useRef(null);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const sectionTexts = useMemo(() => {
    const map = new Map();
    docsSections.forEach((section) => {
      map.set(section.id, collectSectionStrings(section).map((value) => value.toLowerCase()));
    });
    return map;
  }, []);

  const filteredSections = useMemo(() => {
    return docsSections.filter((section) => {
      const values = sectionTexts.get(section.id) ?? [];

      const matchesSearch =
        !normalizedSearch || values.some((value) => value.includes(normalizedSearch));

      const matchesFilter =
        !activeFilter ||
        activeFilter.matches.some((match) => values.some((value) => value.includes(match.toLowerCase())));

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, normalizedSearch, sectionTexts]);

  const toggleSection = (id) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopy = async (value) => {
    if (!value) {
      return;
    }

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      copyTimeoutRef.current = setTimeout(() => setCopiedValue(null), 2500);
    } catch {
      setCopiedValue('error');
      copyTimeoutRef.current = setTimeout(() => setCopiedValue(null), 2500);
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter((prev) => (prev?.id === filter.id ? null : filter));
  };

  return (
    <div className="docs-root">
      <header className="docs-hero">
        <div className="docs-hero_content">
          <span className="docs-badge">Project Playbook</span>
          <h1>
            Documentation vivante de <span>KANBAN</span>
          </h1>
          <p>
            Retrouvez l’architecture, les flux, les bonnes pratiques de déploiement et les astuces de présentation.
            Cette page est publique et activée via la variable <code>VITE_DOCS_ENABLED</code>.
          </p>
          <div className="docs-cta_row">
            <button type="button" className="docs-cta" onClick={() => navigate('/')}>
              Retourner à l’accueil
            </button>
            <button type="button" className="docs-cta docs-cta--ghost" onClick={() => navigate('/dashboard')}>
              Accéder au tableau de bord
            </button>
          </div>
        </div>
        <div className="docs-hero_meta">
          <div>
            <span className="docs-meta_label">Mise à jour</span>
            <strong>{new Date().toLocaleDateString()}</strong>
          </div>
          <div>
            <span className="docs-meta_label">Sections</span>
            <strong>{docsSections.length}</strong>
          </div>
          <div>
            <span className="docs-meta_label">Mode</span>
            <strong>Lecture interactive</strong>
          </div>
        </div>
      </header>

      <section className="docs-toolbar">
        <div className="docs-search">
          <input
            type="search"
            placeholder="Rechercher un terme, un fichier, un concept…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm ? (
            <button type="button" onClick={() => setSearchTerm('')} className="docs-search-clear">
              Effacer
            </button>
          ) : null}
        </div>
        <div className="docs-filters">
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`docs-filter-chip${activeFilter?.id === filter.id ? ' is-active' : ''}`}
              onClick={() => handleFilterClick(filter)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section className="docs-toc">
        <h2>Sommaire express</h2>
        <nav>
          <ul>
            {docsSections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    const target = document.getElementById(section.id);
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <span aria-hidden>{section.emoji}</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <section className="docs-content">
        {filteredSections.length === 0 ? (
          <div className="docs-empty">
            <p>
              Aucun résultat pour <strong>{searchTerm || activeFilter?.label}</strong>. Essayez un autre mot-clé
              ou désactivez les filtres.
            </p>
          </div>
        ) : (
          filteredSections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <article key={section.id} id={section.id} className="docs-section">
                <header>
                  <button type="button" className="docs-toggle" onClick={() => toggleSection(section.id)}>
                    <span className={`docs-toggle_icon${isExpanded ? ' is-open' : ''}`} aria-hidden>
                      ▶
                    </span>
                    <span className="docs-toggle_meta">
                      <span className="docs-emoji" aria-hidden>
                        {section.emoji}
                      </span>
                      <span className="docs-badge">{section.badge}</span>
                    </span>
                    <h3>{highlightText(section.title, normalizedSearch)}</h3>
                  </button>
                  <p>{highlightText(section.summary, normalizedSearch)}</p>
                </header>
                {isExpanded ? (
                  <div className="docs-section_body">
                    {section.items?.map((item, index) => (
                      <DocsSectionItem
                        key={`${section.id}-${item.title}-${index}`}
                        item={item}
                        searchTerm={normalizedSearch}
                        onCopy={handleCopy}
                        copiedValue={copiedValue}
                      />
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

function DocsSectionItem({ item, searchTerm, onCopy, copiedValue }) {
  switch (item.type) {
    case 'callout':
      return (
        <div className={`docs-callout docs-callout--${item.accent ?? 'default'}`}>
          <h4>{highlightText(item.title, searchTerm)}</h4>
          <ul>
            {(item.body ?? []).map((line, idx) => (
              <li key={idx}>{highlightText(line, searchTerm)}</li>
            ))}
          </ul>
          {item.path ? <DocsPath path={item.path} onCopy={onCopy} copiedValue={copiedValue} /> : null}
        </div>
      );
    case 'bullets':
      return (
        <section className="docs-card">
          <h4>{highlightText(item.title, searchTerm)}</h4>
          <ul className="docs-bullet_list">
            {(item.bullets ?? []).map((bullet, idx) => (
              <li key={idx}>
                <strong>{highlightText(bullet.label ?? '', searchTerm)}</strong>
                <p>{highlightText(bullet.description ?? '', searchTerm)}</p>
                {bullet.path ? <DocsPath path={bullet.path} onCopy={onCopy} copiedValue={copiedValue} /> : null}
              </li>
            ))}
          </ul>
        </section>
      );
    case 'timeline':
      return (
        <section className="docs-timeline">
          <h4>{highlightText(item.title, searchTerm)}</h4>
          <ol>
            {(item.events ?? []).map((event, idx) => (
              <li key={idx}>
                <div className="docs-timeline_header">
                  <span className="docs-timeline_index">{String(idx + 1).padStart(2, '0')}</span>
                  <strong>{highlightText(event.label ?? '', searchTerm)}</strong>
                </div>
                <p>{highlightText(event.detail ?? '', searchTerm)}</p>
                {event.path ? <DocsPath path={event.path} onCopy={onCopy} copiedValue={copiedValue} /> : null}
              </li>
            ))}
          </ol>
        </section>
      );
    case 'code':
      return (
        <section className="docs-code">
          <div className="docs-code_header">
            <h4>{highlightText(item.title, searchTerm)}</h4>
            <span className="docs-code_language">{item.language?.toUpperCase() ?? 'CODE'}</span>
          </div>
          {item.description ? <p>{highlightText(item.description, searchTerm)}</p> : null}
          <pre>
            <code>{item.code}</code>
          </pre>
        </section>
      );
    case 'steps':
      return (
        <section className="docs-steps">
          <h4>{highlightText(item.title, searchTerm)}</h4>
          <ol>
            {(item.steps ?? []).map((step, idx) => (
              <li key={idx}>{highlightText(step, searchTerm)}</li>
            ))}
          </ol>
        </section>
      );
    case 'table':
      return (
        <section className="docs-table">
          <h4>{highlightText(item.title, searchTerm)}</h4>
          <table>
            <thead>
              <tr>
                {(item.headers ?? []).map((header, idx) => (
                  <th key={idx}>{highlightText(header, searchTerm)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(item.rows ?? []).map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx}>{highlightText(cell, searchTerm)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      );
    case 'grid':
      return (
        <section className="docs-grid">
          <h4>{highlightText(item.title, searchTerm)}</h4>
          <div className="docs-grid_columns">
            {(item.columns ?? []).map((column, idx) => (
              <div key={idx} className="docs-grid_col">
                <strong>{highlightText(column.heading ?? '', searchTerm)}</strong>
                <ul>
                  {(column.points ?? []).map((point, pointIdx) => (
                    <li key={pointIdx}>{highlightText(point, searchTerm)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      );
    default:
      return null;
  }
}

function DocsPath({ path, onCopy, copiedValue }) {
  const isCopied = copiedValue === path;
  const copyFailure = copiedValue === 'error';

  return (
    <div className="docs-path">
      <code>{path}</code>
      <button type="button" onClick={() => onCopy(path)}>
        {copyFailure ? 'Erreur copie' : isCopied ? 'Copié !' : 'Copier'}
      </button>
    </div>
  );
}

export default DocsPage;
