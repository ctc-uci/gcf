import { useEffect, useMemo, useState } from 'react';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Select,
  Spacer,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import {
  FiCamera,
  FiEye,
  FiEyeOff,
  FiMaximize2,
  FiMinimize2,
  FiTrash2,
} from 'react-icons/fi';

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';
const LABEL_COLOR = 'teal.600';

const getRoleBadgeProps = (roleName) => {
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

const INITIAL_FORM_STATE = {
  first_name: '',
  last_name: '',
  role: '',
  email: '',
  password: '',
  programs: [],
  regions: [],
};

export const AccountForm = ({ targetUser, isOpen, onClose, onSave }) => {
  const { currentUser } = useAuthContext();
  const { backend } = useBackendContext();
  const { role } = useRoleContext();
  const userId = currentUser?.uid;
  const targetUserId = targetUser?.id;

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentPrograms, setCurrentPrograms] = useState(null);
  const [currentRegions, setCurrentRegions] = useState(null);

  const exitModal = useDisclosure();
  const deleteModal = useDisclosure();
  const saveModal = useDisclosure();
  const auth = getAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE });
  const [initialFormData, setInitialFormData] = useState({
    ...INITIAL_FORM_STATE,
  });

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const changedFields = useMemo(() => {
    const changes = [];
    if (formData.first_name !== initialFormData.first_name) {
      changes.push({
        label: 'First Name',
        old: initialFormData.first_name,
        new: formData.first_name,
      });
    }
    if (formData.last_name !== initialFormData.last_name) {
      changes.push({
        label: 'Last Name',
        old: initialFormData.last_name,
        new: formData.last_name,
      });
    }
    if (formData.email !== initialFormData.email) {
      changes.push({
        label: 'Email',
        old: initialFormData.email,
        new: formData.email,
      });
    }
    if (formData.password && formData.password !== initialFormData.password) {
      changes.push({
        label: 'Password',
        old: initialFormData.password || '********',
        new: '********',
      });
    }
    if (formData.role !== initialFormData.role) {
      changes.push({
        label: 'Role',
        old: initialFormData.role,
        new: formData.role,
        isBadge: true,
      });
    }
    const oldProgram =
      initialFormData.programs.length > 0
        ? initialFormData.programs[0]?.name
        : '';
    const newProgram =
      formData.programs.length > 0 ? formData.programs[0]?.name : '';
    if (oldProgram !== newProgram) {
      changes.push({
        label: 'Program',
        old: oldProgram || '',
        new: newProgram || '',
      });
    }
    const oldRegion =
      initialFormData.regions.length > 0
        ? initialFormData.regions[0]?.name
        : '';
    const newRegion =
      formData.regions.length > 0 ? formData.regions[0]?.name : '';
    if (oldRegion !== newRegion) {
      changes.push({
        label: 'Region',
        old: oldRegion || '',
        new: newRegion || '',
      });
    }
    return changes;
  }, [formData, initialFormData]);

  // Reset form when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    setValidationErrors({});
    setShowPassword(false);
    setIsFullScreen(false);

    if (!targetUser) {
      const newState = { ...INITIAL_FORM_STATE, programs: [], regions: [] };
      setFormData(newState);
      setInitialFormData(newState);
    } else {
      const editState = {
        first_name: targetUser.firstName ?? '',
        last_name: targetUser.lastName ?? '',
        role: targetUser.role ?? '',
        email: targetUser.email ?? '',
        password: '',
        programs: [],
        regions: [],
      };
      setFormData(editState);
      setInitialFormData(editState);

      if (!targetUser.email && targetUserId) {
        const fetchEmail = async () => {
          try {
            const response = await backend.get(
              `/gcf-users/admin/get-user/${targetUserId}`
            );
            const email = response.data.email ?? '';
            setFormData((prev) => ({ ...prev, email }));
            setInitialFormData((prev) => ({ ...prev, email }));
          } catch (error) {
            console.error('Error loading target user email', error);
          }
        };
        fetchEmail();
      }
    }
  }, [targetUser, targetUserId, backend, isOpen]);

  // Fetch programs and regions
  useEffect(() => {
    async function fetchPrograms() {
      try {
        let response;
        if (role === 'Regional Director') {
          response = await backend.get(
            `/regional-directors/me/${userId}/programs`
          );
        } else {
          response = await backend.get('/program');
        }
        setCurrentPrograms(response.data);
      } catch (error) {
        console.error('Error fetching programs', error);
      }
    }

    async function fetchRegions() {
      try {
        const response = await backend.get('/region');
        setCurrentRegions(response.data);
      } catch (error) {
        console.error('Error fetching regions', error);
      }
    }

    if (role && userId) {
      fetchPrograms();
      fetchRegions();
    }
  }, [backend, role, userId]);

  useEffect(() => {
    if (!targetUserId || !targetUser) return;

    if (targetUser.role === 'Program Director') {
      const fetchUserPrograms = async () => {
        try {
          const response = await backend.get(
            `/program-directors/me/${targetUserId}/program`
          );
          const program = response.data;
          setFormData((prev) => ({ ...prev, programs: [program] }));
          setInitialFormData((prev) => ({ ...prev, programs: [program] }));
        } catch (error) {
          console.error("Error fetching user's programs:", error);
        }
      };
      fetchUserPrograms();
    }

    if (targetUser.role === 'Regional Director') {
      const fetchUserRegion = async () => {
        try {
          const response = await backend.get(
            `/regional-directors/me/${targetUserId}`
          );
          const regionId = response.data.regionId;

          if (regionId && currentRegions) {
            const region = currentRegions.find(
              (r) => String(r.id) === String(regionId)
            );
            setFormData((prev) => ({
              ...prev,
              regions: region ? [region] : [],
            }));
            setInitialFormData((prev) => ({
              ...prev,
              regions: region ? [region] : [],
            }));
          }
        } catch (error) {
          console.error("Error fetching user's region:", error);
        }
      };
      fetchUserRegion();
    }
  }, [backend, targetUserId, targetUser, currentRegions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = true;
    if (!formData.last_name.trim()) errors.last_name = true;
    if (!formData.email.trim()) errors.email = true;
    if (!formData.role) errors.role = true;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveClick = () => {
    if (!validate()) return;

    if (targetUserId && isDirty) {
      saveModal.onOpen();
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    saveModal.onClose();

    try {
      if (!targetUserId) {
        await handleCreateUser();
      } else {
        await handleUpdateUser();
      }
      toast({
        title: 'User saved successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving user: ', error);
      const errorMessage = error.response?.data?.error || error.message;

      if (
        errorMessage.includes('email-already-exists') ||
        errorMessage.includes('email address is already in use')
      ) {
        toast({
          title: 'Email already exists',
          description:
            'This email is already registered. Please use a different email address.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: `Error: ${errorMessage}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.role ||
      !formData.email
    ) {
      throw new Error('Please fill in all fields on the form.');
    }

    const userData = {
      email: formData.email,
      firstName: formData.first_name,
      lastName: formData.last_name,
      role: formData.role,
      currentUserId: userId,
      programId:
        formData.programs.length > 0 ? Number(formData.programs[0].id) : null,
      regionId:
        formData.regions.length > 0 ? Number(formData.regions[0].id) : null,
    };
    await backend.post('/gcf-users/admin/create-user', userData);
    await sendPasswordResetEmail(auth, formData.email);
  };

  const handleUpdateUser = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.role ||
      !formData.email
    ) {
      throw new Error('Please fill in all fields on the form.');
    }
    const userData = {
      email: formData.email,
      firstName: formData.first_name,
      lastName: formData.last_name,
      role: formData.role,
      currentUserId: userId,
      targetId: targetUserId,
      programId:
        formData.programs.length > 0 ? Number(formData.programs[0].id) : null,
      regionId:
        formData.regions.length > 0 ? Number(formData.regions[0].id) : null,
    };

    if (formData.password && formData.password.trim().length > 0) {
      userData.password = formData.password;
    }
    await backend.put('/gcf-users/admin/update-user', userData);
    // await backend.post('/nodemailer', {
    //   email: formData.email,
    //   password: formData.password || null,
    //   firstName: formData.first_name,
    //   lastName: formData.last_name,
    //   role: formData.role,
    //   isNewAccount: false,
    // });
  };

  const handleCloseWithCheck = () => {
    if (isDirty) {
      exitModal.onOpen();
    } else {
      onClose();
    }
  };

  const confirmDelete = () => {
    // TODO: Wire up actual delete backend call
    deleteModal.onClose();
    onSave();
    onClose();
  };

  const createdByName =
    currentUser?.displayName ||
    `${currentUser?.email?.split('@')[0] || 'Unknown'}`;

  const errorBorderProps = (field) =>
    validationErrors[field]
      ? {
          borderColor: 'red.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-red-500)',
        }
      : {};

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={handleCloseWithCheck}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent
          w={isFullScreen ? '100vw' : '50vw'}
          maxW={isFullScreen ? '100vw' : '50vw'}
          display="flex"
          flexDirection="column"
        >
          {/* Header */}
          <Flex
            align="center"
            px={4}
            pt={3}
            pb={2}
          >
            <IconButton
              icon={isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
              aria-label={isFullScreen ? 'Minimize' : 'Expand'}
              variant="ghost"
              size="sm"
              onClick={() => setIsFullScreen(!isFullScreen)}
            />
            <Text
              fontWeight="bold"
              fontSize="xl"
              flex={1}
              textAlign="center"
            >
              Account
            </Text>
            <Box w="32px" />
          </Flex>
          <Divider borderColor="gray.300" />

          <DrawerBody
            flex={1}
            overflowY="auto"
            py={6}
            px={8}
          >
            <VStack
              spacing={6}
              align="stretch"
            >
              <Heading
                as="h3"
                size="md"
                fontWeight="semibold"
              >
                User Profile
              </Heading>

              <Box>
                <Text
                  color={LABEL_COLOR}
                  fontSize="sm"
                  fontWeight="medium"
                  mb={3}
                >
                  Profile Photo
                </Text>
                <Flex justify="center">
                  <Box
                    position="relative"
                    display="inline-block"
                  >
                    <Image
                      src={DEFAULT_PROFILE_IMAGE}
                      boxSize="180px"
                      borderRadius="full"
                      fit="cover"
                      alt="Profile"
                      bg="gray.200"
                      fallback={
                        <Avatar
                          size="2xl"
                          name={
                            formData.first_name || formData.last_name
                              ? `${formData.first_name} ${formData.last_name}`
                              : undefined
                          }
                          bg="gray.300"
                          w="180px"
                          h="180px"
                        />
                      }
                    />
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
                      _hover={{ bg: 'gray.100' }}
                    />
                  </Box>
                </Flex>
              </Box>

              {/* First Name / Last Name */}
              <Grid
                templateColumns="repeat(2, 1fr)"
                gap={4}
              >
                <GridItem>
                  <FormControl>
                    <FormLabel
                      color={LABEL_COLOR}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      First Name{' '}
                      <Text
                        as="span"
                        color="red.500"
                      >
                        *
                      </Text>
                    </FormLabel>
                    <Input
                      name="first_name"
                      placeholder="First Name"
                      value={formData.first_name}
                      onChange={handleChange}
                      {...errorBorderProps('first_name')}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel
                      color={LABEL_COLOR}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Last Name{' '}
                      <Text
                        as="span"
                        color="red.500"
                      >
                        *
                      </Text>
                    </FormLabel>
                    <Input
                      name="last_name"
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                      {...errorBorderProps('last_name')}
                    />
                  </FormControl>
                </GridItem>
              </Grid>

              {/* Email / Password */}
              <Grid
                templateColumns="repeat(2, 1fr)"
                gap={4}
              >
                <GridItem>
                  <FormControl>
                    <FormLabel
                      color={LABEL_COLOR}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Email{' '}
                      <Text
                        as="span"
                        color="red.500"
                      >
                        *
                      </Text>
                    </FormLabel>
                    <Input
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      {...errorBorderProps('email')}
                    />
                  </FormControl>
                </GridItem>
                {targetUserId ? (
                  <GridItem>
                    <FormControl>
                      <FormLabel
                        color={LABEL_COLOR}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        Password
                      </FormLabel>
                      <InputGroup>
                        <Input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Leave blank to keep current"
                          value={formData.password}
                          onChange={handleChange}
                          {...errorBorderProps('password')}
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
                    </FormControl>
                  </GridItem>
                ) : (
                  <GridItem>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      pt={8}
                    >
                      After you save, this user will receive an email with a
                      link to set their password.
                    </Text>
                  </GridItem>
                )}
              </Grid>

              <Heading
                as="h3"
                size="md"
                fontWeight="semibold"
                mt={4}
              >
                Role & Access
              </Heading>

              <FormControl>
                <FormLabel
                  color={LABEL_COLOR}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  Role{' '}
                  <Text
                    as="span"
                    color="red.500"
                  >
                    *
                  </Text>
                </FormLabel>
                <Select
                  name="role"
                  placeholder="Role"
                  value={formData.role}
                  onChange={handleChange}
                  {...errorBorderProps('role')}
                >
                  {role === 'Super Admin' && (
                    <option value="Admin">Admin</option>
                  )}
                  {(role === 'Admin' || role === 'Super Admin') && (
                    <option value="Regional Director">Regional Director</option>
                  )}
                  <option value="Program Director">Program Director</option>
                </Select>
              </FormControl>

              {formData.role === 'Program Director' && (
                <FormControl>
                  <FormLabel
                    color={LABEL_COLOR}
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    Assigned Program
                  </FormLabel>
                  <Select
                    placeholder="Program Name"
                    value={
                      formData.programs.length > 0
                        ? String(formData.programs[0].id)
                        : ''
                    }
                    onChange={(e) => {
                      const selectedProgramId = e.target.value;
                      if (!selectedProgramId) return;

                      const selectedProgram = currentPrograms?.find(
                        (p) => String(p.id) === String(selectedProgramId)
                      );

                      if (selectedProgram) {
                        setFormData((prev) => ({
                          ...prev,
                          programs: [selectedProgram],
                        }));
                      }
                    }}
                  >
                    {currentPrograms?.map((program) => (
                      <option
                        key={program.id}
                        value={program.id}
                      >
                        {program.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {formData.role === 'Regional Director' && (
                <FormControl>
                  <FormLabel
                    color={LABEL_COLOR}
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    Assigned Region
                  </FormLabel>
                  <Select
                    placeholder="Region Name"
                    value={
                      formData.regions.length > 0
                        ? String(formData.regions[0].id)
                        : ''
                    }
                    onChange={(e) => {
                      const selectedRegionId = e.target.value;
                      if (!selectedRegionId) return;

                      const selectedRegion = currentRegions?.find(
                        (r) => String(r.id) === String(selectedRegionId)
                      );

                      if (selectedRegion) {
                        setFormData((prev) => ({
                          ...prev,
                          regions: [selectedRegion],
                        }));
                      }
                    }}
                  >
                    {currentRegions?.map((region) => (
                      <option
                        key={region.id}
                        value={region.id}
                      >
                        {region.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {formData.role === 'Program Director' && (
                <Heading
                  as="h3"
                  size="md"
                  fontWeight="semibold"
                  mt={4}
                >
                  Additional Information
                </Heading>
              )}

              <Box mt={4}>
                <Text
                  color={LABEL_COLOR}
                  fontSize="sm"
                  fontWeight="medium"
                  mb={2}
                >
                  Created by
                </Text>
                <HStack spacing={2}>
                  <Avatar
                    size="sm"
                    name={createdByName}
                    bg="teal.500"
                    color="white"
                  />
                  <Text fontSize="sm">{createdByName}</Text>
                </HStack>
              </Box>
            </VStack>
          </DrawerBody>

          <Divider borderColor="gray.200" />
          <Flex
            align="center"
            px={8}
            py={4}
            bg="white"
          >
            {targetUserId ? (
              <Button
                variant="ghost"
                color="red.500"
                leftIcon={<FiTrash2 />}
                onClick={() => deleteModal.onOpen()}
                fontWeight="normal"
              >
                Delete
              </Button>
            ) : null}
            <Spacer />
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={handleCloseWithCheck}
              >
                Cancel
              </Button>
              <Button
                bg="teal.500"
                color="white"
                _hover={{ bg: 'teal.600' }}
                onClick={handleSaveClick}
                isLoading={isLoading}
              >
                Save
              </Button>
            </HStack>
          </Flex>
        </DrawerContent>
      </Drawer>

      <Modal
        isOpen={exitModal.isOpen}
        onClose={exitModal.onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          py={6}
          px={4}
        >
          <ModalBody textAlign="center">
            <Text
              fontWeight="bold"
              fontSize="lg"
              mb={2}
            >
              Are you sure you want to exit?
            </Text>
            <Text
              color="gray.500"
              mb={6}
            >
              All new updates made to this account will be lost.
            </Text>
            <HStack
              spacing={3}
              justify="center"
            >
              <Button
                variant="outline"
                onClick={exitModal.onClose}
              >
                Continue Editing
              </Button>
              <Button
                bg="red.500"
                color="white"
                _hover={{ bg: 'red.600' }}
                onClick={() => {
                  exitModal.onClose();
                  onClose();
                }}
              >
                Exit Without Saving
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          py={6}
          px={4}
        >
          <ModalBody textAlign="center">
            <Text
              fontWeight="bold"
              fontSize="lg"
              mb={2}
            >
              Delete this account?
            </Text>
            <Text
              color="gray.500"
              mb={6}
            >
              This action cannot be undone.
            </Text>
            <HStack
              spacing={3}
              justify="center"
            >
              <Button
                variant="outline"
                onClick={deleteModal.onClose}
              >
                Continue Editing
              </Button>
              <Button
                bg="red.500"
                color="white"
                _hover={{ bg: 'red.600' }}
                onClick={confirmDelete}
              >
                Delete Account
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={saveModal.isOpen}
        onClose={saveModal.onClose}
        isCentered
        size="lg"
      >
        <ModalOverlay />
        <ModalContent
          py={6}
          px={6}
        >
          <ModalBody>
            <Text
              fontWeight="bold"
              fontSize="lg"
              color="teal.600"
              mb={4}
            >
              Review changes
            </Text>

            <VStack
              spacing={3}
              align="stretch"
            >
              {changedFields.map((change, idx) => (
                <Box key={idx}>
                  <Text
                    color={LABEL_COLOR}
                    fontSize="sm"
                    fontWeight="medium"
                    mb={1}
                  >
                    {change.label}
                  </Text>
                  {change.isBadge ? (
                    <HStack spacing={2}>
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        textDecoration="line-through"
                        {...getRoleBadgeProps(change.old)}
                      >
                        {change.old}
                      </Badge>
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        {...getRoleBadgeProps(change.new)}
                      >
                        {change.new}
                      </Badge>
                    </HStack>
                  ) : (
                    <Text>
                      {change.old && (
                        <Text
                          as="span"
                          textDecoration="line-through"
                          color="gray.400"
                          mr={2}
                        >
                          {change.old}
                        </Text>
                      )}
                      <Text as="span">{change.new}</Text>
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>

            <HStack
              spacing={3}
              justify="center"
              mt={6}
            >
              <Button
                variant="outline"
                onClick={saveModal.onClose}
              >
                Continue Editing
              </Button>
              <Button
                bg="teal.500"
                color="white"
                _hover={{ bg: 'teal.600' }}
                onClick={handleSubmit}
                isLoading={isLoading}
              >
                Confirm Changes
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
