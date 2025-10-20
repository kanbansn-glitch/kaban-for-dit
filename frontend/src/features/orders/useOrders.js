import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ordersApi } from '../../api/resources.js';

const emptyForm = {
  id: null,
  product_id: '',
  supplier_id: '',
  store_id: '',
  product_code: '',
  category: '',
  order_value: '',
  quantity: '',
  unit: 'Packets',
  buying_price: '',
  expected_date: '',
  notify_on_delivery: true,
  status: 'Confirmed',
};

export function useOrders(token) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showHistory, setShowHistory] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params = showHistory ? {} : { status: 'Confirmed' };
      const response = await ordersApi.list(token, params);
      setOrders(response?.data ?? response ?? []);
    } catch (error) {
      toast.error(error.message || 'Unable to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [token, showHistory]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  const openCreate = useCallback(() => {
    setForm(emptyForm);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((order) => {
    setForm({
      id: order.id,
      product_id: order.product_id,
      supplier_id: order.supplier_id,
      store_id: order.store_id || '',
      product_code: order.product?.product_code || '',
      category: order.product?.category?.name || '',
      order_value: order.order_value,
      quantity: order.quantity,
      unit: order.unit || 'Packets',
      buying_price: order.product?.buying_price ?? '',
      expected_date: order.expected_date ?? '',
      notify_on_delivery: Boolean(order.notify_on_delivery),
      status: order.status,
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const setProductData = useCallback((product, stores = []) => {
    setForm((prev) => ({
      ...prev,
      product_id: product?.id || '',
      supplier_id: product?.supplier_id || '',
      product_code: product?.product_code || '',
      category: product?.category?.name || '',
      buying_price: product?.buying_price ?? '',
      quantity: product ? prev.quantity : '',
      store_id: stores.length === 1 ? stores[0].id : prev.store_id,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!token) return;

    const productId = Number(form.product_id);
    if (!productId) {
      toast.error('Please select a product.');
      return;
    }

    const supplierId = Number(form.supplier_id);
    if (!supplierId) {
      toast.error('Please select a supplier.');
      return;
    }

    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }

    const payload = {
      product_id: productId,
      supplier_id: supplierId,
      store_id: form.store_id ? Number(form.store_id) : null,
      quantity,
      unit: form.unit,
      expected_date: form.expected_date || null,
      status: form.status,
      notify_on_delivery: form.notify_on_delivery,
    };

    try {
      if (form.id) {
        await ordersApi.update(token, form.id, payload);
        toast.success('Order updated successfully.');
      } else {
        await ordersApi.create(token, payload);
        toast.success('Order added successfully.');
      }

      closeModal();
      await loadOrders();
    } catch (error) {
      toast.error(error.message || 'Unable to save order.');
    }
  }, [token, form, loadOrders, closeModal]);

  const updateStatus = useCallback(
    async (order, status) => {
      if (!token) return;
      try {
        await ordersApi.update(token, order.id, {
          product_id: order.product_id,
          supplier_id: order.supplier_id,
          store_id: order.store_id,
          quantity: order.quantity,
          unit: order.unit,
          expected_date: order.expected_date,
          status,
        });
        await loadOrders();
        toast.success(`Order marked as ${status}.`);
      } catch (error) {
        toast.error(error.message || 'Unable to update order status.');
      }
    },
    [token, loadOrders],
  );

  const memoOrders = useMemo(() => orders, [orders]);

  return {
    orders: memoOrders,
    isLoading,
    isModalOpen,
    form,
    showHistory,
    openCreate,
    openEdit,
    closeModal,
    toggleHistory,
    handleChange,
    handleSubmit,
    updateStatus,
    setProductData,
  };
}
