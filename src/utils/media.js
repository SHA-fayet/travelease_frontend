// src/utils/media.js

// Hardcoded fallback guarantees Vercel will always connect to Render
const rawApiBaseUrl =
  import.meta.env?.VITE_API_BASE_URL || 
  import.meta.env?.VITE_API_URL || 
  "https://travelease-backend-mwq0.onrender.com";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

export const DEFAULT_AVATAR = "/default-avatar.png";

export const getMediaUrl = (value, path = "/images/") => {
  if (!value || typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return `${API_BASE_URL}${path}${encodeURIComponent(trimmed)}`;
};

export const getAvatarUrl = (avatar) => {
  return getMediaUrl(avatar) || DEFAULT_AVATAR;
};

export const getImageUrl = (image) => {
  return getMediaUrl(image);
};

const BANGLADESH_DESTINATION_TERMS = [
  "bangladesh", "dhaka", "chattogram", "chittagong", "cox's bazar",
  "cox bazar", "coxs bazar", "sajek", "rangamati", "bandarban",
  "nilgiri", "nilachal", "thanchi", "tanguar haor", "sylhet",
  "sreemangal", "srimangal", "madhabkunda", "jaflong", "bichanakandi",
  "bisnakandi", "ratargul", "sunamganj", "kuakata", "patenga",
  "sitakunda", "chandranath", "kaptai", "khagrachari", "alutila",
  "sajek valley", "st. martin", "saint martin", "st martin", "inani",
  "himchari", "sundarbans", "sundarban", "mangla", "nijhum dwip",
  "sonargaon", "paharpur", "mahasthangarh", "bhawal", "mymensingh",
  "barishal", "rajshahi", "khulna", "comilla", "cumilla", "feni",
  "noakhali", "bogura", "bogra", "rangpur", "dinajpur",
];

export const normalizeDestination = (destination = "") =>
  String(destination)
    .trim()
    .toLowerCase()
    .replace(/[–—-]/g, " ")
    .replace(/\s+/g, " ");

export const isBangladeshDestination = (destination) => {
  const normalized = normalizeDestination(destination);
  if (!normalized) return false;
  return BANGLADESH_DESTINATION_TERMS.some((term) =>
    normalized.includes(term)
  );
};

export const filterBangladeshPackages = (packages = []) => {
  return packages.filter((packageData) =>
    isBangladeshDestination(packageData?.packageDestination)
  );
};

export const isHighResImage = (
  url,
  { minWidth = 1200, minHeight = 700, minAspectRatio = 1.2 } = {}
) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.naturalWidth / Math.max(img.naturalHeight, 1);
      resolve(
        img.naturalWidth >= minWidth &&
          img.naturalHeight >= minHeight &&
          aspectRatio >= minAspectRatio
      );
    };
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

export const getFirstHighResImage = async (images = [], options = {}) => {
  for (const image of images.slice(0, 10)) {
    const url = getImageUrl(image);
    if (!url) continue;

    const valid = await isHighResImage(url, options);
    if (valid) return url;
  }
  return null;
};

export const fetchJson = async (url, options = {}) => {
  // CRITICAL FIX: Automatically attach Render URL to any relative /api request
  const fullUrl = url.startsWith("/api") ? `${API_BASE_URL}${url}` : url;

  const response = await fetch(fullUrl, options);
  
  // Handle text parsing safely to avoid unexpected token 'T' errors
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(`Server returned non-JSON response: ${text.substring(0, 20)}...`);
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
};