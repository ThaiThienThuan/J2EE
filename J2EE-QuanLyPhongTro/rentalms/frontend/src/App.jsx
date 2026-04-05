import { Suspense, lazy } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import ManagerLayout from "./components/layout/ManagerLayout";
import Navbar from "./components/layout/Navbar";
import OwnerLayout from "./components/layout/OwnerLayout";
import TenantLayout from "./components/layout/TenantLayout";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const MarketplacePage = lazy(() => import("./pages/tenant/MarketplacePage"));
const RoomDetailPage = lazy(() => import("./pages/tenant/RoomDetailPage"));
const RentalRequestsPage = lazy(() => import("./pages/tenant/RentalRequestsPage"));
const ContractsPage = lazy(() => import("./pages/tenant/ContractsPage"));
const BillsPage = lazy(() => import("./pages/tenant/BillsPage"));
const MaintenancePage = lazy(() => import("./pages/tenant/MaintenancePage"));
const ProfilePage = lazy(() => import("./pages/tenant/ProfilePage"));
const NotificationsPage = lazy(() => import("./pages/tenant/NotificationsPage"));
const MoMoCallbackPage = lazy(() => import("./pages/payment/MoMoCallbackPage"));
const OwnerDashboardPage = lazy(() => import("./pages/owner/OwnerDashboardPage"));
const OwnerBuildingsPage = lazy(() => import("./pages/owner/OwnerBuildingsPage"));
const OwnerBuildingDetailPage = lazy(() => import("./pages/owner/OwnerBuildingDetailPage"));
const OwnerRoomsPage = lazy(() => import("./pages/owner/OwnerRoomsPage"));
const OwnerRentalRequestsPage = lazy(() => import("./pages/owner/OwnerRentalRequestsPage"));
const OwnerContractsPage = lazy(() => import("./pages/owner/OwnerContractsPage"));
const OwnerBillsPage = lazy(() => import("./pages/owner/OwnerBillsPage"));
const OwnerManagersPage = lazy(() => import("./pages/owner/OwnerManagersPage"));
const ManagerDashboardPage = lazy(() => import("./pages/manager/ManagerDashboardPage"));
const ManagerBuildingsPage = lazy(() => import("./pages/manager/ManagerBuildingsPage"));
const ManagerRoomsPage = lazy(() => import("./pages/manager/ManagerRoomsPage"));
const ManagerMetersPage = lazy(() => import("./pages/manager/ManagerMetersPage"));
const ManagerBillsPage = lazy(() => import("./pages/manager/ManagerBillsPage"));
const ManagerMaintenancePage = lazy(() => import("./pages/manager/ManagerMaintenancePage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminAuditPage = lazy(() => import("./pages/admin/AdminAuditPage"));
const AdminReportsPage = lazy(() => import("./pages/admin/AdminReportsPage"));
const AdminBugReportsPage = lazy(() => import("./pages/admin/AdminBugReportsPage"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));

function PublicShell() {
  return (
    <div className="min-h-screen bg-app-public">
      <Navbar />
      <main className="pt-[68px]">
        <Outlet />
      </main>
    </div>
  );
}

function AppFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page">
      <div className="animate-fade-in flex items-center gap-3 rounded-full border border-border bg-surface px-6 py-4 text-sm font-bold text-navy shadow-card">
        <span className="h-3 w-3 animate-pulse rounded-full bg-secondary" />
        Đang tải giao diện...
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<AppFallback />}>
      <Routes>
        <Route element={<PublicShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/rooms/:id" element={<RoomDetailPage />} />
          <Route path="/payment/momo/callback" element={<MoMoCallbackPage />} />
        </Route>

        <Route
          path="/tenant"
          element={
            <ProtectedRoute role="TENANT">
              <TenantLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/tenant/marketplace" replace />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="marketplace/rooms/:id" element={<RoomDetailPage />} />
          <Route path="rental-requests" element={<RentalRequestsPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="bills" element={<BillsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route
          path="/owner"
          element={
            <ProtectedRoute role="OWNER">
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboardPage />} />
          <Route path="buildings" element={<OwnerBuildingsPage />} />
          <Route path="buildings/:id" element={<OwnerBuildingDetailPage />} />
          <Route path="rooms" element={<OwnerRoomsPage />} />
          <Route path="rental-requests" element={<OwnerRentalRequestsPage />} />
          <Route path="contracts" element={<OwnerContractsPage />} />
          <Route path="bills" element={<OwnerBillsPage />} />
          <Route path="managers" element={<OwnerManagersPage />} />
        </Route>
        <Route
          path="/manager"
          element={
            <ProtectedRoute role="MANAGER">
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboardPage />} />
          <Route path="buildings" element={<ManagerBuildingsPage />} />
          <Route path="rooms" element={<ManagerRoomsPage />} />
          <Route path="meters" element={<ManagerMetersPage />} />
          <Route path="bills" element={<ManagerBillsPage />} />
          <Route path="maintenance" element={<ManagerMaintenancePage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="audit" element={<AdminAuditPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="bug-reports" element={<AdminBugReportsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
