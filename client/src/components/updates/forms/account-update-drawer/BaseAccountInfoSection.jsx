import { useEffect, useState } from 'react';

import {
  Badge,
  Box,
  HStack,
  Image,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';

import { DiffField } from './DiffField';
import {
  DEFAULT_PROFILE_IMAGE,
  displaySrcForSlot,
  fetchPictureDisplayUrl,
  getRoleBadgeProps,
} from './shared';

const RoleDiffField = ({ oldRole, newRole, changeType, t }) => {
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

const ProfileImageDiff = ({ oldKey, newKey, backend, t }) => {
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

  const unchanged =
    hasOld && hasNew && String(oldKey).trim() === String(newKey).trim();

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

  if (unchanged) {
    const single = displayNew || displayOld || DEFAULT_PROFILE_IMAGE;
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

  const oldSrc = hasOld ? displayOld : DEFAULT_PROFILE_IMAGE;
  const newSrc = hasNew ? displayNew : DEFAULT_PROFILE_IMAGE;

  return (
    <Box>
      {label}
      <HStack
        spacing={4}
        align="flex-start"
      >
        <VStack
          spacing={1}
          align="center"
        >
          <Image
            src={oldSrc}
            boxSize="120px"
            borderRadius="full"
            objectFit="cover"
            alt={t('common.oldProfile')}
            {...(hasOld
              ? {
                  opacity: 0.85,
                  sx: { WebkitFilter: 'grayscale(35%)' },
                }
              : {})}
          />
          <Text
            fontSize="xs"
            color="gray.600"
            fontWeight="500"
          >
            {t('common.diffLabelOld')}
          </Text>
        </VStack>
        <VStack
          spacing={1}
          align="center"
        >
          <Image
            src={newSrc}
            boxSize="120px"
            borderRadius="full"
            objectFit="cover"
            alt={t('common.newProfile')}
          />
          <Text
            fontSize="xs"
            color="gray.600"
            fontWeight="500"
          >
            {t('common.diffLabelNew')}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export const BaseAccountInfoSection = ({ fields, changeType, backend, t }) => (
  <>
    <ProfileImageDiff
      oldKey={fields.oldPic}
      newKey={fields.newPic}
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
    <RoleDiffField
      oldRole={fields.oldRole}
      newRole={fields.newRole}
      changeType={changeType}
      t={t}
    />
  </>
);
