//TODO: check this again

import { useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';

const DiffField = ({ label, oldValue, newValue }) => {
  if (!oldValue && !newValue) return null;
  const hasChange = oldValue && newValue && oldValue !== newValue;

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
        <HStack spacing={2}>
          <Text
            as="span"
            textDecoration="line-through"
            color="gray.500"
          >
            {oldValue}
          </Text>
          <Text as="span">{newValue}</Text>
        </HStack>
      ) : (
        <Text>{newValue || oldValue || ''}</Text>
      )}
    </Box>
  );
};

const RoleDiffField = ({ oldRole, newRole }) => {
  const { t } = useTranslation();
  const hasChange = oldRole && newRole && oldRole !== newRole;

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
      <HStack spacing={2}>
        {hasChange && oldRole && (
          <Badge
            variant="outline"
            textDecoration="line-through"
            color="gray.400"
            borderColor="gray.300"
          >
            {oldRole}
          </Badge>
        )}
        {newRole && (
          <Badge
            bg="teal.500"
            color="white"
            borderRadius="md"
            px={2}
            py={0.5}
          >
            {newRole}
          </Badge>
        )}
      </HStack>
    </Box>
  );
};

export const AccountUpdateDrawer = ({ update, onClose }) => {
  const { t } = useTranslation();
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!update) return null;

  const changes = update.changes || {};
  const oldPicture = changes.oldPicture || update.oldPicture;
  const newPicture = changes.newPicture || update.newPicture;

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      placement="right"
      size={isFullScreen ? 'full' : 'lg'}
    >
      <DrawerOverlay />
      <DrawerContent maxW={isFullScreen ? '100%' : '50%'}>
        {/* Expand/Minimize toggle */}
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

        {/* Header */}
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
          <VStack
            spacing={5}
            align="stretch"
            mt={6}
          >
            {(oldPicture || newPicture) && (
              <Box>
                <Text
                  color="teal.500"
                  fontSize="sm"
                  fontWeight="500"
                  mb={2}
                >
                  {t('common.profilePicture')}
                </Text>
                <HStack spacing={4}>
                  {oldPicture && (
                    <Image
                      src={oldPicture}
                      boxSize="120px"
                      borderRadius="full"
                      objectFit="cover"
                      alt={t('common.oldProfile')}
                    />
                  )}
                  {newPicture && (
                    <Image
                      src={newPicture}
                      boxSize="120px"
                      borderRadius="full"
                      objectFit="cover"
                      alt={t('common.newProfile')}
                    />
                  )}
                </HStack>
              </Box>
            )}

            {/* Diff Fields */}
            <DiffField
              label={t('common.firstName')}
              oldValue={changes.oldFirstName}
              newValue={changes.newFirstName}
            />
            <DiffField
              label={t('common.lastName')}
              oldValue={changes.oldLastName}
              newValue={changes.newLastName}
            />
            <DiffField
              label={t('common.email')}
              oldValue={changes.oldEmail}
              newValue={changes.newEmail}
            />
            <DiffField
              label={t('common.password')}
              oldValue={changes.oldPassword}
              newValue={changes.newPassword}
            />

            <RoleDiffField
              oldRole={changes.oldRole}
              newRole={changes.newRole}
            />

            <DiffField
              label={t('common.program')}
              oldValue={changes.oldProgram}
              newValue={changes.newProgram}
            />
            <DiffField
              label={t('common.region')}
              oldValue={changes.oldRegion}
              newValue={changes.newRegion}
            />
            <DiffField
              label={t('common.biography')}
              oldValue={changes.oldBio}
              newValue={changes.newBio}
            />

            <Divider />

            <Heading size="md">{t('common.editUpdates')}</Heading>
          </VStack>
        </DrawerBody>

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
            onClick={onClose}
          >
            {t('common.keepUnresolved')}
          </Button>
          <Button
            bg="teal.500"
            color="white"
            _hover={{ bg: 'teal.600' }}
            onClick={onClose}
          >
            {t('common.saveMarkResolved')}
          </Button>
        </Flex>
      </DrawerContent>
    </Drawer>
  );
};
