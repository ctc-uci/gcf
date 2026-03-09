import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  CloseButton,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Select,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiCamera,
  FiCornerDownRight,
  FiEdit3,
  FiHelpCircle,
  FiMaximize2,
  FiMinimize2,
  FiMusic,
  FiStar,
  FiTool,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { MediaUploadModal } from '../media/MediaUploadModal';

export const CreateUpdateDrawer = ({ isOpen, onClose, onSave }) => {
  const btnRef = useRef(null);
  const { currentUser } = useAuthContext();
  const { backend } = useBackendContext();
  const toast = useToast();
  const mediaUploadDisclosure = useDisclosure();

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [updateType, setUpdateType] = useState('instrument');

  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [instrumentCount, setInstrumentCount] = useState(0);

  const [studentCount, setStudentCount] = useState('');

  const [updateDate, setUpdateDate] = useState('');
  const [notes, setNotes] = useState('');
  const [needsAdminHelp, setNeedsAdminHelp] = useState(false);
  const [adminHelpNote, setAdminHelpNote] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState([]);

  const [instruments, setInstruments] = useState([]);
  const [programId, setProgramId] = useState(null);

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await backend.get('/instruments');
        setInstruments(response.data || []);
      } catch (error) {
        console.error('Error fetching instruments:', error);
      }
    };
    fetchInstruments();
  }, [backend]);

  // Fetch program for current PD
  useEffect(() => {
    const fetchProgram = async () => {
      if (!currentUser?.uid) return;
      try {
        const response = await backend.get(
          `/program-directors/me/${currentUser.uid}/program`
        );
        if (response.data) {
          setProgramId(response.data.id);
        }
      } catch (error) {
        console.error('Error fetching program:', error);
      }
    };
    fetchProgram();
  }, [backend, currentUser]);

  const resetForm = () => {
    setUpdateType('instrument');
    setSelectedInstrument('');
    setWhatHappened('');
    setInstrumentCount(0);
    setStudentCount('');
    setUpdateDate('');
    setNotes('');
    setNeedsAdminHelp(false);
    setAdminHelpNote('');
    setUploadedMedia([]);
    setIsFullScreen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleMediaUploadComplete = (uploadedFiles) => {
    setUploadedMedia((prev) => [...prev, ...uploadedFiles]);
  };

  const removeMedia = (index) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const title = updateType === 'instrument' ? 'Instrument' : 'Student';

      let fullNote = notes;
      if (updateType === 'instrument' && whatHappened) {
        fullNote = `Reason: ${whatHappened}${notes ? `\n${notes}` : ''}`;
      }
      if (needsAdminHelp && adminHelpNote) {
        fullNote += `\nAdmin Request: ${adminHelpNote}`;
      }

      const programUpdateData = {
        title,
        program_id: programId,
        created_by: currentUser?.uid,
        update_date: updateDate || null,
        note: fullNote || null,
      };

      const response = await backend.post(
        '/program-updates',
        programUpdateData
      );
      const newUpdateId = response.data.id;

      if (updateType === 'instrument' && selectedInstrument) {
        const instrument = instruments.find(
          (i) =>
            i.name === selectedInstrument || String(i.id) === selectedInstrument
        );
        if (instrument) {
          await backend.post('/instrument-changes', {
            instrumentId: instrument.id,
            updateId: newUpdateId,
            amountChanged: instrumentCount || 0,
          });
        }
      }

      if (updateType === 'student' && studentCount) {
        await backend.post('/enrollmentChange', {
          update_id: newUpdateId,
          enrollment_change: parseInt(studentCount, 10) || 0,
          graduated_change: 0,
        });
      }

      for (const media of uploadedMedia) {
        await backend.post('/mediaChange', {
          update_id: newUpdateId,
          s3_key: media.s3_key,
          file_name: media.file_name,
          file_type: media.file_type,
          is_thumbnail: false,
          instrument_id: null,
        });
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });

      toast({
        title: 'New Update Created',
        description: `The updates to your program have been saved at ${timeStr}.`,
        status: 'info',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });

      onSave?.();
      handleClose();
    } catch (error) {
      console.error('Error creating update:', error);
      toast({
        title: 'Failed to create update',
        description: error?.response?.data?.message ?? 'Something went wrong.',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const drawerSize = isFullScreen ? 'full' : 'lg';

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={handleClose}
        finalFocusRef={btnRef}
        size={drawerSize}
      >
        <DrawerOverlay />
        <DrawerContent maxW={isFullScreen ? '100%' : '50%'}>
          <Flex position="absolute" top={3} left={3} zIndex={1}>
            <IconButton
              icon={isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
              aria-label={isFullScreen ? 'Minimize' : 'Expand'}
              variant="ghost"
              size="sm"
              onClick={() => setIsFullScreen(!isFullScreen)}
            />
          </Flex>

          <Box pt={6} pb={2} px={8}>
            <Text fontSize="xl" fontWeight="600" textAlign="center">
              Create New Update
            </Text>
            <Divider mt={3} />
          </Box>

          <DrawerBody px={8} pb={24}>
            <VStack spacing={6} align="stretch" mt={4}>
              <Box>
                <Heading size="sm" fontWeight="600" mb={3}>
                  What type of update are you submitting today?
                </Heading>
                <HStack spacing={4}>
                  <Box
                    flex={1}
                    border="2px solid"
                    borderColor={
                      updateType === 'instrument' ? 'teal.400' : 'gray.200'
                    }
                    borderRadius="lg"
                    p={6}
                    cursor="pointer"
                    onClick={() => setUpdateType('instrument')}
                    bg={updateType === 'instrument' ? 'teal.50' : 'white'}
                    textAlign="center"
                    transition="all 0.2s"
                  >
                    <Icon
                      as={FiMusic}
                      boxSize={8}
                      color={
                        updateType === 'instrument' ? 'teal.600' : 'gray.400'
                      }
                      mb={2}
                    />
                    <Text fontWeight="500" fontSize="sm">
                      Instrument Update
                    </Text>
                    <Flex justify="center" mt={3}>
                      <Box
                        w="20px"
                        h="20px"
                        borderRadius="full"
                        border="2px solid"
                        borderColor={
                          updateType === 'instrument' ? 'teal.400' : 'gray.300'
                        }
                        bg={updateType === 'instrument' ? 'teal.400' : 'white'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {updateType === 'instrument' && (
                          <Box w="8px" h="8px" borderRadius="full" bg="white" />
                        )}
                      </Box>
                    </Flex>
                  </Box>

                  <Box
                    flex={1}
                    border="2px solid"
                    borderColor={
                      updateType === 'student' ? 'teal.400' : 'gray.200'
                    }
                    borderRadius="lg"
                    p={6}
                    cursor="pointer"
                    onClick={() => setUpdateType('student')}
                    bg={updateType === 'student' ? 'teal.50' : 'white'}
                    textAlign="center"
                    transition="all 0.2s"
                  >
                    <Icon
                      as={FiUser}
                      boxSize={8}
                      color={updateType === 'student' ? 'teal.600' : 'gray.400'}
                      mb={2}
                    />
                    <Text fontWeight="500" fontSize="sm">
                      Student Update
                    </Text>
                    <Flex justify="center" mt={3}>
                      <Box
                        w="20px"
                        h="20px"
                        borderRadius="full"
                        border="2px solid"
                        borderColor={
                          updateType === 'student' ? 'teal.400' : 'gray.300'
                        }
                        bg={updateType === 'student' ? 'teal.400' : 'white'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {updateType === 'student' && (
                          <Box w="8px" h="8px" borderRadius="full" bg="white" />
                        )}
                      </Box>
                    </Flex>
                  </Box>
                </HStack>
              </Box>

              {updateType === 'instrument' ? (
                <>
                  <Box>
                    <HStack spacing={2} mb={1}>
                      <Icon as={FiMusic} boxSize={4} />
                      <Heading size="sm" fontWeight="600">
                        Which instrument is this update about?
                      </Heading>
                    </HStack>
                    <Text
                      color="teal.500"
                      fontSize="sm"
                      fontWeight="500"
                      mb={1}
                    >
                      Select instrument{' '}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <Select
                      placeholder="Select Instrument"
                      value={selectedInstrument}
                      onChange={(e) => setSelectedInstrument(e.target.value)}
                    >
                      {instruments.map((inst) => (
                        <option key={inst.id} value={inst.name}>
                          {inst.name}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <Heading size="sm" fontWeight="600" mb={3}>
                      What happened to this instrument?
                    </Heading>
                    <RadioGroup value={whatHappened} onChange={setWhatHappened}>
                      <VStack align="start" spacing={2}>
                        <Radio value="Broken">
                          <HStack spacing={2}>
                            <Icon as={FiX} boxSize={4} />
                            <Text>Broken</Text>
                          </HStack>
                        </Radio>
                        <Radio value="Missing">
                          <HStack spacing={2}>
                            <Icon as={FiHelpCircle} boxSize={4} />
                            <Text>Missing</Text>
                          </HStack>
                        </Radio>
                        <Radio value="New / Donation">
                          <HStack spacing={2}>
                            <Icon as={FiCornerDownRight} boxSize={4} />
                            <Text>New / Donation</Text>
                          </HStack>
                        </Radio>
                        <Radio value="Needs repair">
                          <HStack spacing={2}>
                            <Icon as={FiTool} boxSize={4} />
                            <Text>Needs repair</Text>
                          </HStack>
                        </Radio>
                        <Radio value="Other">
                          <Text>Other (please explain in note below)</Text>
                        </Radio>
                      </VStack>
                    </RadioGroup>
                  </Box>

                  <Box>
                    <HStack spacing={2} mb={1}>
                      <Icon as={FiMusic} boxSize={4} />
                      <Heading size="sm" fontWeight="600">
                        How many instruments are affected?
                      </Heading>
                    </HStack>
                    <Text
                      color="teal.500"
                      fontSize="sm"
                      fontWeight="500"
                      mb={1}
                    >
                      Number of instruments{' '}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <NumberInput
                      min={0}
                      value={instrumentCount}
                      onChange={(v) => setInstrumentCount(parseInt(v, 10) || 0)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>

                  <Box>
                    <HStack spacing={2} mb={1}>
                      <Icon as={FiCamera} boxSize={4} />
                      <Heading size="sm" fontWeight="600">
                        Do you want to add photos or videos?
                      </Heading>
                    </HStack>
                    <Text color="teal.500" fontSize="sm" mb={2}>
                      This helps us understand the issue.
                    </Text>
                    {uploadedMedia.length > 0 && (
                      <HStack spacing={2} wrap="wrap" mb={2}>
                        {uploadedMedia.map((media, idx) => (
                          <Box key={idx} position="relative">
                            {media.file_type?.startsWith('image/') ? (
                              <Image
                                src={media.previewUrl || ''}
                                alt={media.file_name}
                                boxSize="80px"
                                objectFit="cover"
                                borderRadius="md"
                                bg="gray.100"
                              />
                            ) : (
                              <Box
                                boxSize="80px"
                                bg="gray.100"
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text fontSize="xs" textAlign="center" px={1}>
                                  {media.file_name}
                                </Text>
                              </Box>
                            )}
                            <CloseButton
                              size="sm"
                              position="absolute"
                              top={-1}
                              right={-1}
                              bg="red.500"
                              color="white"
                              borderRadius="full"
                              _hover={{ bg: 'red.600' }}
                              onClick={() => removeMedia(idx)}
                            />
                            <Text fontSize="xs" noOfLines={1} maxW="80px">
                              {media.file_name}
                            </Text>
                          </Box>
                        ))}
                      </HStack>
                    )}
                    <Button
                      variant="outline"
                      borderColor="teal.500"
                      color="teal.500"
                      size="sm"
                      onClick={mediaUploadDisclosure.onOpen}
                    >
                      + Upload Media
                    </Button>
                  </Box>

                  <Box>
                    <HStack spacing={2} mb={1}>
                      <Icon as={FiCalendar} boxSize={4} />
                      <Heading size="sm" fontWeight="600">
                        What is today&apos;s date?
                      </Heading>
                    </HStack>
                    <Text
                      color="teal.500"
                      fontSize="sm"
                      fontWeight="500"
                      mb={1}
                    >
                      Date{' '}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <Input
                      type="date"
                      value={updateDate}
                      onChange={(e) => setUpdateDate(e.target.value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </Box>

                  <Box>
                    <HStack spacing={2} mb={1}>
                      <Icon as={FiEdit3} boxSize={4} />
                      <Heading size="sm" fontWeight="600">
                        Add a note
                      </Heading>
                    </HStack>
                    <Text
                      color="teal.500"
                      fontSize="sm"
                      fontWeight="500"
                      mb={1}
                    >
                      Notes
                    </Text>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes"
                      minH="100px"
                    />
                  </Box>

                  <Box>
                    <HStack spacing={2} mb={2}>
                      <Icon as={FiStar} boxSize={4} />
                      <Heading size="sm" fontWeight="600">
                        Do you need admin help or approval for this?
                      </Heading>
                    </HStack>
                    <Checkbox
                      isChecked={needsAdminHelp}
                      onChange={(e) => setNeedsAdminHelp(e.target.checked)}
                      colorScheme="teal"
                    >
                      Yes, this is a special request
                    </Checkbox>
                    {needsAdminHelp && (
                      <Box mt={2}>
                        <Text
                          color="teal.500"
                          fontSize="sm"
                          fontWeight="500"
                          mb={1}
                        >
                          What do you need?{' '}
                          <Text as="span" color="red.500">
                            *
                          </Text>
                        </Text>
                        <Input
                          value={adminHelpNote}
                          onChange={(e) => setAdminHelpNote(e.target.value)}
                          placeholder="Example: replacement instruments or urgent repair."
                        />
                      </Box>
                    )}
                  </Box>
                </>
              ) : (
                /* --- STUDENT UPDATE FORM --- */
                <>
                  {/* Number of students */}
                  <Box>
                    <HStack spacing={2} mb={1}>
                      <Icon as={FiUsers} boxSize={4} />
                      <Heading size="sm" fontWeight="600">
                        How many students are currently enrolled?
                      </Heading>
                    </HStack>
                    <Text
                      color="teal.500"
                      fontSize="sm"
                      fontWeight="500"
                      mb={1}
                    >
                      Number of students{' '}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <NumberInput
                      min={0}
                      value={studentCount}
                      onChange={(v) => setStudentCount(v)}
                    >
                      <NumberInputField placeholder="105" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>

                  <Box>
                    <HStack spacing={2} mb={1}>
                      <Icon as={FiCamera} boxSize={4} />
                      <Heading size="sm" fontWeight="600">
                        Do you want to add photos or videos?
                      </Heading>
                    </HStack>
                    <Text color="teal.500" fontSize="sm" mb={2}>
                      Optional for documentation
                    </Text>
                    {uploadedMedia.length > 0 && (
                      <HStack spacing={2} wrap="wrap" mb={2}>
                        {uploadedMedia.map((media, idx) => (
                          <Box key={idx} position="relative">
                            <Box
                              boxSize="80px"
                              bg="gray.100"
                              borderRadius="md"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Text fontSize="xs" textAlign="center" px={1}>
                                {media.file_name}
                              </Text>
                            </Box>
                            <CloseButton
                              size="sm"
                              position="absolute"
                              top={-1}
                              right={-1}
                              bg="red.500"
                              color="white"
                              borderRadius="full"
                              _hover={{ bg: 'red.600' }}
                              onClick={() => removeMedia(idx)}
                            />
                          </Box>
                        ))}
                      </HStack>
                    )}
                    <Button
                      variant="outline"
                      borderColor="teal.500"
                      color="teal.500"
                      size="sm"
                      onClick={mediaUploadDisclosure.onOpen}
                    >
                      + Upload Media
                    </Button>
                  </Box>

                  <Box>
                    <HStack spacing={2} mb={2}>
                      <Icon as={FiStar} boxSize={4} />
                      <Heading size="sm" fontWeight="600">
                        Do you need admin help or approval for this?
                      </Heading>
                    </HStack>
                    <Checkbox
                      isChecked={needsAdminHelp}
                      onChange={(e) => setNeedsAdminHelp(e.target.checked)}
                      colorScheme="teal"
                    >
                      Yes, this is a special request
                    </Checkbox>
                    {needsAdminHelp && (
                      <Box mt={2}>
                        <Text
                          color="teal.500"
                          fontSize="sm"
                          fontWeight="500"
                          mb={1}
                        >
                          What do you need?{' '}
                          <Text as="span" color="red.500">
                            *
                          </Text>
                        </Text>
                        <Input
                          value={adminHelpNote}
                          onChange={(e) => setAdminHelpNote(e.target.value)}
                          placeholder="Example: replacement instruments or urgent repair."
                        />
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <HStack spacing={2} mb={1}>
                      <Icon as={FiCalendar} boxSize={4} />
                      <Heading size="sm" fontWeight="600">
                        What is today&apos;s date?
                      </Heading>
                    </HStack>
                    <Text
                      color="teal.500"
                      fontSize="sm"
                      fontWeight="500"
                      mb={1}
                    >
                      Date{' '}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <Input
                      type="date"
                      value={updateDate}
                      onChange={(e) => setUpdateDate(e.target.value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </Box>

                  {/* Notes */}
                  <Box>
                    <HStack spacing={2} mb={1}>
                      <Icon as={FiEdit3} boxSize={4} />
                      <Heading size="sm" fontWeight="600">
                        Add a note
                      </Heading>
                    </HStack>
                    <Text
                      color="teal.500"
                      fontSize="sm"
                      fontWeight="500"
                      mb={1}
                    >
                      Notes
                    </Text>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes"
                      minH="100px"
                    />
                  </Box>
                </>
              )}
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
            justify="space-between"
            align="center"
          >
            <Button
              variant="ghost"
              color="red.500"
              fontWeight="500"
              onClick={handleDelete}
              isDisabled={isLoading}
            >
              <Icon as={FiTrash2} boxSize={4} mr={1} /> Delete
            </Button>
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={handleClose}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                bg="teal.500"
                color="white"
                _hover={{ bg: 'teal.600' }}
                onClick={handleSave}
                isLoading={isLoading}
              >
                Save
              </Button>
            </HStack>
          </Flex>
        </DrawerContent>
      </Drawer>

      <MediaUploadModal
        isOpen={mediaUploadDisclosure.isOpen}
        onClose={mediaUploadDisclosure.onClose}
        onUploadComplete={handleMediaUploadComplete}
        formOrigin="update"
      />
    </>
  );
};
