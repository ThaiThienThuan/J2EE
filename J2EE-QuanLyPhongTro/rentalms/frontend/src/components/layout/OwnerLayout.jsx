import DashboardLayout from "./DashboardLayout";

const navItems = [
  { to: "/owner/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/owner/buildings", label: "Tòa nhà", icon: "buildings" },
  { to: "/owner/rooms", label: "Phòng", icon: "rooms" },
  { to: "/owner/rental-requests", label: "Yêu cầu thuê", icon: "requests" },
  { to: "/owner/contracts", label: "Hợp đồng", icon: "contracts" },
  { to: "/owner/bills", label: "Hóa đơn", icon: "bills" },
  { to: "/owner/managers", label: "Quản lý", icon: "managers" }
];

export default function OwnerLayout() {
  return (
    <DashboardLayout
      role="OWNER"
      navItems={navItems}
      workspaceEyebrow="Owner workspace"
      workspaceSubtitle="Quản lý tòa nhà, phòng, yêu cầu thuê, hợp đồng và hóa đơn."
      notificationSeeAll="/owner/dashboard"
    />
  );
}
