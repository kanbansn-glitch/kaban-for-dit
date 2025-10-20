import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { storesApi } from '../../api/resources.js';

const emptyForm = {
  id: null,
  name: '',
  branch_name: '',
  address_line: '',
  city: '',
  postal_code: '',
  phone: '',
};

export function useStores(token) {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadStores = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await storesApi.list(token);
      setStores(response?.data ?? response ?? []);
    } catch (error) {
      toast.error(error.message || 'Impossible de charger les magasins.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const openCreate = useCallback(() => {
    setForm(emptyForm);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((store) => {
    setForm({
      id: store.id,
      name: store.name,
      branch_name: store.branch_name ?? '',
      address_line: store.address_line ?? '',
      city: store.city ?? '',
      postal_code: store.postal_code ?? '',
      phone: store.phone ?? '',
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!token) return;

    const payload = {
      name: form.name.trim(),
      branch_name: form.branch_name.trim() || null,
      address_line: form.address_line.trim() || null,
      city: form.city.trim() || null,
      postal_code: form.postal_code.trim() || null,
      phone: form.phone.trim() || null,
    };

    try {
      if (form.id) {
        await storesApi.update(token, form.id, payload);
        toast.success('Store updated successfully.');
      } else {
        await storesApi.create(token, payload);
        toast.success('Store added successfully.');
      }

      closeModal();
      await loadStores();
    } catch (error) {
      toast.error(error.message || "Impossible d'enregistrer le magasin.");
    }
  }, [token, form, loadStores, closeModal]);

  const memoizedStores = useMemo(() => stores, [stores]);

  return {
    stores: memoizedStores,
    isLoading,
    isModalOpen,
    form,
    openCreate,
    openEdit,
    closeModal,
    handleChange,
    handleSubmit,
  };
}
