export const formatDate = (dateString) => {
  if (!dateString) return "No Data";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const extractAddress = (location, accessor) => {
  if (!location) return "No Data";
  try {
    const parsed = typeof location === "string" ? JSON.parse(location) : location;
    return parsed?.[accessor] ?? "No Address";
  } catch {
    return location;
  }
};