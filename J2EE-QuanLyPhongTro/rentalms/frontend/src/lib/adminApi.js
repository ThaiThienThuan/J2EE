import { api, unwrapData } from "./api";

function compactParams(params = {}) {
  const result = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  });
  return result;
}

export async function getUsers(role) {
  return unwrapData(
    await api.get("/api/v1/admin/users", {
      params: compactParams({ role: role && role !== "ALL" ? role : undefined })
    })
  );
}

export async function toggleUserActive(id) {
  return unwrapData(await api.put(`/api/admin/users/${id}/toggle-active`));
}

export async function getAuditLogs(filters = {}) {
  return unwrapData(await api.get("/api/v1/admin/audit-logs", { params: compactParams(filters) }));
}

export async function getReports() {
  return unwrapData(await api.get("/api/v1/admin/reports/overview"));
}

export async function getBugReports() {
  return unwrapData(await api.get("/api/notifications/bug-reports"));
}

export async function markNotificationRead(id) {
  return unwrapData(await api.patch(`/api/notifications/${id}/read`));
}
