import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../features/dashboard/components/DashboardLayout';
import DashboardSection from '../features/dashboard/DashboardSection.jsx';
import InventorySection from '../features/inventory/InventorySection';
import OrdersSection from '../features/orders/OrdersSection.jsx';
import StoresSection from '../features/stores/StoresSection.jsx';
import SuppliersSection from '../features/suppliers/SuppliersSection.jsx';
import ReportsSection from '../features/reports/ReportsSection.jsx';
import PlaceholderSection from '../features/dashboard/sections/PlaceholderSection';

function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const sections = useMemo(
    () => [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        component: <DashboardSection />,
      },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: 'inventory',
        component: <InventorySection />,
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'reports',
        component: <ReportsSection />,
      },
      {
        id: 'suppliers',
        label: 'Suppliers',
        icon: 'suppliers',
        component: <SuppliersSection />,
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: 'orders',
        component: <OrdersSection />,
      },
      {
        id: 'manage_store',
        label: 'Manage Store',
        icon: 'manage_store',
        component: <StoresSection />,
      },
    ],
    [],
  );

  const footerSections = useMemo(
    () => [
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        component: <PlaceholderSection title="Settings" />,
      },
    ],
    [],
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DashboardLayout
      sections={sections}
      footerSections={footerSections}
      onLogout={handleLogout}
      initialActiveId="dashboard"
    />
  );
}

export default DashboardPage;
