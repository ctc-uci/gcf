import { useCallback, useEffect, useMemo, useState } from 'react';

import {
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
  IconButton,
  Spinner,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';

import { BaseAccountInfoSection } from './account-update-drawer/BaseAccountInfoSection';
import { RoleSpecificDetails } from './account-update-drawer/RoleSpecificDetails';
import {
  auditPictureKey,
  bioText,
  firstNonBlank,
  normalizeAccountSnapshot,
  pickStr,
  programIdKey,
  programName,
  regionIdKey,
  regionName,
  resolveProgramDisplay,
  resolveRegionDisplay,
  valueOrFallback,
} from './account-update-drawer/shared.js';

const resolvableIdFromSnap = (snap, { nameGetter, directKey, idGetter }) => {
  if (!snap) return null;
  if (nameGetter(snap)) return null;
  const direct = snap[directKey];
  if (typeof direct === 'string' && direct.trim()) return null;

  const id = idGetter(snap);
  return id != null && id !== '' ? String(id) : null;
};

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

        const programIdToResolve = (snap) =>
          resolvableIdFromSnap(snap, {
            nameGetter: programName,
            directKey: 'program',
            idGetter: (s) => s.programId ?? s.program_id ?? s.programs?.[0]?.id,
          });

        const regionIdToResolve = (snap) =>
          resolvableIdFromSnap(snap, {
            nameGetter: regionName,
            directKey: 'region',
            idGetter: (s) => s.regionId ?? s.region_id ?? s.regions?.[0]?.id,
          });

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

        const role = String(userData?.role || '').trim();

        const nextFallback = {
          first_name: String(userData?.firstName || '').trim(),
          last_name: String(userData?.lastName || '').trim(),
          email: String(userData?.email || '').trim(),
          picture: String(userData?.picture || '').trim(),
          role,
          region:
            role === 'Regional Director'
              ? Array.isArray(userData?.region)
                ? userData.region.join(', ')
                : String(userData?.region || '').trim()
              : '',
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
  }, [accountChangeId, backend, update?.userId]);

  const changeType = detail?.changeType ?? update?.changeType;

  const withFallbacks = useCallback(
    (raw) => {
      const s = normalizeAccountSnapshot(raw);
      const role = valueOrFallback(s.role, fallbackValues.role);
      return {
        ...s,
        first_name: valueOrFallback(
          firstNonBlank(s.first_name, s.firstName),
          fallbackValues.first_name
        ),
        last_name: valueOrFallback(
          firstNonBlank(s.last_name, s.lastName),
          fallbackValues.last_name
        ),
        email: valueOrFallback(s.email, fallbackValues.email),
        picture: valueOrFallback(s.picture, fallbackValues.picture),
        role,
        program: valueOrFallback(s.program, ''),
        region: valueOrFallback(s.region, fallbackValues.region),
        bio:
          role === 'Program Director'
            ? valueOrFallback(
                firstNonBlank(s.bio, s.biography),
                fallbackValues.bio
              )
            : '',
      };
    },
    [fallbackValues]
  );

  const oldSnap = useMemo(
    () => withFallbacks(detail?.oldValues),
    [detail?.oldValues, withFallbacks]
  );
  const newSnap = useMemo(
    () => withFallbacks(detail?.newValues),
    [detail?.newValues, withFallbacks]
  );

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
    const progById = programIdKey(oldSnap) !== programIdKey(newSnap);
    const regById = regionIdKey(oldSnap) !== regionIdKey(newSnap);
    const oldBio = bioText(oldSnap);
    const newBio = bioText(newSnap);
    const oldPic = auditPictureKey(detail?.oldValues);
    const newPic = auditPictureKey(detail?.newValues);

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
      progById,
      regById,
      oldBio,
      newBio,
      oldPic,
      newPic,
    };
  }, [
    detail?.oldValues,
    detail?.newValues,
    oldSnap,
    newSnap,
    programNamesById,
    regionNamesById,
  ]);

  const roleDiffers = fields.oldRole.trim() !== fields.newRole.trim();
  const programOldDisplay = roleDiffers ? '' : fields.oldProg;
  const regionOldDisplay = roleDiffers ? '' : fields.oldReg;
  const bioOldDisplay = roleDiffers ? '' : fields.oldBio;

  const newRoleNorm = fields.newRole.trim();

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
          pb={detail && !loadError && !isResolved ? 24 : 8}
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
              <BaseAccountInfoSection
                fields={fields}
                changeType={changeType}
                backend={backend}
                t={t}
              />

              <RoleSpecificDetails
                fields={fields}
                changeType={changeType}
                roleDiffers={roleDiffers}
                programOldDisplay={programOldDisplay}
                regionOldDisplay={regionOldDisplay}
                bioOldDisplay={bioOldDisplay}
                newRoleNorm={newRoleNorm}
                t={t}
              />

              <Divider />

              <Heading size="md">{t('common.editUpdates')}</Heading>
            </VStack>
          )}
        </DrawerBody>

        {!loading && detail && !loadError && !isResolved && (
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
          </Flex>
        )}
      </DrawerContent>
    </Drawer>
  );
};
