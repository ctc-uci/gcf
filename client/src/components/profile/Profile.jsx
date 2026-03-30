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
import {
  FiCamera,
  FiCheck,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiX,
} from 'react-icons/fi';

import { MediaUploadModal } from '../media/MediaUploadModal';

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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    language: 'English',
  });

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
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: currentUser?.email || '',
        language: 'English',
      });

      if (role === 'Program Director') {
        const programData = await fetchProgramData(backend, userData.id);
        setRoleSpecificData(programData);
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
    setFormData({
      firstName: gcfUser.firstName || '',
      lastName: gcfUser.lastName || '',
      email: currentUser?.email || '',
      language: 'English',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowPassword(false);
  };

  const handleSave = () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim()
    ) {
      toast({
        title: 'Invalid Information!',
        description: 'Please check your input information.',
        status: 'error',
        variant: 'subtle',
        position: 'bottom-right',
      });
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    });

    toast({
      title: 'Account Changes Saved',
      description: `The updates to your account have been saved at ${timeStr}.`,
      status: 'success',
      variant: 'subtle',
      position: 'bottom-right',
    });

    setIsEditing(false);
    setShowPassword(false);
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
            Edit
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
            alt="Profile"
          />
          {isEditing && (
            <IconButton
              icon={<FiCamera />}
              aria-label="Upload photo"
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
                First Name
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
                Last Name
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
                Bio
              </Text>
              {isEditing ? (
                <Input
                  value={formData.bio || ''}
                  onChange={handleInputChange('bio')}
                />
              ) : (
                <Text>{gcfUser.bio || ''}</Text>
              )}
            </FormControl>
          )}

          {/* Email */}
          <FormControl>
            <Text
              fontWeight="bold"
              mb={1}
            >
              Email
            </Text>
            {isEditing ? (
              <Input
                value={formData.email}
                onChange={handleInputChange('email')}
                type="email"
              />
            ) : (
              <Text>{currentUser?.email || ''}</Text>
            )}
          </FormControl>

          {/* Password */}
          <FormControl>
            <Text
              fontWeight="bold"
              mb={1}
            >
              Password
            </Text>
            {isEditing ? (
              <>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value="********"
                    isReadOnly
                  />
                  <InputRightElement>
                    <IconButton
                      icon={showPassword ? <FiEye /> : <FiEyeOff />}
                      aria-label="Toggle password visibility"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                <Text
                  color="teal.500"
                  fontSize="sm"
                  mt={1}
                  cursor="pointer"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Change password
                </Text>
              </>
            ) : (
              <HStack>
                <Text>********</Text>
                {(role === 'Admin' || role === 'Super Admin') && (
                  <IconButton
                    icon={<FiEyeOff />}
                    aria-label="Toggle password visibility"
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
                Region
              </Text>
              {isEditing ? (
                <Input
                  value={roleSpecificData.name}
                  isReadOnly
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
                Program
              </Text>
              {isEditing ? (
                <Input
                  value={roleSpecificData.name}
                  isReadOnly
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
              Preferred Language
            </Text>
            {isEditing ? (
              <Select
                value={formData.language}
                onChange={handleInputChange('language')}
              >
                <option value="English">🇺🇸 English</option>
                <option value="Español">🇪🇸 Español</option>
                <option value="Swahili">🇰🇪 Swahili</option>
              </Select>
            ) : (
              <Text>🇺🇸 English</Text>
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
            Cancel
          </Button>
          <Button
            leftIcon={<FiCheck />}
            bg="teal.500"
            color="white"
            _hover={{ bg: 'teal.600' }}
            onClick={handleSave}
          >
            Save
          </Button>
        </Flex>
      )}

      <MediaUploadModal
        isOpen={isOpen}
        onClose={onClose}
        onUploadComplete={handleProfilePictureUpload}
        formOrigin="profile"
      />
    </Box>
  );
};
