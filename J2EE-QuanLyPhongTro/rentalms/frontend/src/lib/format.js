export function formatMoney(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(value) {
  if (!value) {
    return "--";
  }
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) {
    return "--";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function getInitials(name) {
  return (name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
