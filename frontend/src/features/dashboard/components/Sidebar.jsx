import logo from '../../../assets/img/logo.png';
import {
  DashboardIcon,
  InventoryIcon,
  ReportsIcon,
  SuppliersIcon,
  OrdersIcon,
  StoreIcon,
  SettingsIcon,
  LogoutIcon,
} from '../icons.jsx';

const iconLibrary = {
  dashboard: DashboardIcon,
  inventory: InventoryIcon,
  reports: ReportsIcon,
  suppliers: SuppliersIcon,
  orders: OrdersIcon,
  manage_store: StoreIcon,
  settings: SettingsIcon,
  logout: LogoutIcon,
};

function Sidebar({ sections, footerSections = [], activeId, onSelect, onLogout }) {
  const renderItem = (section, variant = 'default') => {
    const Icon = iconLibrary[section.icon] ?? DashboardIcon;
    const isActive = section.id === activeId;

    return (
      <button
        key={`${variant}-${section.id}`}
        type="button"
        className={`dash-nav-item ${isActive ? 'active' : ''}`}
        onClick={() => onSelect(section.id)}
      >
        <Icon aria-hidden />
        <span>{section.label}</span>
      </button>
    );
  };

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-brand">
        <img src={logo} alt="Kanban logo" />
        <span>KANBAN</span>
      </div>

      <nav className="dash-sidebar-nav">
        {sections.map((section) => renderItem(section))}
      </nav>

      <div className="dash-sidebar-footer">
        {footerSections.map((section) => renderItem(section, 'footer'))}
        <button type="button" className="dash-nav-item" onClick={onLogout}>
          <LogoutIcon aria-hidden />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
