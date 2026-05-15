import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SkeletonCircle,
  SkeletonText,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import 'flag-icons/css/flag-icons.min.css';

import { APP_LOCALES } from '@/i18n';
import { useTranslation } from 'react-i18next';
import {
  FiCamera,
  FiCheck,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiX,
} from 'react-icons/fi';

import { MediaUploadModal } from '../media/MediaUploadModal';
import { ChangePasswordModal } from './ChangePasswordModal';

const LOCALE_META = [
  { code: 'en', flagCode: 'us' },
  { code: 'es', flagCode: 'es' },
  { code: 'fr', flagCode: 'fr' },
  { code: 'zh', flagCode: 'cn' },
];

export const ProfileView = (props) => {
  const { t } = useTranslation();
  const {
    loading,
    gcfUser,
    currentUser,
    role,
    roleSpecificData,
    isEditing,
    formData,
    showPassword,
    setShowPassword,
    newPassword,
    setNewPassword,
    setPasswordEdited,
    profilePicture,
    pdPending,
    firstNamePending,
    lastNamePending,
    bioPending,
    picturePending,
    localeLabel,
    handleEdit,
    handleCancel,
    handleSave,
    handleInputChange,
    handleProfilePictureUpload,
    handlePasswordChangeSuccess,
    isOpen,
    onOpen,
    onClose,
    isPasswordModalOpen,
    onPasswordModelClose,
  } = props;

  if (loading) {
    return (
      <Flex
        h="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <VStack
          spacing={4}
          w="60%"
        >
          <SkeletonCircle
            size="200px"
            mb={10}
          />
          <SkeletonText
            w="100%"
            noOfLines={4}
            spacing="4"
            skeletonHeight="20"
          />
        </VStack>
      </Flex>
    );
  }

  if (!gcfUser) {
    return (
      <Box
        p={10}
        bg="gray.50"
        minH="94vh"
        mx={-4}
      >
        <Text>Unable to load your profile. Please try again later.</Text>
      </Box>
    );
  }

  return (
    <Box
      p={10}
      pb="0"
      position="relative"
      bg="gray.50"
      minH="80vh"
      mx={-4}
      mt={0}
    >
      {!isEditing && (
        <Flex
          justify="flex-end"
          mb={4}
        >
          <Button
            leftIcon={<FiEdit2 />}
            bg="teal.500"
            color="white"
            borderRadius="md"
            _hover={{ bg: 'teal.600' }}
            onClick={handleEdit}
          >
            {t('profile.edit')}
          </Button>
        </Flex>
      )}

      {isEditing && <Box h="52px" />}

      <VStack
        spacing={8}
        align="center"
        w="100%"
      >
        <Box
          position="relative"
          display="inline-block"
        >
          <Image
            src={profilePicture}
            boxSize="200px"
            borderRadius="full"
            fit="cover"
            alt={t('accountForm.profileAlt')}
          />
          {isEditing && (
            <IconButton
              icon={<FiCamera />}
              aria-label={t('profile.uploadPhoto')}
              borderRadius="full"
              size="sm"
              bg="white"
              boxShadow="md"
              position="absolute"
              bottom={2}
              right={2}
              onClick={onOpen}
              _hover={{ bg: 'gray.100' }}
            />
          )}
          {!isEditing && picturePending && (
            <Text
              as="span"
              color="red.500"
              fontWeight="bold"
              fontSize="xl"
              position="absolute"
              top={1}
              right={1}
              lineHeight={1}
            >
              *
            </Text>
          )}
        </Box>

        <VStack
          spacing={6}
          align="flex-start"
          w="100%"
          maxW="700px"
        >
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={8}
            w="100%"
          >
            <GridItem>
              <Text
                fontWeight="bold"
                mb={1}
              >
                {t('common.firstName')}
                {!isEditing && firstNamePending && (
                  <Text
                    as="span"
                    color="red.500"
                    ml={0.5}
                  >
                    *
                  </Text>
                )}
              </Text>
              {isEditing ? (
                <Input
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                />
              ) : (
                <Text>{gcfUser.firstName || ''}</Text>
              )}
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb={1}
              >
                {t('common.lastName')}
                {!isEditing && lastNamePending && (
                  <Text
                    as="span"
                    color="red.500"
                    ml={0.5}
                  >
                    *
                  </Text>
                )}
              </Text>
              {isEditing ? (
                <Input
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                />
              ) : (
                <Text>{gcfUser.lastName || ''}</Text>
              )}
            </GridItem>
          </Grid>

          {role === 'Program Director' && (
            <FormControl>
              <Text
                fontWeight="bold"
                mb={1}
              >
                {t('profile.bio')}
                {!isEditing && bioPending && (
                  <Text
                    as="span"
                    color="red.500"
                    ml={0.5}
                  >
                    *
                  </Text>
                )}
              </Text>
              {isEditing ? (
                <Textarea
                  value={formData.bio || ''}
                  onChange={handleInputChange('bio')}
                  rows={5}
                  resize="vertical"
                />
              ) : (
                <Text whiteSpace="pre-wrap">{formData.bio || ''}</Text>
              )}
            </FormControl>
          )}

          <FormControl>
            <Text
              fontWeight="bold"
              mb={1}
            >
              {t('common.email')}
            </Text>
            {isEditing ? (
              <Input
                value={formData.email}
                onChange={handleInputChange('email')}
                type="email"
                isReadOnly
                bg="gray.100"
              />
            ) : (
              <Text>{currentUser?.email || ''}</Text>
            )}
          </FormControl>

          <FormControl
            mt={isEditing ? -4 : 0}
            mb={isEditing ? -2 : 0}
          >
            <Text
              fontWeight="bold"
              mb={1}
            >
              {t('common.password')}
            </Text>
            {isEditing ? (
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordEdited(true);
                  }}
                  placeholder="Leave blank to keep current password"
                  autoComplete="new-password"
                />
                <InputRightElement>
                  <IconButton
                    icon={showPassword ? <FiEye /> : <FiEyeOff />}
                    aria-label={t('profile.togglePassword')}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            ) : (
              <Text
                letterSpacing="0.15em"
                userSelect="none"
                aria-hidden
              >
                {t('accountForm.passwordMaskStars')}
              </Text>
            )}
          </FormControl>

          {role === 'Regional Director' && roleSpecificData?.name && (
            <FormControl>
              <Text
                fontWeight="bold"
                mb={1}
              >
                {t('common.region')}
              </Text>
              {isEditing ? (
                <Input
                  value={roleSpecificData.name}
                  isReadOnly
                  bg="gray.100"
                />
              ) : (
                <Text>{roleSpecificData.name}</Text>
              )}
            </FormControl>
          )}

          {role === 'Program Director' && roleSpecificData?.name && (
            <FormControl>
              <Text
                fontWeight="bold"
                mb={1}
              >
                {t('common.program')}
              </Text>
              {isEditing ? (
                <Input
                  value={roleSpecificData.name}
                  isReadOnly
                  bg="gray.100"
                />
              ) : (
                <Text>{roleSpecificData.name}</Text>
              )}
            </FormControl>
          )}

          <FormControl>
            <Text
              fontWeight="bold"
              mb={1}
            >
              {t('profile.preferredLanguage')}
            </Text>
            {isEditing ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="outline"
                  width="100%"
                  textAlign="left"
                  fontWeight="normal"
                  rightIcon={<ChevronDownIcon />}
                >
                  <HStack spacing={2}>
                    <span
                      className={`fi fi-${LOCALE_META.find((m) => m.code === formData.language)?.flagCode}`}
                      aria-hidden="true"
                    />
                    <Text>{localeLabel(formData.language)}</Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  {APP_LOCALES.map((code) => {
                    const meta = LOCALE_META.find((m) => m.code === code);
                    return (
                      <MenuItem
                        key={code}
                        onClick={() =>
                          handleInputChange('language')({
                            target: { value: code },
                          })
                        }
                      >
                        <HStack spacing={2}>
                          <span
                            className={`fi fi-${meta?.flagCode}`}
                            aria-hidden="true"
                          />
                          <Text>{localeLabel(code)}</Text>
                        </HStack>
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </Menu>
            ) : (
              <HStack spacing={2}>
                <span
                  className={`fi fi-${LOCALE_META.find((m) => m.code === gcfUser?.preferredLanguage)?.flagCode}`}
                  aria-hidden="true"
                />
                <Text>{localeLabel(gcfUser?.preferredLanguage)}</Text>
              </HStack>
            )}
          </FormControl>

          {!isEditing && pdPending && (
            <Text
              color="red.500"
              fontSize="sm"
              textAlign="center"
              w="100%"
            >
              * {t('profile.pendingApprovalDesc')}
            </Text>
          )}
        </VStack>
      </VStack>

      {isEditing && (
        <Flex
          justify="flex-end"
          mt={8}
          gap={3}
        >
          <Button
            leftIcon={<FiX />}
            variant="outline"
            onClick={handleCancel}
          >
            {t('common.cancel')}
          </Button>
          <Button
            leftIcon={<FiCheck />}
            bg="teal.500"
            color="white"
            _hover={{ bg: 'teal.600' }}
            onClick={handleSave}
          >
            {t('common.save')}
          </Button>
        </Flex>
      )}

      <MediaUploadModal
        isOpen={isOpen}
        onClose={onClose}
        onUploadComplete={handleProfilePictureUpload}
        formOrigin="profile"
        accept={{ 'image/*': [] }}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={onPasswordModelClose}
        newPassword={newPassword}
        currentUser={currentUser}
        onSuccess={handlePasswordChangeSuccess}
      />
    </Box>
  );
};
