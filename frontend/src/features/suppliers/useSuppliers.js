import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { suppliersApi } from '../../api/resources.js';
import { createProduct, updateProduct } from '../inventory/api.js';

const emptyForm = {
  id: null,
  name: '',
  email: '',
  contact_number: '',
  address: '',
  takes_back_returns: false,
  product_name: '',
  product_code: '',
  category_id: '',
  buying_price: '',
  selling_price: '',
  quantity: '',
  threshold: '',
  expiry_date: '',
  store_id: '',
  existing_product_id: '',
};

export function useSuppliers(token, { categories, stores, products = [] }) {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadSuppliers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await suppliersApi.list(token);
      setSuppliers(response?.data ?? response ?? []);
    } catch (error) {
      toast.error(error.message || 'Unable to load suppliers');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const openCreate = useCallback(() => {
    setForm(emptyForm);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((supplier) => {
    setForm({
      ...emptyForm,
      id: supplier.id,
      name: supplier.name,
      email: supplier.email ?? '',
      contact_number: supplier.contact_number ?? '',
      address: supplier.address ?? '',
      takes_back_returns: Boolean(supplier.takes_back_returns),
      existing_product_id: '',
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;

    if (name === 'existing_product_id') {
      if (!value) {
        setForm((prev) => ({
          ...prev,
          existing_product_id: '',
          product_name: '',
          product_code: '',
          category_id: '',
          buying_price: '',
          selling_price: '',
          quantity: '',
          threshold: '',
          expiry_date: '',
          store_id: '',
        }));
        return;
      }

      const selectedProduct = products.find((product) => String(product.id) === value);

      if (!selectedProduct) {
        setForm((prev) => ({ ...prev, existing_product_id: value }));
        return;
      }

      const firstStoreId =
        Array.isArray(selectedProduct.stores) && selectedProduct.stores.length === 1
          ? selectedProduct.stores[0].id
          : '';

      setForm((prev) => ({
        ...prev,
        existing_product_id: value,
        product_name: selectedProduct.name ?? '',
        product_code: selectedProduct.product_code ?? '',
        category_id: String(
          selectedProduct.category_id ??
            selectedProduct.category?.id ??
            prev.category_id ??
            '',
        ),
        buying_price:
          selectedProduct.buying_price != null ? String(selectedProduct.buying_price) : '',
        selling_price:
          selectedProduct.selling_price != null ? String(selectedProduct.selling_price) : '',
        quantity: selectedProduct.quantity != null ? String(selectedProduct.quantity) : '',
        threshold: selectedProduct.threshold != null ? String(selectedProduct.threshold) : '',
        expiry_date: selectedProduct.expiry_date ?? '',
        store_id: firstStoreId ? String(firstStoreId) : prev.store_id,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }, [products]);

  const handleToggleReturn = useCallback((value) => {
    setForm((prev) => ({ ...prev, takes_back_returns: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!token) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      contact_number: form.contact_number.trim() || null,
      address: form.address.trim() || null,
      takes_back_returns: form.takes_back_returns,
    };

    try {
      let supplierId = form.id;
      if (form.id) {
        await suppliersApi.update(token, form.id, payload);
        supplierId = form.id;
        toast.success('Supplier updated successfully.');
      } else {
        const response = await suppliersApi.create(token, payload);
        supplierId = response?.data?.supplier?.id ?? response?.id;
        toast.success('Supplier added successfully.');
      }

      const hasExistingProduct = Boolean(form.existing_product_id);
      const hasNewProductDetails = form.product_name && form.product_code && form.category_id;

      if (supplierId && hasExistingProduct) {
        const productId = Number(form.existing_product_id);
        if (Number.isFinite(productId)) {
          const productPayload = {
            product_code: form.product_code.trim(),
            name: form.product_name.trim(),
            category_id: Number(form.category_id),
            supplier_id: supplierId,
            buying_price: Number(form.buying_price || 0),
            selling_price: Number(form.selling_price || form.buying_price || 0),
            quantity: Number(form.quantity || 0),
            threshold: Number(form.threshold || 0),
            expiry_date: form.expiry_date || null,
          };

          await updateProduct(token, productId, productPayload);
          toast.success('Product linked to supplier.');
        }
      } else if (!form.id && supplierId && hasNewProductDetails) {
        const productPayload = {
          product_code: form.product_code.trim(),
          name: form.product_name.trim(),
          category_id: Number(form.category_id),
          supplier_id: supplierId,
          buying_price: Number(form.buying_price || 0),
          selling_price: Number(form.selling_price || form.buying_price || 0),
          quantity: Number(form.quantity || 0),
          threshold: Number(form.threshold || 0),
          expiry_date: form.expiry_date || null,
          stores: form.store_id
            ? [
                {
                  store_id: Number(form.store_id),
                  quantity: Number(form.quantity || 0),
                  threshold: Number(form.threshold || 0),
                },
              ]
            : [],
        };

        await createProduct(token, productPayload);
        toast.success('Product created for supplier.');
      }

      closeModal();
      await loadSuppliers();
    } catch (error) {
      toast.error(error.message || 'Unable to save supplier.');
    }
  }, [token, form, loadSuppliers, closeModal]);

  const memoizedSuppliers = useMemo(() => suppliers, [suppliers]);

  return {
    suppliers: memoizedSuppliers,
    isLoading,
    isModalOpen,
    form,
    categories,
    stores,
    openCreate,
    openEdit,
    closeModal,
    handleChange,
    handleToggleReturn,
    handleSubmit,
  };
}
