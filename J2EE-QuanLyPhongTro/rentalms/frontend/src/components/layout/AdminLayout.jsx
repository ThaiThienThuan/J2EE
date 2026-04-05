import DashboardLayout from "./DashboardLayout";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/users", label: "Người dùng", icon: "users" },
  { to: "/admin/audit", label: "Audit log", icon: "audit" },
  { to: "/admin/reports", label: "Báo cáo", icon: "reports" },
  { to: "/admin/bug-reports", label: "Bug reports", icon: "bugs" }
];

export default function AdminLayout() {
  return (
    <DashboardLayout
      role="ADMIN"
      navItems={navItems}
      workspaceEyebrow="Admin workspace"
      workspaceSubtitle="Quản trị người dùng, nhật ký hệ thống và báo cáo."
    />
  );
}
