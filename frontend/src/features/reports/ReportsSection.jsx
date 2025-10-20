import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { reportsApi } from '../../api/resources.js';
import './reports.css';

function formatCurrency(value) {
  const amount = Number(value ?? 0);
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

function StatCard({ label, hint, value, accent }) {
  return (
    <li className="reports-stat">
      <span className="reports-stat-label">{label}</span>
      <strong className={`reports-stat-value ${accent ? `accent-${accent}` : ''}`}>
        {value}
      </strong>
      {hint ? <span className="reports-stat-hint">{hint}</span> : null}
    </li>
  );
}

function OverviewCard({ data }) {
  return (
    <section className="reports-card">
      <header className="reports-card-header">
        <h3>Overview</h3>
      </header>
      <ul className="reports-stat-grid">
        <StatCard label="Total Profit" value={formatCurrency(data?.total_profit)} />
        <StatCard label="Revenue" value={formatCurrency(data?.revenue)} accent="orange" />
        <StatCard label="Sales" value={formatCurrency(data?.sales_cost)} accent="purple" />
        <StatCard label="Net purchase value" value={formatCurrency(data?.net_purchase_value)} />
        <StatCard label="Net sales value" value={formatCurrency(data?.net_sales_value)} />
        <StatCard label="MoM Profit" value={formatCurrency(data?.mom_profit)} />
        <StatCard label="YoY Profit" value={formatCurrency(data?.yoy_profit)} />
      </ul>
    </section>
  );
}

function BestCategories({ items }) {
  return (
    <section className="reports-card">
      <header className="reports-card-header">
        <h3>Best selling category</h3>
        <button type="button">See All</button>
      </header>
      <table className="reports-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Turn Over</th>
            <th>Increase By</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.category}>
              <td>{item.category}</td>
              <td>{formatCurrency(item.turnover)}</td>
              <td className={item.increase_percentage >= 0 ? 'positive' : 'negative'}>
                {item.increase_percentage != null
                  ? `${item.increase_percentage.toFixed(1)}%`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ProfitVsRevenueChart({ data }) {
  if (!data.length) {
    return (
      <section className="reports-card wide">
        <header className="reports-card-header">
          <h3>Profit &amp; Revenue</h3>
          <button type="button" className="reports-chip">Weekly</button>
        </header>
        <div className="reports-chart-empty">No data available.</div>
      </section>
    );
  }

  const maxValue = Math.max(...data.map((item) => Math.max(item.revenue, item.profit)), 1);
  const highlight = data[data.length - 2] ?? data[data.length - 1];

  const points = (key) => data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - (item[key] / maxValue) * 80;
    return `${x},${y}`;
  }).join(' ');

  const highlightIndex = data.findIndex((item) => item.month === highlight?.month);
  const highlightX = highlightIndex >= 0
    ? (highlightIndex / (data.length - 1 || 1)) * 100
    : 0;
  const highlightY = highlight
    ? 100 - (highlight.revenue / maxValue) * 80
    : 0;

  return (
    <section className="reports-card wide">
      <header className="reports-card-header">
        <h3>Profit &amp; Revenue</h3>
        <button type="button" className="reports-chip">Weekly</button>
      </header>

      <div className="reports-chart">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline className="line profit" points={points('profit')} />
          <polyline className="line revenue" points={points('revenue')} />

          <line className="guide-line" x1={highlightX} x2={highlightX} y1={highlightY} y2={100} />
          <circle className="guide-dot" cx={highlightX} cy={highlightY} r="1.8" />
        </svg>

        {highlight ? (
          <div className="reports-tooltip" style={{ left: `${highlightX}%`, top: `${highlightY}%` }}>
            <span>This Month</span>
            <strong>{formatCurrency(highlight.revenue)}</strong>
            <small>{highlight.month}</small>
          </div>
        ) : null}

        <div className="reports-chart-legend">
          <span><i className="dot revenue" />Revenue</span>
          <span><i className="dot profit" />Profit</span>
        </div>
      </div>
    </section>
  );
}

function BestProducts({ items }) {
  return (
    <section className="reports-card wide">
      <header className="reports-card-header">
        <h3>Best selling product</h3>
        <button type="button">See All</button>
      </header>

      <table className="reports-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Product ID</th>
            <th>Category</th>
            <th>Remaining Quantity</th>
            <th>Turn Over</th>
            <th>Increase By</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.product_id}>
              <td>{item.product}</td>
              <td>{item.product_code || item.product_id}</td>
              <td>{item.category}</td>
              <td>{item.remaining_quantity}</td>
              <td>{formatCurrency(item.turnover)}</td>
              <td className={item.increase_percentage >= 0 ? 'positive' : 'negative'}>
                {item.increase_percentage != null
                  ? `${item.increase_percentage.toFixed(1)}%`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ReportsSection() {
  const { token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadReports() {
      if (!token) return;
      setIsLoading(true);
      try {
        const [overviewRes, categoriesRes, chartRes, productsRes] = await Promise.all([
          reportsApi.overview(token),
          reportsApi.bestCategories(token),
          reportsApi.profitVsRevenue(token),
          reportsApi.bestProducts(token),
        ]);

        if (!mounted) return;

        const mapResponse = (response) => response?.data ?? response ?? null;

        setOverview(mapResponse(overviewRes));
        setCategories(mapResponse(categoriesRes) ?? []);
        setChartData(mapResponse(chartRes) ?? []);
        setProducts(mapResponse(productsRes) ?? []);
      } catch {
        // Silently fail; layout will show empty states.
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadReports();

    return () => {
      mounted = false;
    };
  }, [token]);

  const memoCategories = useMemo(
    () => categories.slice(0, 3),
    [categories],
  );

  const memoProducts = useMemo(
    () => products.slice(0, 4),
    [products],
  );

  if (isLoading) {
    return <div className="reports-loader">Loading reports…</div>;
  }

  return (
    <div className="reports-grid">
      <div className="reports-row">
        <OverviewCard data={overview} />
        <BestCategories items={memoCategories} />
      </div>

      <ProfitVsRevenueChart data={chartData} />

      <BestProducts items={memoProducts} />
    </div>
  );
}

export default ReportsSection;
