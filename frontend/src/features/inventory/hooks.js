import { useEffect, useMemo, useState } from 'react';
import { createProduct, deleteProduct, fetchCategories, fetchProducts, fetchSuppliers, updateProduct } from './api';
import { salesApi } from '../../api/resources';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { formatCurrency, formatDate, formatUnits, normalizeStatus } from './utils';
import { toast } from 'sonner';

function toNumeric(value) {
  if (value == null || value === '') {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  const cleaned = String(value).replace(/[\s,]+/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundToTwo(value) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return Math.round(number * 100) / 100;
}

function calculateSummary(productList, categoriesList) {

  const revenueEstimateRaw = productList.reduce((total, product) => {
    if (product.stock_value != null) {
      return total + roundToTwo(product.stock_value);
    }

    const unitPrice = roundToTwo(product.selling_price || product.buying_price || 0);
    const quantity = toNumeric(product.quantity ?? 0);
    return total + roundToTwo(unitPrice * quantity);
  }, 0);

  const revenueEstimate = roundToTwo(revenueEstimateRaw);

  const lowStocks = productList.filter((product) => ['low_stock', 'out_of_stock'].includes(product.status)).length;
  const outOfStock = productList.filter((product) => product.status === 'out_of_stock').length;

  return {
    categoriesCount: categoriesList.length,
    productsCount: productList.length,
    revenueEstimate: formatCurrency(revenueEstimate),
    lowStocks,
    outOfStock,
  };
}

export function useInventoryData(token) {
  const handleError = useApiErrorHandler();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const loadData = async () => {
    if (!token) {
      console.warn('[Inventory] Aucun token, abandon du chargement.');
      return;
    }

    setIsLoading(true);
    try {
      const [productsResponse, categoriesResponse, suppliersResponse] = await Promise.all([
        fetchProducts(token),
        fetchCategories(token),
        fetchSuppliers(token),
      ]);



      console.log('[Inventory] Réponse brute GET /products:', productsResponse);

      const productList = (productsResponse?.data ?? productsResponse ?? []).map((product) => {
        const buyingPrice = toNumeric(product.buying_price);
        const sellingPrice = toNumeric(product.selling_price);
        const quantity = toNumeric(product.quantity);
        const threshold = toNumeric(product.threshold);
        const stockValue = product.stock_value != null ? toNumeric(product.stock_value) : null;

        return {
          ...product,
          buying_price: buyingPrice,
          selling_price: sellingPrice,
          quantity,
          threshold,
          stock_value: stockValue,
          buying_price_formatted: formatCurrency(buyingPrice),
          selling_price_formatted: formatCurrency(sellingPrice),
          expiry_date_formatted: product.expiry_date ? formatDate(product.expiry_date) : '—',
          status_label: normalizeStatus(product.status),
          quantity_units: formatUnits(quantity),
          threshold_units: formatUnits(threshold),
        };
      });

      console.log('[Inventory] Produits normalisés:', productList);

      setProducts(productList);
      setCategories(categoriesResponse?.data ?? categoriesResponse ?? []);
      setSuppliers(suppliersResponse?.data ?? suppliersResponse ?? []);

      if (productList.length > 0) {
        setSelectedProductId((prev) => prev ?? productList[0].id);
      } else {
        setSelectedProductId(null);
      }
    } catch (error) {
      console.error('[Inventory] Erreur loadData:', error);
      handleError(error, 'Impossible de charger les produits.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  const handleProductCreate = async (payload) => {
    try {
      const response = await createProduct(token, payload);
      const created = response?.data?.product ?? response?.data ?? response;
      await loadData();
      setSelectedProductId(created.id);
      toast.success('Produit ajouté avec succès.');
      return created;
    } catch (error) {
      handleError(error, "Impossible d'ajouter le produit.");
      throw error;
    }
  };

  const handleProductUpdate = async (productId, payload) => {
    try {
      const response = await updateProduct(token, productId, payload);
      const updated = response?.data?.product ?? response?.data ?? response;
      await loadData();
      setSelectedProductId(productId);
      toast.success('Produit mis à jour.');
      return updated;
    } catch (error) {
      handleError(error, 'Impossible de mettre à jour le produit.');
      throw error;
    }
  };

  const handleProductDelete = async (productId) => {
    try {
      await deleteProduct(token, productId);
      await loadData();
      toast.success('Produit supprimé.');
    } catch (error) {
      handleError(error, 'Impossible de supprimer le produit.');
      throw error;
    }
  };

  const handleProductSale = async ({ productId, storeId, quantity, sellingPrice, saleDate }) => {
    if (!token) {
      return false;
    }

    const payload = {
      product_id: productId,
      quantity: Number(quantity),
      store_id: storeId ? Number(storeId) : null,
    };

    if (saleDate) {
      payload.sale_date = saleDate;
    }

    if (sellingPrice != null && sellingPrice !== '') {
      payload.selling_price = Number(sellingPrice);
    }

    try {
      await salesApi.create(token, payload);
      toast.success('Vente enregistrée.');
      await loadData();
      return true;
    } catch (error) {
      handleError(error, "Impossible d'enregistrer la vente.");
      return false;
    }
  };

  const summary = useMemo(
  
    () => calculateSummary(products, categories),
    [products, categories],
  );


  return {
    products,
    categories,
    suppliers,
    summary,
    handleProductSale,
    isLoading,
    isModalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    setModalOpen,
    editingProduct,
    setEditingProduct,
    selectedProduct,
    selectedProductId,
    setSelectedProductId,
    handleProductCreate,
    handleProductUpdate,
    handleProductDelete,
  };
}
