import DashboardLayout from "./DashboardLayout";

const navItems = [
  { to: "/tenant/marketplace", label: "Marketplace", icon: "marketplace" },
  { to: "/tenant/rental-requests", label: "Yêu cầu thuê", icon: "requests" },
  { to: "/tenant/contracts", label: "Hợp đồng", icon: "contracts" },
  { to: "/tenant/bills", label: "Hóa đơn", icon: "bills" },
  { to: "/tenant/maintenance", label: "Bảo trì", icon: "maintenance" },
  { to: "/tenant/notifications", label: "Thông báo", icon: "notifications" },
  { to: "/tenant/profile", label: "Hồ sơ", icon: "profile" }
];

export default function TenantLayout() {
  return (
    <DashboardLayout
      role="TENANT"
      navItems={navItems}
      workspaceEyebrow="Tenant workspace"
      workspaceSubtitle="Theo dõi phòng, hóa đơn, hợp đồng và thông báo trong một dashboard."
      showMarketplaceLink
      notificationSeeAll="/tenant/notifications"
    />
  );
}
