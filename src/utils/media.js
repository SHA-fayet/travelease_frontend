// src/utils/media.js

// Keep all backend-served media URL logic in one place.
// Vite will use the frontend dev server for /api requests, but images are
// served directly by Express at /images, so we use the API base URL here.

const rawApiBaseUrl =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

export const DEFAULT_AVATAR = "/default-avatar.png";

/**
 * Converts a stored image value (filename, absolute URL, root-relative URL,
 * blob URL, etc.) into a browser-usable URL.
 */
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

/**
 * Resolves a stored avatar filename into a usable URL.
 */
export const getAvatarUrl = (avatar) => {
  return getMediaUrl(avatar) || DEFAULT_AVATAR;
};

/**
 * Resolves a stored package/travel image filename into a usable URL.
 */
export const getImageUrl = (image) => {
  return getMediaUrl(image);
};

/**
 * Determine whether a destination belongs to Bangladesh.
 *
 * This is deliberately an allow-list rather than a block-list so foreign
 * destinations are never accidentally shown on the Bangladesh homepage.
 */
const BANGLADESH_DESTINATION_TERMS = [
  "bangladesh",
  "dhaka",
  "chattogram",
  "chittagong",
  "cox's bazar",
  "cox bazar",
  "coxs bazar",
  "sajek",
  "rangamati",
  "bandarban",
  "nilgiri",
  "nilachal",
  "thanchi",
  "tanguar haor",
  "sylhet",
  "sreemangal",
  "srimangal",
  "madhabkunda",
  "jaflong",
  "bichanakandi",
  "bisnakandi",
  "ratargul",
  "sunamganj",
  "kuakata",
  "patenga",
  "sitakunda",
  "chandranath",
  "kaptai",
  "khagrachari",
  "alutila",
  "sajek valley",
  "st. martin",
  "saint martin",
  "st martin",
  "inani",
  "himchari",
  "sundarbans",
  "sundarban",
  "mangla",
  "nijhum dwip",
  "sonargaon",
  "paharpur",
  "mahasthangarh",
  "bhawal",
  "mymensingh",
  "barishal",
  "rajshahi",
  "khulna",
  "comilla",
  "cumilla",
  "feni",
  "noakhali",
  "bogura",
  "bogra",
  "rangpur",
  "dinajpur",
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

/**
 * Checks actual image dimensions in the browser instead of trusting the
 * filename, database record, or HTTP status.
 */
export const isHighResImage = (
  url,
  {
    minWidth = 1200,
    minHeight = 700,
    minAspectRatio = 1.2,
  } = {}
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

/**
 * Returns the first image belonging to a package that passes the real
 * resolution/shape test. Package images are checked in their stored order.
 */
export const getFirstHighResImage = async (
  images = [],
  options = {}
) => {
  for (const image of images.slice(0, 10)) {
    const url = getImageUrl(image);
    if (!url) continue;

    const valid = await isHighResImage(url, options);
    if (valid) return url;
  }

  return null;
};

/**
 * Basic error-safe fetch helper used by homepage modules.
 */
export const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
};
