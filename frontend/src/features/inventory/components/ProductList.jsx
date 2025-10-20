import { useEffect, useMemo, useState } from 'react';
import { formatUnits } from '../utils';

const STATUS_COLORS = {
  'In stock': 'status-in',
  'Low stock': 'status-low',
  'Out of stock': 'status-out',
};

function classes(...values) {
  return values.filter(Boolean).join(' ');
}

function ProductList({ products, onSelect, selectedId, onOpenModal }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const pageItems = useMemo(
    () => products.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [products, currentPage],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  return (
    <section className="inventory-products">
      <header className="inventory-products-head">
        <h2>Products</h2>
        <div className="inventory-actions">
          <button type="button" className="primary" onClick={onOpenModal}>
            Add Product
          </button>
          <button type="button" className="secondary">Filters</button>
          <button type="button" className="secondary">Download all</button>
        </div>
      </header>

      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Products</th>
            <th>Buying Price</th>
            <th>Quantity</th>
            <th>Threshold Value</th>
            <th>Expiry Date</th>
            <th>Availability</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((product) => (
            <tr
              key={product.id}
              className={classes(product.id === selectedId && 'active')}
              onClick={() => onSelect(product.id)}
            >
              <td>{product.product_code}</td>
              <td>{product.name}</td>
              <td>{product.buying_price_formatted}</td>
              <td>{formatUnits(product.quantity)}</td>
              <td>{formatUnits(product.threshold)}</td>
              <td>{product.expiry_date_formatted}</td>
              <td>
                <span className={`status-pill ${STATUS_COLORS[product.status_label]}`}>
                  {product.status_label}
                </span>
              </td>
            </tr>
          ))}
          {pageItems.length === 0 ? (
            <tr>
              <td colSpan={6} className="inventory-empty">
                Aucun produit pour le moment.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <footer className="inventory-pagination">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        >
          Next
        </button>
      </footer>
    </section>
  );
}

export default ProductList;
