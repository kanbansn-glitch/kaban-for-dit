import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const initialState = {
  product_code: '',
  name: '',
  category_id: '',
  buying_price: '',
  selling_price: '',
  quantity: '',
  threshold: '',
  expiry_date: '',
  supplier_id: '',
};

function ProductModal({ open, onClose, categories, suppliers, onSubmit, isSubmitting, initialData, isEditing }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (open && initialData) {
      setForm({
        product_code: initialData.product_code ?? '',
        name: initialData.name ?? '',
        category_id: initialData.category_id ? String(initialData.category_id) : '',
        buying_price: initialData.buying_price ?? '',
        selling_price: initialData.selling_price ?? '',
        quantity: initialData.quantity ?? '',
        threshold: initialData.threshold ?? '',
        expiry_date: initialData.expiry_date ?? '',
        supplier_id: initialData.supplier_id ? String(initialData.supplier_id) : '',
      });
    } else if (open) {
      setForm(initialState);
    }
  }, [open, initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.category_id) {
      toast.error('Merci de renseigner au minimum le nom et la catégorie.');
      return;
    }

    const payload = {
      product_code: form.product_code,
      name: form.name,
      category_id: Number(form.category_id),
      buying_price: Number(form.buying_price || 0),
      selling_price: Number(form.selling_price || 0),
      quantity: Number(form.quantity || 0),
      threshold: Number(form.threshold || 0),
      expiry_date: form.expiry_date || null,
      supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
    };

    const success = await onSubmit(payload);
    if (success) {
      setForm(initialState);
      onClose();
    }
  };

  const handleDiscard = () => {
    setForm(initialState);
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="inventory-modal-backdrop" role="dialog" aria-modal="true">
      <form className="inventory-modal" onSubmit={handleSubmit}>
        <header>
          <h2>{isEditing ? 'Edit Product' : 'New Product'}</h2>
          <button type="button" onClick={handleDiscard} aria-label="Close">
            ×
          </button>
        </header>

        <div className="inventory-modal-body">
          <div className="inventory-modal-image">
            <span>Drag image here</span>
            <button type="button">Browse image</button>
          </div>

          <div className="inventory-modal-fields">
            <label>
              Product ID
              <input
                name="product_code"
                value={form.product_code}
                onChange={handleChange}
                placeholder="Enter product code"
                required
              />
            </label>
            <label>
              Product Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </label>

            <label>
              Category
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select product category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Supplier
              <select name="supplier_id" value={form.supplier_id} onChange={handleChange}>
                <option value="">Select supplier (optional)</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {suppliers.length === 0 ? (
                <span className="inventory-modal-hint">No suppliers yet for ce compte.</span>
              ) : null}
            </label>

            <label>
              Buying Price
              <input
                type="number"
                step="0.01"
                min="0"
                name="buying_price"
                value={form.buying_price}
                onChange={handleChange}
                placeholder="Enter buying price"
              />
            </label>

            <label>
              Selling Price
              <input
                type="number"
                step="0.01"
                min="0"
                name="selling_price"
                value={form.selling_price}
                onChange={handleChange}
                placeholder="Enter selling price"
              />
            </label>

            <label>
              Quantity
              <input
                type="number"
                min="0"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Enter product quantity"
              />
            </label>

            <label>
              Threshold Value
              <input
                type="number"
                min="0"
                name="threshold"
                value={form.threshold}
                onChange={handleChange}
                placeholder="Enter threshold value"
              />
            </label>

            <label>
              Expiry Date
              <input
                type="date"
                name="expiry_date"
                value={form.expiry_date}
                onChange={handleChange}
              />
            </label>

          </div>
        </div>

        <footer>
          <button type="button" className="secondary" onClick={handleDiscard}>
            Discard
          </button>
          <button type="submit" className="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditing ? 'Update Product' : 'Add Product'}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default ProductModal;
