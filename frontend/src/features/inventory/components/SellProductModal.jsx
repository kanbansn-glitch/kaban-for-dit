import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { formatUnits } from '../utils';

function normalizeStoreStock(store) {
  if (!store) {
    return 0;
  }

  if (store.pivot?.quantity != null) {
    return Number(store.pivot.quantity);
  }

  if (store.quantity != null) {
    return Number(store.quantity);
  }

  return 0;
}

function SellProductModal({ open, product, onClose, onSubmit, isSubmitting }) {
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedStoreId('');
      setQuantity('');
    }
  }, [open, product?.id]);

  const storeOptions = useMemo(() => {
    if (!product) {
      return [];
    }

    return (product.stores ?? [])
      .map((store) => ({
        id: store.id,
        name: store.name || store.branch_name || 'Unnamed store',
        stock: normalizeStoreStock(store),
      }))
      .filter((store) => store.stock > 0);
  }, [product]);

  if (!open || !product) {
    return null;
  }

  const selectedStore = storeOptions.find((store) => String(store.id) === selectedStoreId) ?? null;
  const selectedStoreStock = selectedStore?.stock ?? 0;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedStore) {
      toast.error('Sélectionne un magasin avec du stock.');
      return;
    }

    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Indique une quantité valide.');
      return;
    }

    if (amount > selectedStoreStock) {
      toast.error('La quantité dépasse le stock disponible.');
      return;
    }

    const success = await onSubmit({
      productId: product.id,
      storeId: selectedStore.id,
      quantity: amount,
    });

    if (success) {
      setSelectedStoreId('');
      setQuantity('');
    }
  };

  return (
    <div className="inventory-modal-backdrop" role="dialog" aria-modal="true">
      <form className="inventory-modal sell-modal" onSubmit={handleSubmit}>
        <header>
          <h2>Sell from store</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="inventory-modal-body sell">
          <div className="inventory-modal-fields full">
            <p className="inventory-sell-hint">
              Produit : <strong>{product.name}</strong> — Stock global {formatUnits(product.quantity)}
            </p>

            {storeOptions.length === 0 ? (
              <div className="inventory-sell-empty">
                Aucun magasin ne possède ce produit avec du stock disponible.
              </div>
            ) : (
              <>
                <label>
                  Store
                  <select
                    value={selectedStoreId}
                    onChange={(event) => setSelectedStoreId(event.target.value)}
                    required
                  >
                    <option value="">Sélectionner un magasin</option>
                    {storeOptions.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name} — {formatUnits(store.stock)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Quantity sold
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="Saisir la quantité vendue"
                    required
                  />
                  {selectedStore ? (
                    <span className="inventory-modal-hint">
                      Stock disponible : {formatUnits(selectedStoreStock)}
                    </span>
                  ) : null}
                </label>
              </>
            )}
          </div>
        </div>

        <footer>
          <button type="button" className="secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </button>
          <button
            type="submit"
            className="primary"
            disabled={isSubmitting || storeOptions.length === 0}
          >
            {isSubmitting ? 'Enregistrement…' : 'Confirmer la vente'}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default SellProductModal;
