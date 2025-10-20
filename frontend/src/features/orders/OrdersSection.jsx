import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchProducts } from '../inventory/api.js';
import { storesApi, suppliersApi } from '../../api/resources.js';
import { useOrders } from './useOrders.js';
import OrderModal from './components/OrderModal.jsx';
import './orders.css';

function formatCurrency(value) {
  const amountNumber = Number(value ?? 0);
  const amount = Number.isFinite(amountNumber) ? amountNumber : 0;
  return `${amount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA`;
}

function OrdersSection() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!token) return;
      try {
        const [productsRes, storesRes, suppliersRes] = await Promise.all([
          fetchProducts(token),
          storesApi.list(token),
          suppliersApi.list(token),
        ]);

        if (mounted) {
          setProducts(productsRes?.data ?? productsRes ?? []);
          setStores(storesRes?.data ?? storesRes ?? []);
          setSuppliers(suppliersRes?.data ?? suppliersRes ?? []);
        }
      } catch {
        // silent fail, page will show empty
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [token]);

  const ordersHook = useOrders(token);

  const {
    orders,
    isLoading,
    isModalOpen,
    form,
    showHistory,
    openCreate,
    openEdit,
    closeModal,
    toggleHistory,
    handleChange,
    handleSubmit,
    updateStatus,
    setProductData,
  } = ordersHook;

  const totalOrders = useMemo(() => orders.length, [orders]);
  const totalReceived = useMemo(
    () => orders.filter((order) => order.status === 'Delivered').length,
    [orders],
  );
  const totalReturned = useMemo(
    () => orders.filter((order) => order.status === 'Returned').length,
    [orders],
  );
  const onTheWayCount = useMemo(
    () => orders.filter((order) => !['Delivered', 'Returned', 'Cancelled'].includes(order.status)).length,
    [orders],
  );
  const onTheWayValue = useMemo(
    () =>
      orders
        .filter((order) => !['Delivered', 'Returned', 'Cancelled'].includes(order.status))
        .reduce((acc, order) => acc + Number(order.order_value || 0), 0),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    if (showHistory) {
      return orders;
    }
    return orders.filter((order) => ['Confirmed', 'Out for delivery', 'Delayed'].includes(order.status));
  }, [orders, showHistory]);

  return (
    <div className="orders-container">
      <header className="orders-header">
        <div className="orders-summary">
          <div className="summary-card">
            <p>Total Orders</p>
            <h2>{totalOrders}</h2>
            <span>Last 7 days</span>
          </div>
          <div className="summary-card">
            <p>Total Received</p>
            <h2>{totalReceived}</h2>
            <span>
              {formatCurrency(
                orders.reduce(
                  (acc, order) =>
                    acc + (order.status === 'Delivered' ? Number(order.order_value || 0) : 0),
                  0,
                ),
              )}
            </span>
          </div>
          <div className="summary-card">
            <p>Total Returned</p>
            <h2>{totalReturned}</h2>
            <span>
              {formatCurrency(
                orders.reduce(
                  (acc, order) =>
                    acc + (order.status === 'Returned' ? Number(order.order_value || 0) : 0),
                  0,
                ),
              )}
            </span>
          </div>
          <div className="summary-card">
            <p>On the way</p>
            <h2>{onTheWayCount}</h2>
            <span>{formatCurrency(onTheWayValue)}</span>
          </div>
        </div>
        <div className="orders-toolbar">
          <button type="button" className="primary" onClick={openCreate}>
            Add Order
          </button>
          <button type="button" className="secondary">Filters</button>
          <button type="button" className="secondary" onClick={toggleHistory}>
            Order History
          </button>
        </div>
      </header>

      <section className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Products</th>
              <th>Order Value</th>
              <th>Quantity</th>
              <th>Order ID</th>
              <th>Expected Delivery</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="table-empty">
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty">
                  No orders to display.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.product?.name || '—'}</td>
                  <td>{formatCurrency(Number(order.order_value || 0))}</td>
                  <td>
                    {order.quantity} {order.unit || 'Packets'}
                  </td>
                  <td>{order.order_number}</td>
                  <td>{order.expected_date || '—'}</td>
                  <td>
                    <span className={`status-badge status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="orders-row-actions">
                      {order.status !== 'Delivered' && (
                        <button type="button" onClick={() => updateStatus(order, 'Delivered')}>
                          Mark as Delivered
                        </button>
                      )}
                      {order.status !== 'Returned' && (
                        <button type="button" onClick={() => updateStatus(order, 'Returned')}>
                          Mark as Returned
                        </button>
                      )}
                      <button type="button" onClick={() => openEdit(order)}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <footer className="orders-pagination">
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
        <OrderModal
          form={form}
          products={products}
          stores={stores}
          suppliers={suppliers}
          onClose={closeModal}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onProductSelect={setProductData}
        />
      ) : null}
    </div>
  );
}

export default OrdersSection;
