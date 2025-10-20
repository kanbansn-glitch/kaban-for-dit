import { useEffect, useMemo, useState } from 'react';
import { createProduct, deleteProduct, fetchCategories, fetchProducts, fetchSuppliers, updateProduct } from './api';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { formatCurrency, formatDate, formatUnits, normalizeStatus } from './utils';
import { toast } from 'sonner';

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
      return;
    }

    setIsLoading(true);
    try {
      const [productsResponse, categoriesResponse, suppliersResponse] = await Promise.all([
        fetchProducts(token),
        fetchCategories(token),
        fetchSuppliers(token),
      ]);

      const productList = (productsResponse?.data ?? productsResponse ?? []).map((product) => ({
        ...product,
        buying_price_formatted: formatCurrency(product.buying_price),
        selling_price_formatted: formatCurrency(product.selling_price),
        expiry_date_formatted: product.expiry_date ? formatDate(product.expiry_date) : '—',
        status_label: normalizeStatus(product.status),
        quantity_units: formatUnits(product.quantity),
        threshold_units: formatUnits(product.threshold),
      }));

      setProducts(productList);
      setCategories(categoriesResponse?.data ?? categoriesResponse ?? []);
      setSuppliers(suppliersResponse?.data ?? suppliersResponse ?? []);

      if (productList.length > 0) {
        setSelectedProductId((prev) => prev ?? productList[0].id);
      } else {
        setSelectedProductId(null);
      }
    } catch (error) {
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

  const summary = useMemo(() => {
    const categoriesCount = categories.length;
    const productsCount = products.length;
    const revenueEstimate = products.reduce(
      (total, product) => total + Number(product.selling_price ?? 0) * Number(product.quantity ?? 0),
      0,
    );
    const lowStocks = products.filter((product) => ['low_stock', 'out_of_stock'].includes(product.status)).length;
    const outOfStock = products.filter((product) => product.status === 'out_of_stock').length;

    return {
      categoriesCount,
      productsCount,
      revenueEstimate: formatCurrency(revenueEstimate),
      lowStocks,
      outOfStock,
    };
  }, [products, categories]);

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

  return {
    products,
    categories,
    suppliers,
    summary,
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
