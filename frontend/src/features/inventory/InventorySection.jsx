import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useInventoryData } from './hooks';
import InventorySummary from './components/InventorySummary';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ProductModal from './components/ProductModal';
import SellProductModal from './components/SellProductModal';
import './inventory.css';

function InventorySection() {
  const { token } = useAuth();
  const [isSubmitting, setSubmitting] = useState(false);
  const {
    products,
    categories,
    suppliers,
    summary,
    isLoading,
    isModalOpen,
    openModal,
    closeModal,
    setModalOpen,
    editingProduct,
    setEditingProduct,
    selectedProduct,
    selectedProductId,
    setSelectedProductId,
    handleProductCreate,
    handleProductUpdate,
    handleProductDelete,
    handleProductSale,
  } = useInventoryData(token);
  const [isSaleModalOpen, setSaleModalOpen] = useState(false);
  const [saleProduct, setSaleProduct] = useState(null);
  const [isRecordingSale, setRecordingSale] = useState(false);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await handleProductCreate(payload);
      return true;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingProduct) {
      return false;
    }

    setSubmitting(true);
    try {
      await handleProductUpdate(editingProduct.id, payload);
      return true;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
      setEditingProduct(null);
    }
  };

  const handleDelete = async (product) => {
    if (!product) {
      return;
    }

    const confirmed = window.confirm(`Supprimer ${product.name} ?`);
    if (!confirmed) {
      return;
    }

    await handleProductDelete(product.id);
    setEditingProduct(null);
    setSelectedProductId(null);
  };

  const handleOpenSaleModal = (product) => {
    setSaleProduct(product);
    setSaleModalOpen(true);
  };

  const handleSaleSubmit = async ({ productId, storeId, quantity }) => {
    setRecordingSale(true);
    try {
      const success = await handleProductSale({ productId, storeId, quantity });
      if (success) {
        setSaleModalOpen(false);
        setSaleProduct(null);
      }
      return success;
    } finally {
      setRecordingSale(false);
    }
  };

  const handleSaleClose = () => {
    if (isRecordingSale) {
      return;
    }
    setSaleModalOpen(false);
    setSaleProduct(null);
  };

  if (!token) {
    return (
      <div className="inventory-empty-state">
        <p>Connectez-vous pour consulter l\'inventaire.</p>
      </div>
    );
  }

  return (
    <div className="inventory-layout">
      <InventorySummary summary={summary} />

      <div className="inventory-split">
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProductId(null)}
            onOpenModal={() => {
              setEditingProduct(selectedProduct);
              setModalOpen(true);
            }}
            onDelete={() => handleDelete(selectedProduct)}
          />
        ) : (
          <ProductList
            products={products}
            selectedId={selectedProductId}
            onSelect={setSelectedProductId}
            onOpenModal={() => {
              setEditingProduct(null);
              openModal();
            }}
            onSell={handleOpenSaleModal}
          />
        )}
      </div>

      <ProductModal
        open={isModalOpen}
        onClose={() => {
          closeModal();
          setEditingProduct(null);
        }}
        categories={categories}
        suppliers={suppliers}
        onSubmit={editingProduct ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        initialData={editingProduct}
        isEditing={Boolean(editingProduct)}
      />

      <SellProductModal
        open={isSaleModalOpen}
        product={saleProduct}
        onClose={handleSaleClose}
        onSubmit={handleSaleSubmit}
        isSubmitting={isRecordingSale}
      />

      {isLoading ? <div className="inventory-loader">Chargement…</div> : null}
    </div>
  );
}

export default InventorySection;
