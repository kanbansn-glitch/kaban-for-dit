import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchCategories, fetchProducts } from '../inventory/api.js';
import { storesApi } from '../../api/resources.js';
import { useSuppliers } from './useSuppliers.js';
import SupplierModal from './components/SupplierModal.jsx';
import './suppliers.css';

function SuppliersSection() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadMeta() {
      if (!token) return;
      try {
        const [categoriesResponse, storesResponse, productsResponse] = await Promise.all([
          fetchCategories(token),
          storesApi.list(token),
          fetchProducts(token),
        ]);

        if (mounted) {
          setCategories(categoriesResponse?.data ?? categoriesResponse ?? []);
          setStores(storesResponse?.data ?? storesResponse ?? []);
          setProducts(productsResponse?.data ?? productsResponse ?? []);
        }
      } catch {
        // optional metadata, ignore failure
      }
    }

    loadMeta();

    return () => {
      mounted = false;
    };
  }, [token]);

  const metadata = useMemo(() => ({
    categories,
    stores,
    products,
  }), [categories, stores, products]);

  const suppliersHook = useSuppliers(token, metadata);

  const {
    suppliers,
    isLoading,
    isModalOpen,
    form,
    openCreate,
    openEdit,
    closeModal,
    handleChange,
    handleToggleReturn,
    handleSubmit,
  } = suppliersHook;

  return (
    <div className="suppliers-container">
      <header className="suppliers-header">
        <h1>Suppliers</h1>
        <div className="suppliers-actions">
          <button type="button" className="primary" onClick={openCreate}>
            Add Supplier
          </button>
          <button type="button" className="secondary">Filters</button>
          <button type="button" className="secondary">Download all</button>
        </div>
      </header>

      <section className="suppliers-table">
        <table>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Product</th>
              <th>Contact Number</th>
              <th>Email</th>
              <th>Type</th>
              <th>On the way</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  Loading suppliers...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  No suppliers yet.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id} onClick={() => openEdit(supplier)}>
                  <td>{supplier.name}</td>
                  <td>{supplier.product_name || '—'}</td>
                  <td>{supplier.contact_number || '—'}</td>
                  <td>{supplier.email || '—'}</td>
                  <td>
                    <span
                      className={
                        supplier.takes_back_returns ? 'tag tag-success' : 'tag tag-danger'
                      }
                    >
                      {supplier.takes_back_returns ? 'Taking Return' : 'Not Taking Return'}
                    </span>
                  </td>
                  <td>{supplier.on_the_way ?? '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="supplier-eye"
                      aria-label="View supplier"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEdit(supplier);
                      }}
                    >
                      <span aria-hidden>👁</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <footer className="suppliers-pagination">
          <button type="button" className="secondary" disabled>
            Previous
          </button>
          <span>Page 1 of 1</span>
          <button type="button" className="secondary" disabled>
            Next
          </button>
        </footer>
      </section>

      {isModalOpen ? (
        <SupplierModal
          form={form}
          categories={categories}
          stores={stores}
          products={products}
          onClose={closeModal}
          onChange={handleChange}
          onToggleReturn={handleToggleReturn}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}

export default SuppliersSection;
