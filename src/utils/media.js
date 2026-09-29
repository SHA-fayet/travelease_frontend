export const getImageUrl = (data) => {
  const fallbackImg = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";
  if (!data) return fallbackImg;

  let path = data?.packageImages || data?.images || data;
  if (Array.isArray(path)) path = path[0];

  if (typeof path === 'string' && path.trim().startsWith('{')) {
    try { path = JSON.parse(path); } catch (e) {}
  }

  if (path && typeof path === 'object' && path.url) path = path.url;

  if (!path || typeof path !== "string" || path === "null" || path === "undefined" || path === "[object Object]") {
    return fallbackImg;
  }

  return path.startsWith("http") ? path : `https://travelease-backend-mwq0.onrender.com/images/${path}`;
};

// Added back missing helper functions to satisfy Top.jsx imports
export const fetchJson = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Fetch JSON error:", error);
    return null;
  }
};

export const filterBangladeshPackages = (packages) => {
  if (!Array.isArray(packages)) return [];
  return packages;
};

export const getFirstHighResImage = (pkg) => {
  return getImageUrl(pkg);
};