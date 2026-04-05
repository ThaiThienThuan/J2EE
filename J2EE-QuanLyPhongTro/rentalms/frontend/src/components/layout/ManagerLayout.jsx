import DashboardLayout from "./DashboardLayout";

const navItems = [
  { to: "/manager/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/manager/buildings", label: "Tòa nhà", icon: "buildings" },
  { to: "/manager/rooms", label: "Phòng", icon: "rooms" },
  { to: "/manager/meters", label: "Số điện nước", icon: "meters" },
  { to: "/manager/bills", label: "Hóa đơn", icon: "bills" },
  { to: "/manager/maintenance", label: "Bảo trì", icon: "maintenance" }
];

export default function ManagerLayout() {
  return (
    <DashboardLayout
      role="MANAGER"
      navItems={navItems}
      workspaceEyebrow="Manager workspace"
      workspaceSubtitle="Theo dõi tòa nhà được phân công, công tơ, bảo trì và thu tiền."
      notificationSeeAll="/manager/dashboard"
    />
  );
}
