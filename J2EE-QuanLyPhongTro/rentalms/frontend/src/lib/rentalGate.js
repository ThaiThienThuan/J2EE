import toast from "react-hot-toast";

/**
 * @param {object|null|undefined} profile — GET /api/v1/profile/me
 * @param {import("react-router-dom").NavigateFunction} navigate
 */
export function assertCccdForRental(profile, navigate) {
  if (profile?.cccdFrontUrl && String(profile.cccdFrontUrl).trim()) {
    return true;
  }
  toast.error("Vui long cap nhat anh CCCD trong trang Ho so truoc khi dang ky thue.");
  navigate("/tenant/profile");
  return false;
}
