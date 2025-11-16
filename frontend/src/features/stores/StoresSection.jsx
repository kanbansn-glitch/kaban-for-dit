import { useAuth } from '../../hooks/useAuth';
import { useStores } from './useStores';
import StoreModal from './components/StoreModal.jsx';
import './stores.css';

function StoresSection() {
  const { token } = useAuth();
  const {
    stores,
    isLoading,
    isModalOpen,
    form,
    openCreate,
    openEdit,
    closeModal,
    handleChange,
    handleSubmit,
  } = useStores(token);

  return (
    <div className="stores-container">
      <header className="stores-header">
        <h1>Manage Store</h1>
        <button type="button" className="primary" onClick={openCreate}>
          Add Store
        </button>
      </header>

      <section className="stores-list">
        {isLoading ? (
          <div className="stores-empty">Chargement...</div>
        ) : stores.length === 0 ? (
          <div className="stores-empty">No stores yet. Add your first store.</div>
        ) : (
          stores.map((store) => (
            <article key={store.id} className="store-card">
              <div className="store-branch">
                <span>{store.branch_name || store.name}</span>
              </div>
              <div className="store-details">
                <h2>{store.name}</h2>
                <span className="store-metric">
                  {Number(store.product_count ?? 0).toLocaleString('en-IN')}
                  {' '}
                  active products
                </span>
                <span className="store-stock-metric">
                  {Number(store.stock_quantity ?? 0).toLocaleString('en-IN')}
                  {' '}
                  units in stock
                </span>
                {store.address_line ? <p>{store.address_line}</p> : null}
                {store.city || store.postal_code ? (
                  <p>
                    {[store.city, store.postal_code].filter(Boolean).join(' - ')}
                  </p>
                ) : null}
                {store.phone ? <p>{store.phone}</p> : null}
              </div>
              <div className="store-actions">
                <button type="button" className="outline" onClick={() => openEdit(store)}>
                  Edit
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {isModalOpen ? (
        <StoreModal
          form={form}
          onClose={closeModal}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}

export default StoresSection;
