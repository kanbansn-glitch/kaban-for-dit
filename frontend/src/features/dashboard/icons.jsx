const iconProps = {
  width: 20,
  height: 20,
  fill: 'none',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const DashboardIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path
      stroke="#0ea5e9"
      d="M4 13.5V6.2c0-.69.56-1.25 1.25-1.25H9.5c.69 0 1.25.56 1.25 1.25v7.3c0 .69-.56 1.25-1.25 1.25H5.25A1.25 1.25 0 0 1 4 13.5Zm9.25 4.05V6.2c0-.69.56-1.25 1.25-1.25h3.25c.69 0 1.25.56 1.25 1.25v11.35c0 .69-.56 1.25-1.25 1.25H14.5a1.25 1.25 0 0 1-1.25-1.25Z"
    />
  </svg>
);

export const InventoryIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path
      stroke="#0f172a"
      d="m4.75 7.5 7.25-3.5 7.25 3.5m-14.5 0L12 11m-7.25-3.5v8.85c0 .57.32 1.1.83 1.36l6.09 3.02c.4.2.87.2 1.27 0l6.09-3.02a1.5 1.5 0 0 0 .83-1.36V7.5m-7.25 3.5 7.25-3.5"
    />
  </svg>
);

export const ReportsIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path
      stroke="#0f172a"
      d="M5.5 19.25h13m-11-4.5 3.25-3.25 2.5 2.5 4.25-4.25M5.5 5.25h13c.69 0 1.25.56 1.25 1.25v11.5c0 .69-.56 1.25-1.25 1.25h-13c-.69 0-1.25-.56-1.25-1.25V6.5c0-.69.56-1.25 1.25-1.25Z"
    />
  </svg>
);

export const SuppliersIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path
      stroke="#0f172a"
      d="M12 12.5c2.347 0 4.25-1.903 4.25-4.25S14.347 4 12 4 7.75 5.903 7.75 8.25 9.653 12.5 12 12.5ZM5.75 20c0-2.2 2.13-4 4.75-4h3c2.62 0 4.75 1.8 4.75 4"
    />
  </svg>
);

export const OrdersIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path
      stroke="#0f172a"
      d="M6.5 5.25h11c.69 0 1.25.56 1.25 1.25v11c0 .69-.56 1.25-1.25 1.25h-11c-.69 0-1.25-.56-1.25-1.25v-11c0-.69.56-1.25 1.25-1.25Zm0 3.75h13m-9 10V9"
    />
  </svg>
);

export const StoreIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path
      stroke="#0f172a"
      d="M4.5 10.75V7.5l7.5-3.25 7.5 3.25v3.25M6 10.75h12v8.5H6v-8.5Zm4.5 0v8.5"
    />
  </svg>
);

export const SettingsIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path
      stroke="#475569"
      d="M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm6.75-2.5a6.64 6.64 0 0 0-.09-1.1l2.06-1.6-1.5-2.6-2.4.9a6.6 6.6 0 0 0-1.9-1.1l-.35-2.53h-3l-.35 2.53c-.7.24-1.35.6-1.9 1.1l-2.4-.9-1.5 2.6 2.06 1.6c-.06.36-.09.73-.09 1.1 0 .37.03.74.09 1.1l-2.06 1.6 1.5 2.6 2.4-.9c.55.5 1.2.86 1.9 1.1l.35 2.53h3l.35-2.53c.7-.24 1.35-.6 1.9-1.1l2.4.9 1.5-2.6-2.06-1.6c.06-.36.09-.73.09-1.1Z"
    />
  </svg>
);

export const LogoutIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path
      stroke="#475569"
      d="M9.5 5.25H6.25c-.69 0-1.25.56-1.25 1.25v11c0 .69.56 1.25 1.25 1.25H9.5m3.75-3.75 4 4m0 0 4-4m-4 4V4.25"
    />
  </svg>
);
