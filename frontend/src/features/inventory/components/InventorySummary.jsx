function InventorySummary({ summary }) {
   
  return (
    <section className="inventory-summary">
      <article>
        <h3>Categories</h3>
        <p>{summary.categoriesCount}</p>
        <span>Last 7 days</span>
      </article>
      <article>
        <h3>Total Products</h3>
        <p>{summary.productsCount}</p>
        <span>Last 7 days</span>
      </article>
      <article>
        <h3>Total Value</h3>
        <p>{summary.revenueEstimate}</p>
        <span>Stock Value</span>
      </article>
      <article>
        <h3>Low Stocks</h3>
        <p>{summary.lowStocks}</p>
        <span>{summary.outOfStock} not in stock</span>
      </article>
    </section>
  );
}

export default InventorySummary;
