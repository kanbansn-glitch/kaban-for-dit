import { useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../dashboard/dashboard.css';

function DashboardLayout({ sections, footerSections = [], onLogout, initialActiveId }) {
  const allSections = useMemo(
    () => [...sections, ...footerSections],
    [sections, footerSections],
  );

  const [activeId, setActiveId] = useState(
    () => initialActiveId ?? allSections[0]?.id ?? null,
  );

  const activeSection = useMemo(
    () => allSections.find((section) => section.id === activeId) ?? allSections[0] ?? null,
    [activeId, allSections],
  );

  return (
    <div className="dash-shell">
      <Sidebar
        sections={sections}
        footerSections={footerSections}
        activeId={activeId}
        onSelect={setActiveId}
        onLogout={onLogout}
      />
      <div className="dash-main">
        <Header />
        <div className="dash-content">
          {activeSection ? (
            <div className="dash-section-wrapper">{activeSection.component}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
