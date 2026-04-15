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
import { useTranslation } from 'react-i18next';
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

const formStateToAuditSnapshot = (fd, meta = {}) => ({
  email: fd.email,
  firstName: fd.first_name,
  lastName: fd.last_name,
  role: fd.role,
  programId: fd.programs?.length > 0 ? Number(fd.programs[0].id) : null,
  regionId: fd.regions?.length > 0 ? Number(fd.regions[0].id) : null,
  ...(meta.currentUserId != null ? { currentUserId: meta.currentUserId } : {}),
  ...(meta.targetId != null ? { targetId: meta.targetId } : {}),
});

export const AccountForm = ({ targetUser, isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
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
    const mask = t('accountForm.passwordMaskStars');
    const changes = [];
    if (formData.first_name !== initialFormData.first_name) {
      changes.push({
        label: t('accountForm.fieldFirstName'),
        old: initialFormData.first_name,
        new: formData.first_name,
      });
    }
    if (formData.last_name !== initialFormData.last_name) {
      changes.push({
        label: t('accountForm.fieldLastName'),
        old: initialFormData.last_name,
        new: formData.last_name,
      });
    }
    if (formData.email !== initialFormData.email) {
      changes.push({
        label: t('accountForm.fieldEmail'),
        old: initialFormData.email,
        new: formData.email,
      });
    }
    if (formData.password && formData.password !== initialFormData.password) {
      changes.push({
        label: t('accountForm.fieldPassword'),
        old: initialFormData.password || mask,
        new: mask,
      });
    }
    if (formData.role !== initialFormData.role) {
      changes.push({
        label: t('accountForm.fieldRole'),
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
        label: t('accountForm.fieldProgram'),
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
        label: t('accountForm.fieldRegion'),
        old: oldRegion || '',
        new: newRegion || '',
      });
    }
    return changes;
  }, [formData, initialFormData, t]);

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
        title: t('accountForm.saveSuccess'),
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
          title: t('accountForm.emailExistsTitle'),
          description: t('accountForm.emailExistsDesc'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: t('accountForm.errorTitle'),
          description: t('accountForm.errorWithMessage', {
            message: errorMessage,
          }),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logAccountChange = async (payload) => {
    try {
      await backend.post('/accountChange', payload);
    } catch (err) {
      console.error('Failed to log account change:', err);
    }
  };

  const handleCreateUser = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.role ||
      !formData.email
    ) {
      throw new Error(t('accountForm.fillAllFields'));
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
    const createRes = await backend.post(
      '/gcf-users/admin/create-user',
      userData
    );
    const newUserId = createRes.data?.uid;
    if (newUserId && userId) {
      await logAccountChange({
        user_id: String(newUserId),
        author_id: String(userId),
        change_type: 'Creation',
        old_values: null,
        new_values: userData,
        resolved: true,
        last_modified: new Date().toISOString(),
      });
    }
    await sendPasswordResetEmail(auth, formData.email);
  };

  const handleUpdateUser = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.role ||
      !formData.email
    ) {
      throw new Error(t('accountForm.fillAllFields'));
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

    if (userId) {
      await logAccountChange({
        user_id: String(targetUserId),
        author_id: String(userId),
        change_type: 'Update',
        old_values: formStateToAuditSnapshot(initialFormData, {
          currentUserId: userId,
          targetId: targetUserId,
        }),
        new_values: formStateToAuditSnapshot(formData, {
          currentUserId: userId,
          targetId: targetUserId,
        }),
        resolved: true,
        last_modified: new Date().toISOString(),
      });
    }
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
    `${currentUser?.email?.split('@')[0] || t('common.unknownUser')}`;

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
              aria-label={
                isFullScreen
                  ? t('fullscreenFlyout.minimize')
                  : t('fullscreenFlyout.expand')
              }
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
              {t('accountForm.drawerTitle')}
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
                {t('accountForm.userProfile')}
              </Heading>

              <Box>
                <Text
                  color={LABEL_COLOR}
                  fontSize="sm"
                  fontWeight="medium"
                  mb={3}
                >
                  {t('accountForm.profilePhoto')}
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
                      alt={t('accountForm.profileAlt')}
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
                      aria-label={t('profile.uploadPhoto')}
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
                      {t('accountForm.fieldFirstName')}{' '}
                      <Text
                        as="span"
                        color="red.500"
                      >
                        *
                      </Text>
                    </FormLabel>
                    <Input
                      name="first_name"
                      placeholder={t('accountForm.fieldFirstName')}
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
                      {t('accountForm.fieldLastName')}{' '}
                      <Text
                        as="span"
                        color="red.500"
                      >
                        *
                      </Text>
                    </FormLabel>
                    <Input
                      name="last_name"
                      placeholder={t('accountForm.fieldLastName')}
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
                      {t('accountForm.fieldEmail')}{' '}
                      <Text
                        as="span"
                        color="red.500"
                      >
                        *
                      </Text>
                    </FormLabel>
                    <Input
                      name="email"
                      placeholder={t('accountForm.emailAddressPlaceholder')}
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
                        {t('accountForm.fieldPassword')}
                      </FormLabel>
                      <InputGroup>
                        <Input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder={t('accountForm.passwordLeaveBlank')}
                          value={formData.password}
                          onChange={handleChange}
                          {...errorBorderProps('password')}
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
                    </FormControl>
                  </GridItem>
                ) : (
                  <GridItem>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      pt={8}
                    >
                      {t('accountForm.passwordEmailNote')}
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
                {t('accountForm.roleAccess')}
              </Heading>

              <FormControl>
                <FormLabel
                  color={LABEL_COLOR}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  {t('accountForm.fieldRole')}{' '}
                  <Text
                    as="span"
                    color="red.500"
                  >
                    *
                  </Text>
                </FormLabel>
                <Select
                  name="role"
                  placeholder={t('accountForm.rolePlaceholder')}
                  value={formData.role}
                  onChange={handleChange}
                  {...errorBorderProps('role')}
                >
                  {role === 'Super Admin' && (
                    <option value="Admin">{t('signup.roleAdmin')}</option>
                  )}
                  {(role === 'Admin' || role === 'Super Admin') && (
                    <option value="Regional Director">
                      {t('signup.roleRegionalDirector')}
                    </option>
                  )}
                  <option value="Program Director">
                    {t('signup.roleProgramDirector')}
                  </option>
                </Select>
              </FormControl>

              {formData.role === 'Program Director' && (
                <FormControl>
                  <FormLabel
                    color={LABEL_COLOR}
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    {t('accountForm.assignedProgram')}
                  </FormLabel>
                  <Select
                    placeholder={t('accountForm.programNamePlaceholder')}
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
                    {t('accountForm.assignedRegion')}
                  </FormLabel>
                  <Select
                    placeholder={t('accountForm.regionNamePlaceholder')}
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
                  {t('accountForm.additionalInfo')}
                </Heading>
              )}

              <Box mt={4}>
                <Text
                  color={LABEL_COLOR}
                  fontSize="sm"
                  fontWeight="medium"
                  mb={2}
                >
                  {t('accountForm.createdBy')}
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
                {t('common.delete')}
              </Button>
            ) : null}
            <Spacer />
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={handleCloseWithCheck}
              >
                {t('common.cancel')}
              </Button>
              <Button
                bg="teal.500"
                color="white"
                _hover={{ bg: 'teal.600' }}
                onClick={handleSaveClick}
                isLoading={isLoading}
              >
                {t('common.save')}
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
              {t('accountForm.exitTitle')}
            </Text>
            <Text
              color="gray.500"
              mb={6}
            >
              {t('accountForm.exitDesc')}
            </Text>
            <HStack
              spacing={3}
              justify="center"
            >
              <Button
                variant="outline"
                onClick={exitModal.onClose}
              >
                {t('common.continueEditing')}
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
                {t('common.exitWithoutSaving')}
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
              {t('accountForm.deleteTitle')}
            </Text>
            <Text
              color="gray.500"
              mb={6}
            >
              {t('accountForm.deleteDesc')}
            </Text>
            <HStack
              spacing={3}
              justify="center"
            >
              <Button
                variant="outline"
                onClick={deleteModal.onClose}
              >
                {t('common.continueEditing')}
              </Button>
              <Button
                bg="red.500"
                color="white"
                _hover={{ bg: 'red.600' }}
                onClick={confirmDelete}
              >
                {t('accountForm.deleteAccount')}
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
              {t('common.reviewChanges')}
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
                {t('common.continueEditing')}
              </Button>
              <Button
                bg="teal.500"
                color="white"
                _hover={{ bg: 'teal.600' }}
                onClick={handleSubmit}
                isLoading={isLoading}
              >
                {t('common.confirmChanges')}
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
