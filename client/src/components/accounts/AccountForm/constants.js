export const DEFAULT_PROFILE_IMAGE = '/default-profile.png';
export const LABEL_COLOR = 'teal.600';

export const getRoleBadgeProps = (roleName) => {
  switch (roleName) {
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

export const INITIAL_FORM_STATE = {
  first_name: '',
  last_name: '',
  role: '',
  email: '',
  password: '',
  programs: [],
  regions: [],
};

export const formStateToAuditSnapshot = (fd, meta = {}) => ({
  email: fd.email,
  firstName: fd.first_name,
  lastName: fd.last_name,
  role: fd.role,
  programId: fd.programs?.length > 0 ? Number(fd.programs[0].id) : null,
  regionId: fd.regions?.length > 0 ? Number(fd.regions[0].id) : null,
  ...(meta.currentUserId !== undefined && meta.currentUserId !== null
    ? { currentUserId: meta.currentUserId }
    : {}),
  ...(meta.targetId !== undefined && meta.targetId !== null
    ? { targetId: meta.targetId }
    : {}),
});
