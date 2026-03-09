import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import RequireAuth from "./lib/RequireAuth";
import { useRealtimeToasts } from "./lib/useRealtimeToasts";
import { useAuth } from "./lib/AuthContext";
import {
  normalizeWorkflowRole,
  WorkflowRoleHomePaths,
  WorkflowRoles,
} from "./constants/workflowRoles";

import LoginPage from "./pages/Common/LoginPage";
import ForgotPasswordPage from "./pages/Common/ForgotPasswordPage";
import NotFoundPage from "./pages/Common/NotFoundPage";
import RoleWorkspacePage from "./pages/Common/RoleWorkspacePage";
import SuperAdminDashboardPage from "./pages/SuperAdmin/DashboardPage";
import SuperAdminUserManagementPage from "./pages/SuperAdmin/UserManagementPage";
import SuperAdminArchivesPage from "./pages/SuperAdmin/UserArchivePage";
import SuperAdminBranchWarehouseManagementPage from "./pages/SuperAdmin/BranchWarehouseManagementPage";
import SuperAdminActivityMonitorPage from "./pages/SuperAdmin/ActivityMonitorPage";
import SuperAdminProfilePage from "./pages/SuperAdmin/ProfilePage";
import AdminDashboardPage from "./pages/Admin/DashboardPage";
import AdminUserManagementPage from "./pages/SuperAdmin/UserManagementPage";
import AdminApprovalInboxPage from "./pages/Admin/ApprovalInboxPage";
import AdminVersionControlPage from "./pages/Admin/VersionControlPage";
import AdminInventoryAllocationPage from "./pages/Admin/InventoryAllocationPage";
import AdminRestockQueuePage from "./pages/Admin/RestockQueuePage";
import AdminExceptionCenterPage from "./pages/Admin/ExceptionCenterPage";
import AdminReportsPage from "./pages/Admin/ReportsPage";
import AdminTaskInboxPage from "./pages/Admin/TaskInboxPage";
import AdminWorkflowTimelinePage from "./pages/Admin/WorkflowTimelinePage";
import AdminApprovalsHistoryPage from "./pages/Admin/ApprovalsHistoryPage";
import AdminNotificationCenterPage from "./pages/Admin/NotificationCenterPage";
import AdminAuditViewerPage from "./pages/Admin/AuditViewerPage";
import AdminProfilePage from "./pages/Admin/ProfilePage";
import BranchDashboardPage from "./pages/BranchManager/DashboardPage";
import BranchInventoryPage from "./pages/BranchManager/InventoryPage";
import BranchRestockRequestPage from "./pages/BranchManager/RestockRequestPage";
import BranchRequestTrackerPage from "./pages/BranchManager/RequestTrackerPage";
import BranchReceivingPage from "./pages/BranchManager/ReceivingPage";
import BranchReportsPage from "./pages/BranchManager/ReportsPage";
import BranchProfilePage from "./pages/BranchManager/ProfilePage";
import PLMDashboardPage from "./pages/PLMManager/DashboardPage";
import PLMCollectionsPage from "./pages/PLMManager/CollectionsPage";
import PLMMaterialListPage from "./pages/PLMManager/MaterialListPage";
import PLMSubmissionCenterPage from "./pages/PLMManager/SubmissionCenterPage";
import PLMTimelinePage from "./pages/PLMManager/TimelinePage";
import PLMProfilePage from "./pages/PLMManager/ProfilePage";
import PLMArchivesPage from "./pages/PLMManager/ArchivesPage";
import PLMRevisionsPage from "./pages/PLMManager/RevisionsPage";
import FinanceBudgetPlannerPage from "./pages/FinanceManager/BudgetPlannerPage";
import FinanceVarianceAnalyticsPage from "./pages/FinanceManager/VarianceAnalyticsPage";
import ProductionDashboardPage from "./pages/ProductionManager/DashboardPage";
import ProductionQueuePage from "./pages/ProductionManager/ProductionQueuePage";
import ProductionRunSchedulerPage from "./pages/ProductionManager/RunSchedulerPage";
import ProductionBatchManagementPage from "./pages/ProductionManager/BatchManagementPage";
import ProductionBatchApprovalRevisionPage from "./pages/ProductionManager/BatchApprovalRevisionPage";
import ProductionReportsPage from "./pages/ProductionManager/ReportsPage";
import ProductionProfilePage from "./pages/ProductionManager/ProfilePage";
import QADashboardPage from "./pages/QualityManager/DashboardPage";
import QAInspectionFormPage from "./pages/QualityManager/InspectionFormPage";
import QAInspectionHistoryPage from "./pages/QualityManager/InspectionHistoryPage";
import QAAnalyticsPage from "./pages/QualityManager/QAAnalyticsPage";
import MainLayout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";
import PLMLayout from "./layout/PLMLayout";
import ProductionLayout from "./layout/ProductionLayout";
import QALayout from "./layout/QALayout";
import WarehouseLayout from "./layout/WarehouseLayout";
import BranchUserLayout from "./layout/BranchUserLayout";

function RouteGuardLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <RouteGuardLoading />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function Protected({
  roles,
  children,
}: {
  roles: string[];
  children: React.ReactNode;
}) {
  const { user, role, isLoading } = useAuth();

  if (isLoading) return <RouteGuardLoading />;
  if (!user) return <Navigate to="/login" replace />;

  if (roles.length > 0) {
    const currentNormalizedRole = normalizeWorkflowRole(role);
    const allowedNormalizedRoles = roles
      .map((allowedRole) => normalizeWorkflowRole(allowedRole))
      .filter((allowedRole): allowedRole is NonNullable<typeof allowedRole> =>
        Boolean(allowedRole),
      );

    if (
      currentNormalizedRole &&
      allowedNormalizedRoles.includes(currentNormalizedRole)
    ) {
      return <>{children}</>;
    }

    const compact = (value: string | null | undefined) =>
      (value ?? "")
        .trim()
        .replace(/[-_\s]/g, "")
        .toUpperCase();
    const currentRoleKey = compact(role);
    const isDirectlyAllowed = roles.some(
      (allowedRole) => compact(allowedRole) === currentRoleKey,
    );
    if (!isDirectlyAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

function SharedRolePage({
  roleLabel,
  pageTitle,
  description,
}: {
  roleLabel: string;
  pageTitle: string;
  description: string;
}) {
  return (
    <RoleWorkspacePage
      roleLabel={roleLabel}
      pageTitle={pageTitle}
      description={description}
    />
  );
}

function DashboardRoute() {
  const { role } = useAuth();
  const normalized = normalizeWorkflowRole(role);
  const target = normalized
    ? WorkflowRoleHomePaths[normalized]
    : "/branch/dashboard";

  return <Navigate to={target} replace />;
}

function App() {
  useRealtimeToasts();

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{ style: { maxWidth: 420 } }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardRoute />
            </RequireAuth>
          }
        />

        {/* Super Admin */}
        <Route
          path="/super-admin/dashboard"
          element={
            <Protected roles={[WorkflowRoles.SuperAdmin]}>
              <MainLayout>
                <SuperAdminDashboardPage />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/super-admin/user-management"
          element={
            <Protected roles={[WorkflowRoles.SuperAdmin]}>
              <MainLayout>
                <SuperAdminUserManagementPage />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/super-admin/archives"
          element={
            <Protected roles={[WorkflowRoles.SuperAdmin]}>
              <MainLayout>
                <SuperAdminArchivesPage />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/super-admin/branch-warehouse-management"
          element={
            <Protected roles={[WorkflowRoles.SuperAdmin]}>
              <MainLayout>
                <SuperAdminBranchWarehouseManagementPage />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/super-admin/activity-monitor"
          element={
            <Protected roles={[WorkflowRoles.SuperAdmin]}>
              <MainLayout>
                <SuperAdminActivityMonitorPage />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/super-admin/profile"
          element={
            <Protected roles={[WorkflowRoles.SuperAdmin]}>
              <MainLayout>
                <SuperAdminProfilePage />
              </MainLayout>
            </Protected>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/user-management"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminUserManagementPage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/approval-inbox"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminApprovalInboxPage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/version-control"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminVersionControlPage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/inventory-allocation"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminInventoryAllocationPage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/restock-queue"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminRestockQueuePage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/exception-center"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminExceptionCenterPage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminReportsPage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/task-inbox"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminTaskInboxPage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/workflow-timeline"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminWorkflowTimelinePage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/approvals-history"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminApprovalsHistoryPage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/notification-center"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminNotificationCenterPage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/audit-viewer"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminAuditViewerPage />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <Protected roles={[WorkflowRoles.Admin, "BranchAdmin"]}>
              <AdminLayout>
                <AdminProfilePage />
              </AdminLayout>
            </Protected>
          }
        />

        {/* Product Manager (PLM) */}
        <Route
          path="/plm/dashboard"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <PLMLayout>
                <PLMDashboardPage />
              </PLMLayout>
            </Protected>
          }
        />
        <Route
          path="/plm/collections"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <PLMLayout>
                <PLMCollectionsPage />
              </PLMLayout>
            </Protected>
          }
        />
        <Route
          path="/plm/material-list"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <PLMLayout>
                <PLMMaterialListPage />
              </PLMLayout>
            </Protected>
          }
        />
        <Route
          path="/plm/version-workspace"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <Navigate to="/plm/submission-center" replace />
            </Protected>
          }
        />
        <Route
          path="/plm/submission-center"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <PLMLayout>
                <PLMSubmissionCenterPage />
              </PLMLayout>
            </Protected>
          }
        />
        <Route
          path="/plm/timeline"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <PLMLayout>
                <PLMTimelinePage />
              </PLMLayout>
            </Protected>
          }
        />
        <Route
          path="/plm/archives"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <PLMLayout>
                <PLMArchivesPage />
              </PLMLayout>
            </Protected>
          }
        />
        <Route
          path="/plm/revisions"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <PLMLayout>
                <PLMRevisionsPage />
              </PLMLayout>
            </Protected>
          }
        />
        <Route
          path="/plm/budget-planner"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <PLMLayout>
                <FinanceBudgetPlannerPage />
              </PLMLayout>
            </Protected>
          }
        />
        <Route
          path="/plm/variance-analytics"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <PLMLayout>
                <FinanceVarianceAnalyticsPage />
              </PLMLayout>
            </Protected>
          }
        />
        <Route
          path="/plm/profile"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <PLMLayout>
                <PLMProfilePage />
              </PLMLayout>
            </Protected>
          }
        />
        <Route
          path="/plm/profile-settings"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <Navigate to="/plm/profile" replace />
            </Protected>
          }
        />
        <Route
          path="/plm/release"
          element={
            <Protected roles={[WorkflowRoles.PLMManager]}>
              <Navigate to="/plm/submission-center" replace />
            </Protected>
          }
        />

        <Route
          path="/finance/*"
          element={<Navigate to="/plm/dashboard" replace />}
        />

        {/* Production Manager */}
        <Route
          path="/production"
          element={
            <Protected roles={[WorkflowRoles.ProductionManager]}>
              <Navigate to="/production/queue" replace />
            </Protected>
          }
        />
        <Route
          path="/production/dashboard"
          element={
            <Protected roles={[WorkflowRoles.ProductionManager]}>
              <ProductionLayout>
                <ProductionDashboardPage />
              </ProductionLayout>
            </Protected>
          }
        />
        <Route
          path="/production/queue"
          element={
            <Protected roles={[WorkflowRoles.ProductionManager]}>
              <ProductionLayout>
                <ProductionQueuePage />
              </ProductionLayout>
            </Protected>
          }
        />
        <Route
          path="/production/run-scheduler"
          element={
            <Protected roles={[WorkflowRoles.ProductionManager]}>
              <ProductionLayout>
                <ProductionRunSchedulerPage />
              </ProductionLayout>
            </Protected>
          }
        />
        <Route
          path="/production/batch-management"
          element={
            <Protected roles={[WorkflowRoles.ProductionManager]}>
              <ProductionLayout>
                <ProductionBatchManagementPage />
              </ProductionLayout>
            </Protected>
          }
        />
        <Route
          path="/production/approval-revision"
          element={
            <Protected roles={[WorkflowRoles.ProductionManager]}>
              <ProductionLayout>
                <ProductionBatchApprovalRevisionPage />
              </ProductionLayout>
            </Protected>
          }
        />
        <Route
          path="/production/reports"
          element={
            <Protected roles={[WorkflowRoles.ProductionManager]}>
              <ProductionLayout>
                <ProductionReportsPage />
              </ProductionLayout>
            </Protected>
          }
        />
        <Route
          path="/production/profile"
          element={
            <Protected roles={[WorkflowRoles.ProductionManager]}>
              <ProductionLayout>
                <ProductionProfilePage />
              </ProductionLayout>
            </Protected>
          }
        />
        <Route
          path="/production/profile-settings"
          element={
            <Protected roles={[WorkflowRoles.ProductionManager]}>
              <Navigate to="/production/profile" replace />
            </Protected>
          }
        />
        <Route
          path="/production/output"
          element={
            <Protected roles={[WorkflowRoles.ProductionManager]}>
              <Navigate to="/production/approval-revision" replace />
            </Protected>
          }
        />

        {/* QA Manager */}
        <Route
          path="/qa/dashboard"
          element={
            <Protected roles={[WorkflowRoles.QAManager, "PQA"]}>
              <QALayout>
                <QADashboardPage />
              </QALayout>
            </Protected>
          }
        />
        <Route
          path="/qa/inspection-queue"
          element={
            <Protected roles={[WorkflowRoles.QAManager, "PQA"]}>
              <Navigate to="/qa/inspection-form" replace />
            </Protected>
          }
        />
        <Route
          path="/qa/inspection-form"
          element={
            <Protected roles={[WorkflowRoles.QAManager, "PQA"]}>
              <QALayout>
                <QAInspectionFormPage />
              </QALayout>
            </Protected>
          }
        />
        <Route
          path="/qa/inspection-history"
          element={
            <Protected roles={[WorkflowRoles.QAManager, "PQA"]}>
              <QALayout>
                <QAInspectionHistoryPage />
              </QALayout>
            </Protected>
          }
        />
        <Route
          path="/qa/reports"
          element={
            <Protected roles={[WorkflowRoles.QAManager, "PQA"]}>
              <QALayout>
                <QAAnalyticsPage />
              </QALayout>
            </Protected>
          }
        />
        <Route
          path="/qa/release"
          element={
            <Protected roles={[WorkflowRoles.QAManager, "PQA"]}>
              <Navigate to="/qa/inspection-form" replace />
            </Protected>
          }
        />
        <Route
          path="/qa/inspection"
          element={
            <Protected roles={[WorkflowRoles.QAManager, "PQA"]}>
              <Navigate to="/qa/inspection-form" replace />
            </Protected>
          }
        />

        {/* Warehouse Manager */}
        <Route
          path="/warehouse/dashboard"
          element={
            <Protected roles={[WorkflowRoles.WarehouseManager]}>
              <WarehouseLayout>
                <SharedRolePage
                  roleLabel="Warehouse Manager"
                  pageTitle="Warehouse Dashboard"
                  description="Warehouse stock overview, transfer priorities, and dispatch readiness."
                />
              </WarehouseLayout>
            </Protected>
          }
        />
        <Route
          path="/warehouse/notifications"
          element={
            <Protected roles={[WorkflowRoles.WarehouseManager]}>
              <WarehouseLayout>
                <SharedRolePage
                  roleLabel="Warehouse Manager"
                  pageTitle="Notifications"
                  description="Universal notifications and dispatch/transfer updates."
                />
              </WarehouseLayout>
            </Protected>
          }
        />
        <Route
          path="/warehouse/tasks"
          element={
            <Protected roles={[WorkflowRoles.WarehouseManager]}>
              <WarehouseLayout>
                <SharedRolePage
                  roleLabel="Warehouse Manager"
                  pageTitle="My Tasks"
                  description="Action queue for stock activation, dispatch, and confirmations."
                />
              </WarehouseLayout>
            </Protected>
          }
        />
        <Route
          path="/warehouse/records"
          element={
            <Protected roles={[WorkflowRoles.WarehouseManager]}>
              <WarehouseLayout>
                <SharedRolePage
                  roleLabel="Warehouse Manager"
                  pageTitle="Search / Records"
                  description="Search inventory lots, stock ledgers, and dispatch records."
                />
              </WarehouseLayout>
            </Protected>
          }
        />
        <Route
          path="/warehouse/reports"
          element={
            <Protected roles={[WorkflowRoles.WarehouseManager]}>
              <WarehouseLayout>
                <SharedRolePage
                  roleLabel="Warehouse Manager"
                  pageTitle="Reports"
                  description="Role-limited warehouse and inventory movement reports."
                />
              </WarehouseLayout>
            </Protected>
          }
        />
        <Route
          path="/warehouse/profile-settings"
          element={
            <Protected roles={[WorkflowRoles.WarehouseManager]}>
              <WarehouseLayout>
                <SharedRolePage
                  roleLabel="Warehouse Manager"
                  pageTitle="Profile & Settings"
                  description="Basic profile and warehouse workspace settings."
                />
              </WarehouseLayout>
            </Protected>
          }
        />
        <Route
          path="/warehouse/dispatch"
          element={
            <Protected roles={[WorkflowRoles.WarehouseManager]}>
              <WarehouseLayout>
                <SharedRolePage
                  roleLabel="Warehouse Manager"
                  pageTitle="Dispatch"
                  description="Dispatch preparation, transfer execution, and shipment tracking."
                />
              </WarehouseLayout>
            </Protected>
          }
        />

        {/* Branch Manager / Branch User */}
        <Route
          path="/branch/dashboard"
          element={
            <Protected roles={[WorkflowRoles.BranchManager, "BRANCH_USER"]}>
              <BranchUserLayout>
                <BranchDashboardPage />
              </BranchUserLayout>
            </Protected>
          }
        />
        <Route
          path="/branch/inventory"
          element={
            <Protected roles={[WorkflowRoles.BranchManager, "BRANCH_USER"]}>
              <BranchUserLayout>
                <BranchInventoryPage />
              </BranchUserLayout>
            </Protected>
          }
        />
        <Route
          path="/branch/restock-request"
          element={
            <Protected roles={[WorkflowRoles.BranchManager, "BRANCH_USER"]}>
              <BranchUserLayout>
                <BranchRestockRequestPage />
              </BranchUserLayout>
            </Protected>
          }
        />
        <Route
          path="/branch/request-tracker"
          element={
            <Protected roles={[WorkflowRoles.BranchManager, "BRANCH_USER"]}>
              <BranchUserLayout>
                <BranchRequestTrackerPage />
              </BranchUserLayout>
            </Protected>
          }
        />
        <Route
          path="/branch/reports"
          element={
            <Protected roles={[WorkflowRoles.BranchManager, "BRANCH_USER"]}>
              <BranchUserLayout>
                <BranchReportsPage />
              </BranchUserLayout>
            </Protected>
          }
        />
        <Route
          path="/branch/receiving"
          element={
            <Protected roles={[WorkflowRoles.BranchManager, "BRANCH_USER"]}>
              <BranchUserLayout>
                <BranchReceivingPage />
              </BranchUserLayout>
            </Protected>
          }
        />
        <Route
          path="/branch/requests"
          element={
            <Protected roles={[WorkflowRoles.BranchManager, "BRANCH_USER"]}>
              <Navigate to="/branch/restock-request" replace />
            </Protected>
          }
        />
        <Route
          path="/branch/profile"
          element={
            <Protected roles={[WorkflowRoles.BranchManager, "BRANCH_USER"]}>
              <BranchUserLayout>
                <BranchProfilePage />
              </BranchUserLayout>
            </Protected>
          }
        />
        <Route
          path="/branch/profile-settings"
          element={
            <Protected roles={[WorkflowRoles.BranchManager, "BRANCH_USER"]}>
              <Navigate to="/branch/profile" replace />
            </Protected>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <MainLayout>
                <SharedRolePage
                  roleLabel="Common"
                  pageTitle="Profile & Settings"
                  description="Basic profile and user preference settings."
                />
              </MainLayout>
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
