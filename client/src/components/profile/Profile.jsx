import { useCallback, useEffect, useState } from 'react';

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
  Select,
  Spinner,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import i18n, { APP_LOCALES, isAppLocale } from '@/i18n';
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

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

const fetchProgramData = async (backend, userId) => {
  try {
    const response = await backend.get(
      `/program-directors/me/${userId}/program`
    );
    return response.data;
  } catch (err) {
    console.error('Error fetching program data:', err);
    return null;
  }
};

const fetchRegionData = async (backend, userId) => {
  try {
    const rdResponse = await backend.get(`/regional-directors/me/${userId}`);
    if (rdResponse.data?.regionId) {
      const regionResponse = await backend.get(
        `/region/${rdResponse.data.regionId}`
      );
      return regionResponse.data;
    }
    return null;
  } catch (err) {
    console.error('Error fetching region data:', err);
    return null;
  }
};

export const Profile = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();
  const { backend } = useBackendContext();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [gcfUser, setGcfUser] = useState(null);
  const [roleSpecificData, setRoleSpecificData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordEdited, setPasswordEdited] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const {
    isOpen: isPasswordModalOpen,
    onOpen: onPasswordModelOpen,
    onClose: onPasswordModelClose,
  } = useDisclosure();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    language: 'en',
    bio: '',
  });

  const localeLabel = (code) => {
    const c = isAppLocale(String(code)) ? code : 'en';
    switch (c) {
      case 'es':
        return t('profile.langSpanish');
      case 'fr':
        return t('profile.langFrench');
      case 'zh':
        return t('profile.langChinese');
      default:
        return t('profile.langEnglish');
    }
  };

  const fetchUserData = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    try {
      const userResponse = await backend.get(`/gcf-users/${currentUser.uid}`);
      const userData = userResponse.data;
      if (userData.picture && userData.picture.trim() !== '') {
        try {
          const urlResponse = await backend.get(
            `/images/url/${encodeURIComponent(userData.picture)}`
          );
          userData.picture = urlResponse.data.url;
        } catch (urlErr) {
          console.error('Error fetching profile image:', urlErr);
          userData.picture = null;
        }
      }

      setGcfUser(userData);
      const prefLang =
        userData.preferredLanguage &&
        isAppLocale(String(userData.preferredLanguage))
          ? String(userData.preferredLanguage)
          : 'en';
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: currentUser?.email || '',
        bio: '',
        language: prefLang,
      });

      if (role === 'Program Director') {
        const programData = await fetchProgramData(backend, userData.id);
        setRoleSpecificData(programData);
        setFormData((prev) => ({ ...prev, bio: programData.bio || '' }));
      } else if (role === 'Regional Director') {
        const regionData = await fetchRegionData(backend, userData.id);
        setRoleSpecificData(regionData);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, backend, role]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleProfilePictureUpload = async (uploadedFiles) => {
    if (!uploadedFiles?.length) return;

    const key = uploadedFiles[0].s3_key;

    try {
      const urlResponse = await backend.get(
        `/images/url/${encodeURIComponent(key)}`
      );
      await backend.post('/images/profile-picture', {
        key: key,
        userId: currentUser.uid,
      });

      setGcfUser((prev) => ({
        ...prev,
        picture: urlResponse.data.url,
      }));
    } catch (err) {
      console.error('Error saving profile picture:', err);
    }
  };

  const handleEdit = () => {
    const prefLang =
      gcfUser.preferredLanguage &&
      isAppLocale(String(gcfUser.preferredLanguage))
        ? String(gcfUser.preferredLanguage)
        : 'en';
    setFormData({
      firstName: gcfUser.firstName || '',
      lastName: gcfUser.lastName || '',
      email: currentUser?.email || '',
      language: prefLang,
      bio: roleSpecificData?.bio || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowPassword(false);
    setNewPassword('');
    setPasswordEdited('');
  };

  const saveProfileEdits = async () => {
    console.log('currentUser.uid:', currentUser.uid);
    console.log('gcfUser.id:', gcfUser.id);
    try {
      await Promise.all([
        backend.patch(`/gcf-users/${currentUser.uid}/preferred-language`, {
          preferredLanguage: formData.language,
        }),
        backend.put(`/gcf-users/${currentUser.uid}`, {
          first_name: formData.firstName,
          last_name: formData.lastName,
        }),
        role === 'Program Director' &&
          backend.patch(`/program-directors/${currentUser.uid}`, {
            bio: formData.bio,
          }),
      ]);

      await i18n.changeLanguage(formData.language);
      setGcfUser((prev) => ({
        ...prev,
        preferredLanguage: formData.language,
        firstName: formData.firstName,
        lastName: formData.lastName,
      }));
      setRoleSpecificData((prev) => ({ ...prev, bio: formData.bio }));
      window.dispatchEvent(new Event('profile-updated'));

      const now = new Date();
      const timeStr = now.toLocaleTimeString(i18n.language || 'en', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      });

      toast({
        title: t('profile.savedTitle'),
        description: t('profile.savedDesc', { time: timeStr }),
        status: 'success',
        variant: 'subtle',
        position: 'bottom-right',
      });

      setIsEditing(false);
      setShowPassword(false);
      setPasswordEdited(false);
      setNewPassword('');
    } catch (err) {
      console.error('Error saving profile language:', err);
      toast({
        title: t('signup.errorTitle'),
        description:
          err.response?.data?.error ??
          err.message ??
          t('updates.failedSaveDesc'),
        status: 'error',
        variant: 'subtle',
        position: 'bottom-right',
      });
    }
  };

  const handleSave = async () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim()
    ) {
      toast({
        title: t('profile.invalidInfoTitle'),
        description: t('profile.invalidInfoDesc'),
        status: 'error',
        variant: 'subtle',
        position: 'bottom-right',
      });
      return;
    }

    if (!currentUser?.uid) return;

    if (passwordEdited && newPassword.length > 0) {
      if (newPassword.length < 12) {
        toast({
          title: 'Invalid password',
          description: 'Password must be at least 12 characters.',
          status: 'error',
          variant: 'subtle',
          position: 'bottom-right',
        });
        return;
      }
      onPasswordModelOpen();
      return;
    }

    await saveProfileEdits();
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (loading) {
    return (
      <Box
        h="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" />
      </Box>
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

  const profilePicture =
    gcfUser.picture && gcfUser.picture.trim() !== ''
      ? gcfUser.picture
      : DEFAULT_PROFILE_IMAGE;

  return (
    <Box
      p={10}
      position="relative"
      bg="gray.50"
      minH="94vh"
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
              </Text>
              {isEditing ? (
                <Input
                  value={formData.bio || ''}
                  onChange={handleInputChange('bio')}
                />
              ) : (
                <Text>{formData.bio || ''}</Text>
              )}
            </FormControl>
          )}

          {/* Email */}
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

          {/* Password */}
          <FormControl
            mt={-4}
            mb={-2}
          >
            {isEditing ? (
              <>
                <Text
                  fontWeight="bold"
                  mb={1}
                >
                  {t('common.password')}
                </Text>
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
              </>
            ) : (
              <HStack>
                <Text></Text>
                {(role === 'Admin' || role === 'Super Admin') && (
                  <IconButton
                    icon={<FiEyeOff />}
                    aria-label={t('profile.togglePassword')}
                    variant="ghost"
                    size="sm"
                  />
                )}
              </HStack>
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
              <Select
                value={formData.language}
                onChange={handleInputChange('language')}
              >
                {APP_LOCALES.map((code) => (
                  <option
                    key={code}
                    value={code}
                  >
                    {localeLabel(code)}
                  </option>
                ))}
              </Select>
            ) : (
              <Text>{localeLabel(gcfUser?.preferredLanguage)}</Text>
            )}
          </FormControl>
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
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={onPasswordModelClose}
        newPassword={newPassword}
        currentUser={currentUser}
        onSuccess={async () => {
          onPasswordModelClose();
          await saveProfileEdits();
          const now = new Date();
          const timeStr = now.toLocaleTimeString(i18n.language || 'en', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
          });
          toast({
            title: 'Password updated',
            description: `Your password was updated at ${timeStr}`,
            status: 'success',
            variant: 'subtle',
            position: 'bottom-right',
          });
        }}
      />
    </Box>
  );
};
