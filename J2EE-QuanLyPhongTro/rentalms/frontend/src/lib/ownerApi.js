import { api, unwrapData } from "./api";

function compactParams(params = {}) {
  const result = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "ALL") {
      result[key] = value;
    }
  });
  return result;
}

export async function getOwnerBuildings() {
  return unwrapData(await api.get("/api/v1/owner/buildings"));
}

export async function getOwnerBuildingDetail(id) {
  return unwrapData(await api.get(`/api/v1/owner/buildings/${id}`));
}

export async function getBuildingManagers(buildingId) {
  return unwrapData(await api.get(`/api/v1/owner/buildings/${buildingId}/managers`));
}

export async function assignManager(buildingId, managerId) {
  return unwrapData(
    await api.post(`/api/v1/owner/buildings/${buildingId}/assignments`, { managerId })
  );
}

export async function unassignManager(buildingId, managerId) {
  return unwrapData(
    await api.delete(`/api/v1/owner/buildings/${buildingId}/assignments/${managerId}`)
  );
}

export async function getOwnerRooms(filters = {}) {
  return unwrapData(await api.get("/api/v1/owner/rooms", { params: compactParams(filters) }));
}

export async function getOwnerRentalRequests(status) {
  return unwrapData(
    await api.get("/api/v1/owner/rental-requests", { params: compactParams({ status }) })
  );
}

export async function approveRentalRequest(id) {
  return unwrapData(await api.put(`/api/v1/owner/rental-requests/${id}/approve`));
}

export async function rejectRentalRequest(id) {
  return unwrapData(await api.put(`/api/v1/owner/rental-requests/${id}/reject`));
}

export async function getOwnerContracts(status) {
  return unwrapData(await api.get("/api/v1/owner/contracts", { params: compactParams({ status }) }));
}

export async function activateContract(id) {
  return unwrapData(await api.post(`/api/v1/owner/contracts/${id}/activate`));
}

export async function terminateContract(id) {
  return unwrapData(await api.put(`/api/v1/owner/contracts/${id}/terminate`));
}

export async function renewContract(id, newEndDate) {
  return unwrapData(await api.put(`/api/v1/owner/contracts/${id}/renew`, { newEndDate }));
}

export async function getOwnerBills(status) {
  return unwrapData(await api.get("/api/v1/owner/bills", { params: compactParams({ status }) }));
}

export async function getAvailableManagers() {
  return unwrapData(await api.get("/api/v1/owner/available-managers"));
}

export async function createBuilding(body) {
  return unwrapData(await api.post("/api/v1/owner/buildings", body));
}

export async function createOwnerRoom(buildingId, body) {
  return unwrapData(await api.post(`/api/v1/owner/buildings/${buildingId}/rooms`, body));
}

export async function downloadOwnerContractDocx(contractId) {
  const res = await api.get(`/api/v1/owner/contracts/${contractId}/download`, { responseType: "blob" });
  return res.data;
}
