import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
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
  Select,
  Spacer,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import { DirectorAvatar } from '@/components/dashboard/ProgramForm/DirectorAvatar';
import { useTranslation } from 'react-i18next';
import {
  FiCamera,
  FiEye,
  FiEyeOff,
  FiMaximize2,
  FiMinimize2,
  FiTrash2,
} from 'react-icons/fi';

import { DEFAULT_PROFILE_IMAGE, LABEL_COLOR } from './constants';

export const AccountFormDrawer = ({
  isOpen,
  onClose,
  isFullScreen,
  onToggleFullScreen,
  formData,
  onChange,
  fieldErrors = {},
  showPassword,
  onToggleShowPassword,
  targetUserId,
  viewerRole,
  currentPrograms,
  currentRegions,
  setFormData,
  createdByName,
  createdByPicture = '',
  creatorPhotoUrl = '',
  isNewAccount = false,
  onDeleteClick,
  onCancel,
  onSave,
  isLoading,
}) => {
  const { t } = useTranslation();

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="lg"
    >
      <DrawerOverlay />
      <DrawerContent
        w={isFullScreen ? '100vw' : '50vw'}
        maxW={isFullScreen ? '100vw' : '50vw'}
        display="flex"
        flexDirection="column"
      >
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
            onClick={onToggleFullScreen}
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

            <Grid
              templateColumns="repeat(2, 1fr)"
              gap={4}
            >
              <GridItem>
                <FormControl isInvalid={Boolean(fieldErrors.first_name)}>
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
                    onChange={onChange}
                  />
                  <FormErrorMessage>{fieldErrors.first_name}</FormErrorMessage>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isInvalid={Boolean(fieldErrors.last_name)}>
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
                    onChange={onChange}
                  />
                  <FormErrorMessage>{fieldErrors.last_name}</FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>

            <Grid
              templateColumns="repeat(2, 1fr)"
              gap={4}
            >
              <GridItem>
                <FormControl isInvalid={Boolean(fieldErrors.email)}>
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
                    onChange={onChange}
                  />
                  <FormErrorMessage>{fieldErrors.email}</FormErrorMessage>
                </FormControl>
              </GridItem>
              {targetUserId ? (
                <GridItem>
                  <FormControl isInvalid={Boolean(fieldErrors.password)}>
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
                        onChange={onChange}
                      />
                      <InputRightElement>
                        <IconButton
                          icon={showPassword ? <FiEye /> : <FiEyeOff />}
                          aria-label={t('profile.togglePassword')}
                          variant="ghost"
                          size="sm"
                          onClick={onToggleShowPassword}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{fieldErrors.password}</FormErrorMessage>
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

            <FormControl isInvalid={Boolean(fieldErrors.role)}>
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
                onChange={onChange}
              >
                {viewerRole === 'Super Admin' && (
                  <option value="Admin">{t('signup.roleAdmin')}</option>
                )}
                {(viewerRole === 'Admin' || viewerRole === 'Super Admin') && (
                  <option value="Regional Director">
                    {t('signup.roleRegionalDirector')}
                  </option>
                )}
                <option value="Program Director">
                  {t('signup.roleProgramDirector')}
                </option>
              </Select>
              <FormErrorMessage>{fieldErrors.role}</FormErrorMessage>
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
              <>
                <Heading
                  as="h3"
                  size="md"
                  fontWeight="semibold"
                  mt={4}
                >
                  {t('accountForm.additionalInfo')}
                </Heading>
                <FormControl>
                  <FormLabel
                    color={LABEL_COLOR}
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    {t('profile.bio')}
                  </FormLabel>
                  <Textarea
                    name="bio"
                    value={formData.bio ?? ''}
                    onChange={onChange}
                    rows={5}
                    resize="vertical"
                  />
                </FormControl>
              </>
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
                {isNewAccount ? (
                  <Avatar
                    size="sm"
                    name={createdByName}
                    src={creatorPhotoUrl || undefined}
                    bg="teal.500"
                    color="white"
                  />
                ) : createdByPicture ? (
                  <DirectorAvatar
                    picture={createdByPicture}
                    name={createdByName}
                    boxSize="32px"
                  />
                ) : (
                  <Avatar
                    size="sm"
                    name={createdByName}
                    bg="teal.500"
                    color="white"
                  />
                )}
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
              onClick={onDeleteClick}
              fontWeight="normal"
            >
              {t('common.delete')}
            </Button>
          ) : null}
          <Spacer />
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={onCancel}
            >
              {t('common.cancel')}
            </Button>
            <Button
              bg="teal.500"
              color="white"
              _hover={{ bg: 'teal.600' }}
              onClick={onSave}
              isLoading={isLoading}
            >
              {t('common.save')}
            </Button>
          </HStack>
        </Flex>
      </DrawerContent>
    </Drawer>
  );
};
