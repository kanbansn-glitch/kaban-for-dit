import productPlaceholder from '../../../assets/img/logo.png';
import { formatCurrency, formatDate, formatUnits } from '../utils';

function computeStockMetrics(product) {
  const quantity = Number(product.quantity ?? 0);
  const threshold = Number(product.threshold ?? 0);
  const opening = quantity + Math.round(threshold * 0.5);
  const onTheWay = Math.max(0, Math.round(threshold * 0.6));

  return {
    opening,
    remaining: quantity,
    onTheWay,
    threshold,
  };
}

function computeLocations(product) {
  const quantity = Number(product.quantity ?? 0);
  if (quantity === 0) {
    return [
      { store: 'Main Warehouse', stock: 0 },
      { store: 'Sulur Branch', stock: 0 },
    ];
  }

  const first = Math.max(0, Math.round(quantity * 0.55));
  const second = quantity - first;

  return [
    { store: 'Sulur Branch', stock: first },
    { store: 'Singanallur Branch', stock: second },
  ];
}

function ProductDetail({ product, onBack, onOpenModal, onDelete }) {
  if (!product) {
    return null;
  }

  const metrics = computeStockMetrics(product);
  const locations = computeLocations(product);
  const categoryName = product.category?.name ?? '—';
  const supplierName = product.supplier?.name ?? '—';
  const supplierContact = product.supplier?.contact_number ?? '—';

  return (
    <section className="inventory-detail">
      <header className="inventory-detail-header">
        <div className="inventory-detail-header-main">
          <button type="button" className="inventory-back" onClick={onBack}>
            ← Back to list
          </button>
          <h1>{product.name}</h1>
          <nav aria-label="Product navigation" className="inventory-detail-tabs">
            {['Overview', 'Purchases', 'Adjustments', 'History'].map((tab, idx) => (
              <button key={tab} type="button" className={idx === 0 ? 'active' : ''}>
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="inventory-detail-actions">
          <button type="button" className="outline" onClick={onOpenModal}>
            <span className="icon-pen" aria-hidden />
            Edit
          </button>
          <button type="button" className="solid">
            <span className="icon-download" aria-hidden />
            Download
          </button>
          <button type="button" className="danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </header>

      <div className="inventory-detail-body">
        <div className="inventory-detail-columns">
          <section>
            <h2>Primary Details</h2>
            <dl>
              <div>
                <dt>Product name</dt>
                <dd>{product.name}</dd>
              </div>
              <div>
                <dt>Product ID</dt>
                <dd>{product.product_code}</dd>
              </div>
              <div>
                <dt>Product category</dt>
                <dd>{categoryName}</dd>
              </div>
              <div>
                <dt>Buying Price</dt>
                <dd>{formatCurrency(product.buying_price)}</dd>
              </div>
              <div>
                <dt>Selling Price</dt>
                <dd>{formatCurrency(product.selling_price)}</dd>
              </div>
              <div>
                <dt>Expiry Date</dt>
                <dd>{formatDate(product.expiry_date)}</dd>
              </div>
              <div>
                <dt>Threshold Value</dt>
                <dd>{formatUnits(product.threshold)}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>Supplier Details</h2>
            <dl>
              <div>
                <dt>Supplier name</dt>
                <dd>{supplierName}</dd>
              </div>
              <div>
                <dt>Contact Number</dt>
                <dd>{supplierContact}</dd>
              </div>
            </dl>

            <h2>Stock Locations</h2>
            <table>
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Stock in hand</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.store}>
                    <td>{location.store}</td>
                    <td>
                      <a href="#inventory">{location.stock}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="inventory-detail-stats">
          <div className="inventory-detail-image">
            <img src={product.image_url ?? productPlaceholder} alt={product.name} />
          </div>
          <dl>
            <div>
              <dt>Opening Stock</dt>
              <dd>{formatUnits(metrics.opening)}</dd>
            </div>
              <div>
                <dt>Remaining Stock</dt>
                <dd>{formatUnits(metrics.remaining)}</dd>
              </div>
              <div>
                <dt>On the way</dt>
                <dd>{formatUnits(metrics.onTheWay)}</dd>
              </div>
              <div>
                <dt>Threshold value</dt>
                <dd>{formatUnits(metrics.threshold)}</dd>
              </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}

export default ProductDetail;
