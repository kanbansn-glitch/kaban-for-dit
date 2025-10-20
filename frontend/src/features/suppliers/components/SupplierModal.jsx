import './supplierModal.css';

function TextInput({ label, name, value, onChange, placeholder, type = 'text', readOnly = false }) {
  return (
    <label className="supplier-field">
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

function SelectInput({ label, name, value, onChange, options, placeholder, disabled = false }) {
  return (
    <label className="supplier-field">
      <span>{label}</span>
      <select name={name} value={value} onChange={onChange} disabled={disabled}>
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

function ToggleButtons({ value, onToggle }) {
  return (
    <div className="supplier-toggle">
      <button
        type="button"
        className={!value ? 'active' : ''}
        onClick={() => onToggle(false)}
      >
        Not taking return
      </button>
      <button type="button" className={value ? 'active' : ''} onClick={() => onToggle(true)}>
        Taking return
      </button>
    </div>
  );
}

function SupplierModal({ form, categories, stores, products = [], onClose, onChange, onToggleReturn, onSubmit }) {
  const isEdit = Boolean(form.id);
  const isExistingProduct = Boolean(form.existing_product_id);

  const productOptions = products.map((product) => ({
    id: String(product.id),
    name: product.product_code ? `${product.name} · ${product.product_code}` : product.name,
  }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="supplier-modal-backdrop">
      <form className="supplier-modal" onSubmit={handleSubmit}>
        <header>
          <h2>{isEdit ? 'Edit Supplier' : 'New Supplier'}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="supplier-modal-body">
          <div className="supplier-modal-image">
            <div className="supplier-avatar" aria-hidden />
            <p>Drag image here</p>
            <button type="button">Browse image</button>
          </div>

          <div className="supplier-modal-grid">
            <SelectInput
              label="Link Existing Product"
              name="existing_product_id"
              value={form.existing_product_id}
              onChange={onChange}
              options={productOptions}
              placeholder="Select product to link (optional)"
            />
            {isExistingProduct ? (
              <p className="supplier-hint">Product details are locked while a product is linked. Clear the selection to enter custom details.</p>
            ) : null}
            <TextInput
              label="Supplier Name"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Enter supplier name"
            />
            <TextInput
              label="Product"
              name="product_name"
              value={form.product_name}
              onChange={onChange}
              placeholder="Enter product"
              readOnly={isExistingProduct}
            />
            <SelectInput
              label="Category"
              name="category_id"
              value={form.category_id}
              onChange={onChange}
              options={categories}
              placeholder="Select product category"
              disabled={isExistingProduct}
            />
            <TextInput
              label="Buying Price"
              name="buying_price"
              value={form.buying_price}
              onChange={onChange}
              placeholder="Enter buying price"
              readOnly={isExistingProduct}
            />
            <TextInput
              label="Selling Price"
              name="selling_price"
              value={form.selling_price}
              onChange={onChange}
              placeholder="Enter selling price"
              readOnly={isExistingProduct}
            />
            <TextInput
              label="Product ID"
              name="product_code"
              value={form.product_code}
              onChange={onChange}
              placeholder="Enter product ID"
              readOnly={isExistingProduct}
            />
            <TextInput
              label="Quantity"
              name="quantity"
              value={form.quantity}
              onChange={onChange}
              placeholder="Enter product quantity"
              readOnly={isExistingProduct}
            />
            <TextInput
              label="Threshold Value"
              name="threshold"
              value={form.threshold}
              onChange={onChange}
              placeholder="Enter threshold value"
              readOnly={isExistingProduct}
            />
            <TextInput
              label="Expiry Date"
              name="expiry_date"
              value={form.expiry_date}
              onChange={onChange}
              placeholder="Enter expiry date"
              readOnly={isExistingProduct}
            />
            <SelectInput
              label="Store"
              name="store_id"
              value={form.store_id}
              onChange={onChange}
              options={stores}
              placeholder="Select store"
              disabled={isExistingProduct}
            />
            <TextInput
              label="Contact Number"
              name="contact_number"
              value={form.contact_number}
              onChange={onChange}
              placeholder="Enter supplier contact number"
            />
            <TextInput
              label="Email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="Enter supplier email"
            />
            <TextInput
              label="Address"
              name="address"
              value={form.address}
              onChange={onChange}
              placeholder="Enter supplier address"
            />
            <div className="supplier-field">
              <span>Type</span>
              <ToggleButtons value={form.takes_back_returns} onToggle={onToggleReturn} />
            </div>
          </div>
        </div>

        <footer>
          <button type="button" className="secondary" onClick={onClose}>
            Discard
          </button>
          <button type="submit" className="primary">
            {isEdit ? 'Save Supplier' : 'Add Supplier'}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default SupplierModal;
