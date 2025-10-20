import { useEffect } from 'react';
import './orderModal.css';

function Select({ label, name, value, onChange, options, placeholder }) {
  return (
    <label className="order-field">
      <span>{label}</span>
      <select name={name} value={value} onChange={onChange}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Input({ label, name, value, onChange, placeholder, type = 'text', readOnly = false }) {
  return (
    <label className="order-field">
      <span>{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </label>
  );
}

function OrderModal({
  form,
  products,
  stores,
  suppliers,
  onClose,
  onChange,
  onSubmit,
  onProductSelect,
}) {
  const isEdit = Boolean(form.id);

  useEffect(() => {
    const selectedProduct = products.find((product) => product.id === Number(form.product_id));
    if (selectedProduct) {
      onProductSelect(selectedProduct, stores);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.product_id]);

  useEffect(() => {
    const price = Number(form.buying_price || 0);
    const quantity = Number(form.quantity || 0);
    if (!Number.isFinite(price) || !Number.isFinite(quantity)) return;

    const value = price * quantity;
    if (Number(form.order_value || 0) !== value) {
      onChange({ target: { name: 'order_value', value: value.toFixed(2) } });
    }
  }, [form.buying_price, form.quantity, onChange, form.order_value]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  const mappedStores = stores.map((store) => ({ id: store.id, name: store.name }));
  const mappedProducts = products.map((product) => ({ id: product.id, name: product.name }));

  return (
    <div className="order-modal-backdrop">
      <form className="order-modal" onSubmit={handleSubmit}>
        <header>
          <h2>{isEdit ? 'Edit Order' : 'New Order'}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="order-modal-body">
          <div className="order-fields">
            <Select
              label="Product Name"
              name="product_id"
              value={form.product_id}
              onChange={onChange}
              options={mappedProducts}
              placeholder="Enter product name"
            />
            <Input
              label="Product ID"
              name="product_code"
              value={form.product_code}
              onChange={onChange}
              placeholder="Enter product ID"
              readOnly
            />
            <Input
              label="Category"
              name="category"
              value={form.category}
              onChange={onChange}
              placeholder="Select product category"
              readOnly
            />
            <Input
              label="Order value"
              name="order_value"
              value={form.order_value}
              onChange={onChange}
              placeholder="Enter order value"
              readOnly
            />
            <Input
              label="Quantity"
              name="quantity"
              value={form.quantity}
              onChange={onChange}
              placeholder="Enter product quantity"
            />
            <Input
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={onChange}
              placeholder="Enter product unit"
            />
            <Input
              label="Buying price"
              name="buying_price"
              value={form.buying_price}
              onChange={onChange}
              placeholder="Enter buying price"
            />
            <Input
              label="Date of delivery"
              name="expected_date"
              value={form.expected_date}
              onChange={onChange}
              placeholder="Enter date of delivery"
              type="date"
            />
            <Select
              label="Deliver to"
              name="store_id"
              value={form.store_id}
              onChange={onChange}
              options={mappedStores}
              placeholder="Select store"
            />
            <Select
              label="Supplier"
              name="supplier_id"
              value={form.supplier_id}
              onChange={onChange}
              options={suppliers.map((supplier) => ({ id: supplier.id, name: supplier.name }))}
              placeholder="Select supplier"
            />
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={onChange}
              options={[
                { id: 'Confirmed', name: 'Confirmed' },
                { id: 'Out for delivery', name: 'Out for delivery' },
                { id: 'Delayed', name: 'Delayed' },
                { id: 'Delivered', name: 'Delivered' },
                { id: 'Returned', name: 'Returned' },
                { id: 'Cancelled', name: 'Cancelled' },
              ]}
              placeholder="Select status"
            />
            <label className="order-checkbox">
              <input
                type="checkbox"
                name="notify_on_delivery"
                checked={form.notify_on_delivery}
                onChange={onChange}
              />
              Notify on the date of delivery
            </label>
          </div>
        </div>

        <footer>
          <button type="button" className="secondary" onClick={onClose}>
            Discard
          </button>
          <button type="submit" className="primary">
            {isEdit ? 'Save Order' : 'Add Order'}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default OrderModal;
