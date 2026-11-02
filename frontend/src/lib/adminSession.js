export function clearAdminSession(storage, dispatchAuthChanged) {
  storage.removeItem("adminToken");
  storage.removeItem("adminData");
  dispatchAuthChanged();
}
