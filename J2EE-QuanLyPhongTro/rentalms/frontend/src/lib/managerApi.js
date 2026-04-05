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

export async function getManagerBuildings() {
  return unwrapData(await api.get("/api/v1/manager/buildings"));
}

export async function getManagerRooms(buildingId) {
  return unwrapData(await api.get(`/api/v1/manager/buildings/${buildingId}/rooms`));
}

export async function getMeterReadings(buildingId, period) {
  return unwrapData(
    await api.get(`/api/v1/manager/buildings/${buildingId}/meter-readings`, {
      params: compactParams({ period })
    })
  );
}

export async function createMeterReading(data) {
  return unwrapData(await api.post("/api/v1/manager/meters", data));
}

export async function getManagerMaintenance(buildingId) {
  return unwrapData(await api.get(`/api/v1/manager/buildings/${buildingId}/maintenance`));
}

export async function updateMaintenanceStatus(id, status) {
  return unwrapData(await api.patch(`/api/v1/manager/maintenance/${id}/status`, { status }));
}

export async function getManagerBills(buildingId, status) {
  return unwrapData(
    await api.get(`/api/v1/manager/buildings/${buildingId}/bills`, {
      params: compactParams({ status })
    })
  );
}

export async function confirmCashPayment(billId) {
  return unwrapData(await api.post(`/api/v1/manager/bills/${billId}/cash-confirm`));
}
