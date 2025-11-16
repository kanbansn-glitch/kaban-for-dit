import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/resources.js';
import { useAuth } from '../../hooks/useAuth';
import './dashboard.css';

function roundToTwo(value) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return Math.round(number * 100) / 100;
}

function formatCurrency(value) {
  const amount = roundToTwo(value);
  return `${amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} FCFA`;
}

function StatCard({ icon, label, value, sublabel }) {
  return (
    <div className="dash-card">
      <div className="dash-card-icon" aria-hidden>
        <i className={`bx ${icon}`} />
      </div>
      <div className="dash-card-body">
        <span>{label}</span>
        <strong>{value}</strong>
        {sublabel ? <small>{sublabel}</small> : null}
      </div>
    </div>
  );
}

function SalesPurchaseChart({ data }) {
  if (!data.length) return null;
  const maxValue = Math.max(...data.map((item) => Math.max(item.revenue, item.cost, item.profit)), 1);

  return (
    <div className="chart-bar">
      {data.map((item) => {
        const revenueHeight = (item.revenue / maxValue) * 140;
        const costHeight = (item.cost / maxValue) * 140;
        return (
          <div key={item.month} className="chart-bar__col">
            <div className="chart-bar__bars" aria-hidden>
              <span className="bar bar-blue" style={{ height: `${revenueHeight}px` }} />
              <span className="bar bar-green" style={{ height: `${costHeight}px` }} />
            </div>
            <p>{item.month}</p>
          </div>
        );
      })}
    </div>
  );
}

function OrderSummaryChart({ data }) {
  if (!data.length) return null;
  const width = 420;
  const height = 160;
  const topMargin = 20;
  const bottomMargin = 20;
  const chartHeight = height - topMargin - bottomMargin;
  const pointsCount = data.length - 1 || 1;

  const allValues = data.flatMap((item) => [Number(item.ordered ?? 0), Number(item.delivered ?? 0)]);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(0, ...allValues, 1);
  const range = maxValue - minValue || 1;

  const getY = (value) => {
    const normalized = (value - minValue) / range;
    return topMargin + (1 - normalized) * chartHeight;
  };

  const zeroY = getY(0);

  const points = (key) =>
    data.map((item, index) => {
      const x = (index / pointsCount) * (width - 40) + 20;
      const y = getY(Number(item[key] ?? 0));
      return `${x},${y}`;
    });

  return (
    <svg className="chart-line" width={width} height={height} role="img">
      <line x1={20} x2={width - 20} y1={zeroY} y2={zeroY} className="line zero" />
      <polyline points={points('ordered').join(' ')} className="line line-blue" />
      <polyline points={points('delivered').join(' ')} className="line line-orange" />
      {data.map((item, index) => {
        const x = (index / pointsCount) * (width - 40) + 20;
        const yOrdered = getY(Number(item.ordered ?? 0));
        const yDelivered = getY(Number(item.delivered ?? 0));
        return (
          <g key={item.month}>
            <circle cx={x} cy={yOrdered} r={4} className="dot dot-blue" />
            <circle cx={x} cy={yDelivered} r={4} className="dot dot-orange" />
            <text x={x} y={height - 4} className="chart-label">
              {item.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ListCard({ title, linkLabel, children }) {
  return (
    <div className="dash-panel">
      <header>
        <h3>{title}</h3>
        <button type="button">{linkLabel}</button>
      </header>
      <div className="dash-panel-body">{children}</div>
    </div>
  );
}

function DashboardSection() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await dashboardApi.summary(token);
        if (mounted) {
          setData(response?.data ?? response ?? null);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const salesOverview = data?.sales_overview ?? {};
  const purchaseOverview = data?.purchase_overview ?? {};
  const inventorySummary = data?.inventory_summary ?? {};
  const productSummary = data?.product_summary ?? {};
  const salesPurchaseChart = data?.sales_purchase_chart ?? [];
  const orderSummaryChart = data?.order_summary_chart ?? [];
  const topSelling = data?.top_selling_products ?? [];
  const lowQuantity = data?.low_quantity_products ?? [];

  if (isLoading) {
    return <div className="dash-loader">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-root">
      <section className="dashboard-panels">
        <StatCard icon="bx-credit-card" label="Sales" value={salesOverview.sales ?? 0} sublabel="Sales" />
        <StatCard
          icon="bx-trending-up"
          label="Revenue"
          value={formatCurrency(salesOverview.revenue ?? 0)}
          sublabel="Revenue"
        />
        <StatCard
          icon="bx-wallet"
          label="Profit"
          value={formatCurrency(salesOverview.profit ?? 0)}
          sublabel="Profit"
        />
        <StatCard
          icon="bx-purchase-tag"
          label="Cost"
          value={formatCurrency(salesOverview.cost ?? 0)}
          sublabel="Cost"
        />
      </section>

      <section className="dashboard-panels">
        <StatCard
          icon="bx-cart"
          label="Purchase"
          value={purchaseOverview.count ?? 0}
          sublabel="Last 7 days"
        />
        <StatCard
          icon="bx-money"
          label="Cost"
          value={formatCurrency(purchaseOverview.cost ?? 0)}
          sublabel="Last 7 days"
        />
        <StatCard
          icon="bx-x-circle"
          label="Cancel"
          value={purchaseOverview.cancelled ?? 0}
          sublabel="Orders"
        />
        <StatCard
          icon="bx-undo"
          label="Return"
          value={formatCurrency(purchaseOverview.returned_cost ?? 0)}
          sublabel="Cost"
        />
      </section>

      <section className="dashboard-panels">
        <StatCard
          icon="bx-box"
          label="Quantity in Hand"
          value={inventorySummary.quantity_in_hand ?? 0}
          sublabel="Current Stock"
        />
        <StatCard
          icon="bx-truck"
          label="To be received"
          value={inventorySummary.to_be_received ?? 0}
          sublabel="Ordered"
        />
        <StatCard
          icon="bx-user-plus"
          label="Suppliers"
          value={productSummary.suppliers ?? 0}
          sublabel="Number of Suppliers"
        />
        <StatCard
          icon="bx-category"
          label="Categories"
          value={productSummary.categories ?? 0}
          sublabel="Number of Categories"
        />
      </section>

      <div className="dashboard-grid">
        <div className="dash-panel large">
          <header>
            <h3>Sales &amp; Purchase</h3>
            <button type="button">Weekly</button>
          </header>
          <div className="dash-panel-body">
            <SalesPurchaseChart data={salesPurchaseChart} />
          </div>
        </div>

        <div className="dash-panel">
          <header>
            <h3>Order Summary</h3>
          </header>
          <div className="dash-panel-body">
            <OrderSummaryChart data={orderSummaryChart} />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <ListCard title="Top Selling Stock" linkLabel="See All">
          <table className="mini-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Sold Quantity</th>
                <th>Remaining Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {topSelling.map((item) => (
                <tr key={item.product_id}>
                  <td>{item.name}</td>
                  <td>{item.sold_quantity}</td>
                  <td>{item.remaining_quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ListCard>

        <ListCard title="Low Quantity Stock" linkLabel="See All">
          <ul className="stock-list">
            {lowQuantity.map((item) => (
              <li key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>Remaining Quantity : {item.remaining_quantity}</span>
                </div>
                <span className={`pill ${item.status === 'Low' ? 'pill-warning' : 'pill-danger'}`}>
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </ListCard>
      </div>
    </div>
  );
}

export default DashboardSection;
