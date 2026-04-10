import { useEffect, useMemo, useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Spinner,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';

const PASSWORD_MASK = '••••••••';
const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

const getRoleBadgeProps = (role) => {
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

const ACCOUNT_CHANGE_DEFAULTS = {
  first_name: '',
  last_name: '',
  email: '',
  picture: '',
  role: '',
  program: '',
  region: '',
  bio: '',
};

const normalizeAccountSnapshot = (snap) => {
  if (!snap || typeof snap !== 'object') {
    return { ...ACCOUNT_CHANGE_DEFAULTS };
  }
  return {
    ...ACCOUNT_CHANGE_DEFAULTS,
    ...snap,
  };
};

const isBlank = (v) => v == null || String(v).trim() === '';

const valueOrFallback = (primary, fallback) =>
  isBlank(primary) ? (fallback ?? '') : primary;

const pickStr = (snap, camelKey, snakeKey) => {
  if (!snap || typeof snap !== 'object') return '';
  const v =
    snakeKey !== undefined
      ? (snap[camelKey] ?? snap[snakeKey])
      : snap[camelKey];
  if (v == null) return '';
  return String(v).trim();
};

const programName = (snap) => {
  const list = snap?.programs ?? snap?.Programs;
  if (!Array.isArray(list) || list.length === 0) return '';
  const p = list[0];
  return p?.name != null ? String(p.name).trim() : '';
};

const regionName = (snap) => {
  const list = snap?.regions ?? snap?.Regions;
  if (!Array.isArray(list) || list.length === 0) return '';
  const r = list[0];
  return r?.name != null ? String(r.name).trim() : '';
};

const resolveProgramDisplay = (snap, idToName) => {
  const n = programName(snap);
  if (n) return n;
  const direct = snap?.program;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  const id = snap?.programId ?? snap?.program_id ?? snap?.programs?.[0]?.id;
  if (id == null || id === '') return '';
  const mapped = idToName[String(id)];
  return mapped && mapped.trim() ? mapped : String(id);
};

const resolveRegionDisplay = (snap, idToName) => {
  const n = regionName(snap);
  if (n) return n;
  const direct = snap?.region;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  const id = snap?.regionId ?? snap?.region_id ?? snap?.regions?.[0]?.id;
  if (id == null || id === '') return '';
  const mapped = idToName[String(id)];
  return mapped && mapped.trim() ? mapped : String(id);
};

const isDirectImageUrl = (s) =>
  typeof s === 'string' && /^https?:\/\//i.test(s.trim());

const fetchPictureDisplayUrl = async (backend, keyOrUrl) => {
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

const displaySrcForSlot = (hadKey, resolvedUrl) => {
  if (!hadKey) return '';
  if (resolvedUrl && String(resolvedUrl).trim() !== '') {
    return String(resolvedUrl).trim();
  }
  return DEFAULT_PROFILE_IMAGE;
};

const pictureUrl = (snap) => {
  if (!snap || typeof snap !== 'object') return '';
  const u =
    snap.picture ??
    snap.profilePicture ??
    snap.profile_image ??
    snap.photoUrl ??
    '';
  return typeof u === 'string' && u.trim() ? u.trim() : '';
};

const bioText = (snap) => {
  if (!snap || typeof snap !== 'object') return '';
  const b = snap.biography ?? snap.bio ?? snap.biographyText;
  if (b == null) return '';
  return String(b).trim();
};

const passwordMaskDisplay = (snap) => {
  const p = pickStr(snap, 'password');
  return p ? PASSWORD_MASK : '';
};

const passwordsDiffer = (oldSnap, newSnap) => {
  const o = pickStr(oldSnap, 'password');
  const n = pickStr(newSnap, 'password');
  return o !== n;
};

const DiffField = ({
  label,
  oldValue,
  newValue,
  changeType,
  isPassword = false,
}) => {
  const oldStr = isPassword ? oldValue : (oldValue ?? '');
  const newStr = isPassword ? newValue : (newValue ?? '');
  const isCreation = changeType === 'Creation';

  if (isCreation) {
    if (!newStr) return null;
    return (
      <Box>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          {label}
        </Text>
        <Text>{newStr}</Text>
      </Box>
    );
  }

  if (!oldStr && !newStr) return null;

  const hasChange = String(oldStr) !== String(newStr);

  return (
    <Box>
      <Text
        color="teal.500"
        fontSize="sm"
        fontWeight="500"
        mb={1}
      >
        {label}
      </Text>
      {hasChange ? (
        <HStack
          spacing={2}
          align="baseline"
          flexWrap="wrap"
        >
          {oldStr ? (
            <Text
              as="span"
              textDecoration="line-through"
              color="gray.500"
            >
              {oldStr}
            </Text>
          ) : null}
          {newStr ? <Text as="span">{newStr}</Text> : null}
        </HStack>
      ) : (
        <Text>{newStr || oldStr}</Text>
      )}
    </Box>
  );
};

const RoleDiffField = ({ oldRole, newRole, changeType }) => {
  const { t } = useTranslation();
  const isCreation = changeType === 'Creation';
  const newRoleBadge = getRoleBadgeProps(newRole);
  const oldRoleBadge = getRoleBadgeProps(oldRole);

  if (isCreation) {
    if (!newRole) return null;
    return (
      <Box>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          {t('common.role')}
        </Text>
        <Badge
          bg={newRoleBadge.bg}
          color={newRoleBadge.color}
          borderRadius="md"
          px={2}
          py={0.5}
        >
          {newRole}
        </Badge>
      </Box>
    );
  }

  if (!oldRole && !newRole) return null;
  const hasChange = oldRole !== newRole;

  if (!hasChange) {
    return (
      <Box>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          {t('common.role')}
        </Text>
        <Badge
          bg={newRoleBadge.bg}
          color={newRoleBadge.color}
          borderRadius="md"
          px={2}
          py={0.5}
        >
          {newRole || oldRole}
        </Badge>
      </Box>
    );
  }

  return (
    <Box>
      <Text
        color="teal.500"
        fontSize="sm"
        fontWeight="500"
        mb={1}
      >
        {t('common.role')}
      </Text>
      <HStack
        spacing={2}
        flexWrap="wrap"
      >
        {oldRole ? (
          <Badge
            bg={oldRoleBadge.bg}
            color={oldRoleBadge.color}
            borderRadius="md"
            px={2}
            py={0.5}
            textDecoration="line-through"
            opacity={0.75}
          >
            {oldRole}
          </Badge>
        ) : null}
        {newRole ? (
          <Badge
            bg={newRoleBadge.bg}
            color={newRoleBadge.color}
            borderRadius="md"
            px={2}
            py={0.5}
          >
            {newRole}
          </Badge>
        ) : null}
      </HStack>
    </Box>
  );
};

function AccountChangeProfileImages({
  oldKey,
  newKey,
  changeType,
  backend,
  t,
}) {
  const [oldResolved, setOldResolved] = useState(null);
  const [newResolved, setNewResolved] = useState(null);
  const [resolving, setResolving] = useState(false);

  const hasOld = Boolean(oldKey && String(oldKey).trim());
  const hasNew = Boolean(newKey && String(newKey).trim());

  useEffect(() => {
    if (!backend) {
      setOldResolved(null);
      setNewResolved(null);
      setResolving(false);
      return;
    }

    if (!hasOld && !hasNew) {
      setOldResolved(null);
      setNewResolved(null);
      setResolving(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setResolving(true);
      try {
        const [o, n] = await Promise.all([
          hasOld
            ? fetchPictureDisplayUrl(backend, oldKey)
            : Promise.resolve(null),
          hasNew
            ? fetchPictureDisplayUrl(backend, newKey)
            : Promise.resolve(null),
        ]);
        if (!cancelled) {
          setOldResolved(o);
          setNewResolved(n);
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [backend, oldKey, newKey, hasOld, hasNew]);

  const label = (
    <Text
      color="teal.500"
      fontSize="sm"
      fontWeight="500"
      mb={2}
    >
      {t('common.profilePicture')}
    </Text>
  );

  if (resolving) {
    return (
      <Box>
        {label}
        <Spinner size="md" />
      </Box>
    );
  }

  const displayOld = displaySrcForSlot(hasOld, oldResolved);
  const displayNew = displaySrcForSlot(hasNew, newResolved);

  const keysDiffer =
    hasOld && hasNew && String(oldKey).trim() !== String(newKey).trim();

  if (!hasOld && !hasNew) {
    return (
      <Box>
        {label}
        <Image
          src={DEFAULT_PROFILE_IMAGE}
          boxSize="120px"
          borderRadius="full"
          objectFit="cover"
          alt={t('common.profilePicture')}
        />
      </Box>
    );
  }

  if (changeType === 'Creation') {
    const src = hasNew
      ? displayNew
      : hasOld
        ? displayOld
        : DEFAULT_PROFILE_IMAGE;
    return (
      <Box>
        {label}
        <Image
          src={src}
          boxSize="120px"
          borderRadius="full"
          objectFit="cover"
          alt={t('common.newProfile')}
        />
      </Box>
    );
  }

  if (!keysDiffer) {
    const single = hasNew
      ? displayNew
      : hasOld
        ? displayOld
        : DEFAULT_PROFILE_IMAGE;
    return (
      <Box>
        {label}
        <Image
          src={single}
          boxSize="120px"
          borderRadius="full"
          objectFit="cover"
          alt={t('common.profilePicture')}
        />
      </Box>
    );
  }

  return (
    <Box>
      {label}
      <HStack
        spacing={4}
        align="flex-start"
      >
        {hasOld ? (
          <Image
            src={displayOld}
            boxSize="120px"
            borderRadius="full"
            objectFit="cover"
            alt={t('common.oldProfile')}
            opacity={0.85}
            sx={{ WebkitFilter: 'grayscale(35%)' }}
          />
        ) : null}
        {hasNew ? (
          <Image
            src={displayNew}
            boxSize="120px"
            borderRadius="full"
            objectFit="cover"
            alt={t('common.newProfile')}
          />
        ) : null}
      </HStack>
    </Box>
  );
}

export const AccountUpdateDrawer = ({
  update,
  onClose,
  onAccountChangeUpdated,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { backend } = useBackendContext();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [programNamesById, setProgramNamesById] = useState({});
  const [regionNamesById, setRegionNamesById] = useState({});
  const [fallbackValues, setFallbackValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    picture: '',
    role: '',
    program: '',
    region: '',
    bio: '',
  });

  const accountChangeId = update?.id;

  useEffect(() => {
    if (!accountChangeId || !backend) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data: change } = await backend.get(
          `/accountChange/${accountChangeId}`
        );

        const targetUserId = change?.userId ?? update?.userId ?? '';

        const oldRaw = normalizeAccountSnapshot(change?.oldValues);
        const newRaw = normalizeAccountSnapshot(change?.newValues);

        const fetchUser = targetUserId
          ? backend
              .get(`/gcf-users/${targetUserId}`)
              .then((r) => r.data)
              .catch(() => null)
          : Promise.resolve(null);

        const programIdToResolve = (snap) => {
          if (!snap) return null;
          if (programName(snap)) return null;
          if (typeof snap.program === 'string' && snap.program.trim())
            return null;
          const id =
            snap.programId ?? snap.program_id ?? snap.programs?.[0]?.id;
          return id != null && id !== '' ? String(id) : null;
        };

        const regionIdToResolve = (snap) => {
          if (!snap) return null;
          if (regionName(snap)) return null;
          if (typeof snap.region === 'string' && snap.region.trim())
            return null;
          const id = snap.regionId ?? snap.region_id ?? snap.regions?.[0]?.id;
          return id != null && id !== '' ? String(id) : null;
        };

        const programIds = [
          ...new Set(
            [programIdToResolve(oldRaw), programIdToResolve(newRaw)].filter(
              Boolean
            )
          ),
        ];
        const regionIds = [
          ...new Set(
            [regionIdToResolve(oldRaw), regionIdToResolve(newRaw)].filter(
              Boolean
            )
          ),
        ];

        const [userData, progEntries, regEntries] = await Promise.all([
          fetchUser,
          Promise.all(
            programIds.map(async (id) => {
              try {
                const { data } = await backend.get(`/program/${id}`);
                return [id, data?.name != null ? String(data.name).trim() : ''];
              } catch {
                return [id, ''];
              }
            })
          ),
          Promise.all(
            regionIds.map(async (id) => {
              try {
                const { data } = await backend.get(`/region/${id}`);
                return [id, data?.name != null ? String(data.name).trim() : ''];
              } catch {
                return [id, ''];
              }
            })
          ),
        ]);

        let role = String(userData?.role || '').trim();
        let program = '';
        let region = '';

        if (role === 'Program Director' && targetUserId) {
          try {
            const { data: programData } = await backend.get(
              `/program-directors/me/${targetUserId}/program`
            );
            program = String(programData?.name || '').trim();
          } catch {
            // best-effort
          }
        } else if (role === 'Regional Director' && targetUserId) {
          try {
            const { data: rdData } = await backend.get(
              `/regional-directors/me/${targetUserId}`
            );
            if (rdData?.regionId) {
              const { data: regionData } = await backend.get(
                `/region/${rdData.regionId}`
              );
              region = String(regionData?.name || '').trim();
            }
          } catch {
            // best-effort
          }
        }

        const nextFallback = {
          first_name: String(userData?.firstName || '').trim(),
          last_name: String(userData?.lastName || '').trim(),
          email: String(userData?.email || '').trim(),
          picture: String(userData?.picture || '').trim(),
          role,
          program,
          region,
          bio:
            role === 'Program Director'
              ? String(userData?.bio || '').trim()
              : '',
        };

        if (cancelled) return;
        setDetail(change);
        setFallbackValues(nextFallback);
        setProgramNamesById(Object.fromEntries(progEntries));
        setRegionNamesById(Object.fromEntries(regEntries));
      } catch (e) {
        console.error('AccountUpdateDrawer fetch failed:', e);
        if (!cancelled) {
          setLoadError(e?.response?.data || e?.message || 'Failed to load');
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [accountChangeId, backend]);

  const changeType = detail?.changeType ?? update?.changeType;

  const oldSnap = useMemo(() => {
    const s = normalizeAccountSnapshot(detail?.oldValues);
    const role = valueOrFallback(s.role, fallbackValues.role);
    return {
      ...s,
      first_name: valueOrFallback(
        s.first_name ?? s.firstName,
        fallbackValues.first_name
      ),
      last_name: valueOrFallback(
        s.last_name ?? s.lastName,
        fallbackValues.last_name
      ),
      email: valueOrFallback(s.email, fallbackValues.email),
      picture: valueOrFallback(s.picture, fallbackValues.picture),
      role,
      program: valueOrFallback(s.program, fallbackValues.program),
      region: valueOrFallback(s.region, fallbackValues.region),
      bio:
        role === 'Program Director'
          ? valueOrFallback(s.bio ?? s.biography, fallbackValues.bio)
          : '',
    };
  }, [detail?.oldValues, fallbackValues]);

  const newSnap = useMemo(() => {
    const s = normalizeAccountSnapshot(detail?.newValues);
    const role = valueOrFallback(s.role, fallbackValues.role);
    return {
      ...s,
      first_name: valueOrFallback(
        s.first_name ?? s.firstName,
        fallbackValues.first_name
      ),
      last_name: valueOrFallback(
        s.last_name ?? s.lastName,
        fallbackValues.last_name
      ),
      email: valueOrFallback(s.email, fallbackValues.email),
      picture: valueOrFallback(s.picture, fallbackValues.picture),
      role,
      program: valueOrFallback(s.program, fallbackValues.program),
      region: valueOrFallback(s.region, fallbackValues.region),
      bio:
        role === 'Program Director'
          ? valueOrFallback(s.bio ?? s.biography, fallbackValues.bio)
          : '',
    };
  }, [detail?.newValues, fallbackValues]);

  const fields = useMemo(() => {
    const oldFirst = pickStr(oldSnap, 'firstName', 'first_name');
    const newFirst = pickStr(newSnap, 'firstName', 'first_name');
    const oldLast = pickStr(oldSnap, 'lastName', 'last_name');
    const newLast = pickStr(newSnap, 'lastName', 'last_name');
    const oldEmail = pickStr(oldSnap, 'email');
    const newEmail = pickStr(newSnap, 'email');
    const oldRole = pickStr(oldSnap, 'role');
    const newRole = pickStr(newSnap, 'role');
    const oldProg = resolveProgramDisplay(oldSnap, programNamesById);
    const newProg = resolveProgramDisplay(newSnap, programNamesById);
    const oldReg = resolveRegionDisplay(oldSnap, regionNamesById);
    const newReg = resolveRegionDisplay(newSnap, regionNamesById);
    const oldBio = bioText(oldSnap);
    const newBio = bioText(newSnap);
    const oldPic = pictureUrl(oldSnap);
    const newPic = pictureUrl(newSnap);

    const pwdOld = passwordMaskDisplay(oldSnap);
    const pwdNew = passwordMaskDisplay(newSnap);
    const showPassword =
      changeType === 'Creation'
        ? Boolean(passwordMaskDisplay(newSnap))
        : passwordsDiffer(oldSnap, newSnap) ||
          Boolean(passwordMaskDisplay(oldSnap)) ||
          Boolean(passwordMaskDisplay(newSnap));

    return {
      oldFirst,
      newFirst,
      oldLast,
      newLast,
      oldEmail,
      newEmail,
      oldRole,
      newRole,
      oldProg,
      newProg,
      oldReg,
      newReg,
      oldBio,
      newBio,
      oldPic,
      newPic,
      pwdOld,
      pwdNew,
      showPassword,
    };
  }, [oldSnap, newSnap, changeType, programNamesById, regionNamesById]);

  const isResolved = Boolean(detail?.resolved);

  const applyResolvedStatus = async (nextResolved) => {
    if (!accountChangeId || !backend) return;
    setSaving(true);
    try {
      const { data } = await backend.put(`/accountChange/${accountChangeId}`, {
        resolved: nextResolved,
        last_modified: new Date().toISOString(),
      });
      setDetail(data);
      onAccountChangeUpdated?.();
      toast({
        title: nextResolved ? t('common.resolved') : t('common.unresolved'),
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      onClose();
    } catch (e) {
      console.error('Account change update failed:', e);
      toast({
        title: t('accountForm.errorTitle'),
        description:
          typeof e?.response?.data === 'string' ? e.response.data : e?.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!update) return null;

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      placement="right"
      size={isFullScreen ? 'full' : 'lg'}
    >
      <DrawerOverlay />
      <DrawerContent maxW={isFullScreen ? '100%' : '50%'}>
        <Flex
          position="absolute"
          top={3}
          left={3}
          zIndex={1}
        >
          <IconButton
            icon={isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
            aria-label={
              isFullScreen
                ? t('fullscreenFlyout.minimize')
                : t('fullscreenFlyout.expand')
            }
            variant="ghost"
            size="sm"
            onClick={() => setIsFullScreen(!isFullScreen)}
          />
        </Flex>

        <Box
          pt={6}
          pb={2}
          px={8}
        >
          <Text
            fontSize="xl"
            fontWeight="600"
            textAlign="center"
          >
            {t('common.accountUpdate')}
          </Text>
          <Divider mt={3} />
        </Box>

        <DrawerBody
          px={8}
          pb={24}
        >
          {loading && (
            <Center py={12}>
              <Spinner size="lg" />
            </Center>
          )}
          {loadError && !loading && (
            <Text
              color="red.500"
              py={4}
            >
              {String(loadError)}
            </Text>
          )}
          {!loading && !loadError && detail && (
            <VStack
              spacing={5}
              align="stretch"
              mt={6}
            >
              <AccountChangeProfileImages
                oldKey={fields.oldPic}
                newKey={fields.newPic}
                changeType={changeType}
                backend={backend}
                t={t}
              />

              <DiffField
                label={t('common.firstName')}
                oldValue={fields.oldFirst}
                newValue={fields.newFirst}
                changeType={changeType}
              />
              <DiffField
                label={t('common.lastName')}
                oldValue={fields.oldLast}
                newValue={fields.newLast}
                changeType={changeType}
              />
              <DiffField
                label={t('common.email')}
                oldValue={fields.oldEmail}
                newValue={fields.newEmail}
                changeType={changeType}
              />
              {fields.showPassword && (
                <DiffField
                  label={t('common.password')}
                  oldValue={fields.pwdOld}
                  newValue={fields.pwdNew}
                  changeType={changeType}
                  isPassword
                />
              )}

              <RoleDiffField
                oldRole={fields.oldRole}
                newRole={fields.newRole}
                changeType={changeType}
              />

              <DiffField
                label={t('common.program')}
                oldValue={fields.oldProg}
                newValue={fields.newProg}
                changeType={changeType}
              />
              <DiffField
                label={t('common.region')}
                oldValue={fields.oldReg}
                newValue={fields.newReg}
                changeType={changeType}
              />
              <DiffField
                label={t('common.biography')}
                oldValue={fields.oldBio}
                newValue={fields.newBio}
                changeType={changeType}
              />

              <Divider />

              <Heading size="md">{t('common.editUpdates')}</Heading>
            </VStack>
          )}
        </DrawerBody>

        {!loading && detail && !loadError && (
          <Flex
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="white"
            borderTop="1px solid"
            borderColor="gray.200"
            px={8}
            py={4}
            justify="flex-end"
            gap={3}
          >
            {isResolved ? (
              <>
                <Button
                  variant="outline"
                  isDisabled={saving}
                  isLoading={saving}
                  onClick={() => applyResolvedStatus(false)}
                >
                  {t('common.markAsUnresolved')}
                </Button>
                <Button
                  bg="teal.500"
                  color="white"
                  _hover={{ bg: 'teal.600' }}
                  isDisabled={saving}
                  onClick={onClose}
                >
                  {t('common.keepResolved')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  isDisabled={saving}
                  onClick={onClose}
                >
                  {t('common.keepUnresolved')}
                </Button>
                <Button
                  bg="teal.500"
                  color="white"
                  _hover={{ bg: 'teal.600' }}
                  isDisabled={saving}
                  isLoading={saving}
                  onClick={() => applyResolvedStatus(true)}
                >
                  {t('common.saveMarkResolved')}
                </Button>
              </>
            )}
          </Flex>
        )}
      </DrawerContent>
    </Drawer>
  );
};
