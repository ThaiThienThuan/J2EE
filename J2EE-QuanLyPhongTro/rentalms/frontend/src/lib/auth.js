const TOKEN_KEY = "rentalms_token";

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser() {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }
    const parsed = JSON.parse(decodeBase64Url(payload));
    return {
      id: parsed.userId ?? parsed.sub ?? null,
      email: parsed.email ?? "",
      fullName: parsed.fullName ?? parsed.name ?? parsed.email ?? "User",
      role: parsed.role ?? ""
    };
  } catch (_error) {
    clearToken();
    return null;
  }
}

export function getRole() {
  return getUser()?.role ?? "";
}

export function isLoggedIn() {
  return Boolean(getToken() && getUser());
}
