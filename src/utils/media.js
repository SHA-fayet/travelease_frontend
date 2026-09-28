// src/utils/media.js

// 1. AUTO-DETECT ENVIRONMENT: Eliminates reliance on Vercel .env
const isProduction =
  typeof window !== "undefined" &&
  !window.location.hostname.includes("localhost") &&
  !window.location.hostname.includes("127.0.0.1");

export const API_BASE_URL = isProduction
  ? "https://travelease-backend-mwq0.onrender.com"
  : "https://travelease-backend-mwq0.onrender.com";

export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400";

/**
 * Normalizes image paths and strips obsolete local/Render prefixes.
 */
export const getMediaUrl = (value, path = "/images/") => {
  if (!value || typeof value !== "string") return null;

  let trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;

  if (trimmed.includes("onrender.com/images/")) {
    trimmed = trimmed.split("onrender.com/images/")[1];
  }

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return `${API_BASE_URL}${path}${encodeURIComponent(trimmed)}`;
};

/**
 * Handles avatar resolution. Falls back to default avatar if reference
 * points to a deleted local file instead of a Cloudinary/HTTPS URL.
 */
export const getAvatarUrl = (avatar) => {
  if (
    !avatar ||
    typeof avatar !== "string" ||
    avatar === "null" ||
    avatar === "undefined"
  ) {
    return DEFAULT_AVATAR;
  }

  // If the avatar is an unmigrated local disk string, use default avatar
  if (!/^(https?:|data:|blob:)/i.test(avatar.trim())) {
    return DEFAULT_AVATAR;
  }

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
  "noakhali", "bogura", "bogra", "rangpur", "dinajpur"
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
  return BANGLADESH_DESTINATION_TERMS.some((term) => normalized.includes(term));
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
    if (!url || typeof url !== "string" || url === "null") {
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
  if (!images || !Array.isArray(images) || images.length === 0) return null;

  for (const image of images.slice(0, 10)) {
    if (!image) continue;
    const url = getImageUrl(image);
    if (!url) continue;

    const valid = await isHighResImage(url, options);
    if (valid) return url;
  }

  return null;
};

/**
 * Intercepts invalid routes and prevents crashes from null/undefined arguments.
 */
export const fetchJson = async (url, options = {}) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Intercept unresolved parameter calls before firing to the backend
  if (url.includes("/undefined") || url.includes("/null")) {
    return null;
  }

  const fullUrl = url.startsWith("/api") ? `${API_BASE_URL}${url}` : url;
  const response = await fetch(fullUrl, options);

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Server returned non-JSON response from ${fullUrl}`);
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
};