import './storeModal.css';

function Input({ label, name, value, onChange, placeholder }) {
  return (
    <label className="store-field">
      {label}
      <input name={name} value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}

function StoreModal({ form, onClose, onChange, onSubmit }) {
  const isEdit = Boolean(form.id);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="store-modal-backdrop">
      <form className="store-modal" onSubmit={handleSubmit}>
        <header>
          <h2>{isEdit ? 'Edit Store' : 'Add Store'}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="store-modal-body">
          <div className="store-modal-grid">
            <Input
              label="Store Name"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Enter store name"
            />
            <Input
              label="Branch Name"
              name="branch_name"
              value={form.branch_name}
              onChange={onChange}
              placeholder="Enter branch name"
            />
            <Input
              label="Address"
              name="address_line"
              value={form.address_line}
              onChange={onChange}
              placeholder="Enter address"
            />
            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={onChange}
              placeholder="Enter city"
            />
            <Input
              label="Postal Code"
              name="postal_code"
              value={form.postal_code}
              onChange={onChange}
              placeholder="Enter postal code"
            />
            <Input
              label="Contact Number"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <footer>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            {isEdit ? 'Save Changes' : 'Add Store'}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default StoreModal;
