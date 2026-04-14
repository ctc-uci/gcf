export const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

export const getRoleBadgeProps = (role) => {
  switch (role) {
    case 'Program Director':
      return { bg: 'teal.100', color: 'teal.800' };
    case 'Regional Director':
      return { bg: 'teal.400', color: 'white' };
    case 'Admin':
    case 'Super Admin':
      return { bg: 'teal.700', color: 'white' };
    default:
      return { bg: 'gray.200', color: 'gray.800' };
  }
};

export const ACCOUNT_CHANGE_DEFAULTS = {
  first_name: '',
  last_name: '',
  email: '',
  picture: '',
  role: '',
  program: '',
  region: '',
  bio: '',
};

export const normalizeAccountSnapshot = (snap) => {
  if (!snap || typeof snap !== 'object') {
    return { ...ACCOUNT_CHANGE_DEFAULTS };
  }
  const { password: _omitPwd, ...rest } = snap;
  return {
    ...ACCOUNT_CHANGE_DEFAULTS,
    ...rest,
  };
};

export const isBlank = (v) => v == null || String(v).trim() === '';

export const valueOrFallback = (primary, fallback) =>
  isBlank(primary) ? (fallback ?? '') : primary;

export const firstNonBlank = (a, b) => {
  if (!isBlank(a)) return a;
  if (!isBlank(b)) return b;
  return '';
};

export const pickStr = (snap, camelKey, snakeKey) => {
  if (!snap || typeof snap !== 'object') return '';
  const v =
    snakeKey !== undefined
      ? firstNonBlank(snap[camelKey], snap[snakeKey])
      : snap[camelKey];
  if (v == null) return '';
  return String(v).trim();
};

export const programName = (snap) => {
  const list = snap?.programs ?? snap?.Programs;
  if (!Array.isArray(list) || list.length === 0) return '';
  const p = list[0];
  return p?.name != null ? String(p.name).trim() : '';
};

export const regionName = (snap) => {
  const list = snap?.regions ?? snap?.Regions;
  if (!Array.isArray(list) || list.length === 0) return '';
  const r = list[0];
  return r?.name != null ? String(r.name).trim() : '';
};

export const resolveProgramDisplay = (snap, idToName) => {
  const n = programName(snap);
  if (n) return n;
  const direct = snap?.program;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  const id = snap?.programId ?? snap?.program_id ?? snap?.programs?.[0]?.id;
  if (id == null || id === '') return '';
  const mapped = idToName[String(id)];
  return mapped && mapped.trim() ? mapped : String(id);
};

export const resolveRegionDisplay = (snap, idToName) => {
  const n = regionName(snap);
  if (n) return n;
  const direct = snap?.region;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  const id = snap?.regionId ?? snap?.region_id ?? snap?.regions?.[0]?.id;
  if (id == null || id === '') return '';
  const mapped = idToName[String(id)];
  return mapped && mapped.trim() ? mapped : String(id);
};

export const programIdKey = (snap) => {
  if (!snap || typeof snap !== 'object') return '';
  const id = snap.programId ?? snap.program_id ?? snap.programs?.[0]?.id;
  return id == null || id === '' ? '' : String(id);
};

export const regionIdKey = (snap) => {
  if (!snap || typeof snap !== 'object') return '';
  const id = snap.regionId ?? snap.region_id ?? snap.regions?.[0]?.id;
  return id == null || id === '' ? '' : String(id);
};

export const isDirectImageUrl = (s) =>
  typeof s === 'string' && /^https?:\/\//i.test(s.trim());

export const fetchPictureDisplayUrl = async (backend, keyOrUrl) => {
  if (!keyOrUrl || !String(keyOrUrl).trim()) return null;
  const raw = String(keyOrUrl).trim();
  if (isDirectImageUrl(raw)) return raw;
  try {
    const { data } = await backend.get(
      `/images/url/${encodeURIComponent(raw)}`
    );
    if (data?.success === false) return null;
    const url = data?.url != null ? String(data.url).trim() : '';
    return url || null;
  } catch (err) {
    console.error('Error fetching profile image URL:', err);
    return null;
  }
};

export const displaySrcForSlot = (hadKey, resolvedUrl) => {
  if (!hadKey) return '';
  if (resolvedUrl && String(resolvedUrl).trim() !== '') {
    return String(resolvedUrl).trim();
  }
  return DEFAULT_PROFILE_IMAGE;
};

export const pictureUrl = (snap) => {
  if (!snap || typeof snap !== 'object') return '';
  const u = firstNonBlank(
    firstNonBlank(
      firstNonBlank(snap.picture, snap.profilePicture),
      snap.profile_image
    ),
    snap.photoUrl
  );
  return typeof u === 'string' && u.trim() ? u.trim() : '';
};

export const bioText = (snap) => {
  if (!snap || typeof snap !== 'object') return '';
  const b = firstNonBlank(
    firstNonBlank(snap.biography, snap.bio),
    snap.biographyText
  );
  if (isBlank(b)) return '';
  return String(b).trim();
};
