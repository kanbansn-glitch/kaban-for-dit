import avatarFallback from '../../../assets/img/logo.png';

function Header() {
  return (
    <header className="dash-header">
      <div className="dash-search">
        <span className="dash-search-icon" aria-hidden />
        <input type="search" placeholder="Search product, supplier, order" />
      </div>
      <div className="dash-header-actions">
        <button type="button" className="dash-header-icon" aria-label="Notifications">
          <span className="dash-bell" aria-hidden />
        </button>
        <div className="dash-avatar">
          <img src={avatarFallback} alt="User avatar" />
        </div>
      </div>
    </header>
  );
}

export default Header;
