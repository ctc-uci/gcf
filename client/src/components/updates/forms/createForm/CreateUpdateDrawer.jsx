import { useEffect, useMemo, useRef, useState } from 'react';

import {
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
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { FaUser } from 'react-icons/fa6';
import { FiMaximize2, FiMinimize2, FiTrash2 } from 'react-icons/fi';
import { IoMusicalNoteSharp } from 'react-icons/io5';

import { MediaUploadModal } from '../../../media/MediaUploadModal';
import CreateUpdateInstrument from './CreateUpdateInstrument';
import CreateUpdateStudent from './CreateUpdateStudent';

const UpdateTypeOptionCard = ({ icon, label, isSelected, onSelect }) => {
  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      h="100%"
      minH="168px"
      border="2px solid"
      borderColor={isSelected ? 'teal.500' : 'gray.200'}
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      onClick={onSelect}
      bg="white"
      textAlign="center"
      transition="all 0.2s"
    >
      <Box
        flex={5}
        p={6}
        gap={0}
        alignItems="center"
        justifyContent="center"
      >
        <Box mt={3}>
          <Icon
            as={icon}
            boxSize={8}
            color={isSelected ? 'teal.600' : 'gray.500'}
          />
          <Text
            fontWeight="bold"
            fontSize="sm"
          >
            {label}
          </Text>
        </Box>
      </Box>
      <Box
        flex={1}
        bg={isSelected ? 'teal.50' : 'gray.100'}
        borderTop="1px solid"
        borderColor={isSelected ? 'teal.500' : 'gray.200'}
        minH={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={2}
      >
        <Box
          w="20px"
          h="20px"
          borderRadius="full"
          border="2px solid"
          borderColor={isSelected ? 'teal.500' : 'gray.300'}
          bg={isSelected ? 'teal.500' : 'white'}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {isSelected && (
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              bg="white"
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

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

  const [studentCount, setStudentCount] = useState(0);
  const [studentWhatHappened, setStudentWhatHappened] = useState('');
  const [programEnrollmentCount, setProgramEnrollmentCount] = useState(0);

  const [notes, setNotes] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState([]);

  const [instruments, setInstruments] = useState([]);
  const [programId, setProgramId] = useState(null);
  const [instrumentCountsByName, setInstrumentCountsByName] = useState({});

  const studentCountEditedRef = useRef(false);

  useEffect(() => {
    if (isOpen) studentCountEditedRef.current = false;
  }, [isOpen]);

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

  useEffect(() => {
    const fetchProgramInstrumentTotals = async () => {
      if (!programId || !isOpen) return;
      try {
        const response = await backend.get(`/program/${programId}/instruments`);
        const rows = response.data || [];
        const map = {};
        for (const row of rows) {
          if (row.name != null) {
            map[row.name] = Number(row.quantity ?? 0);
          }
        }
        setInstrumentCountsByName(map);
      } catch (error) {
        console.error('Error fetching program instrument totals:', error);
        setInstrumentCountsByName({});
      }
    };
    fetchProgramInstrumentTotals();
  }, [backend, programId, isOpen]);

  const programInstrumentCountForSelected = useMemo(() => {
    if (!selectedInstrument) return null;
    return instrumentCountsByName[selectedInstrument] ?? 0;
  }, [selectedInstrument, instrumentCountsByName]);

  useEffect(() => {
    const fetchProgramStats = async () => {
      if (!isOpen || !currentUser?.uid) return;
      try {
        const response = await backend.get(
          `/program-directors/me/${currentUser.uid}/stats`
        );
        const n = Number(response.data?.students ?? 0);
        setProgramEnrollmentCount(n);
      } catch (error) {
        console.error('Error fetching program stats:', error);
      }
    };
    fetchProgramStats();
  }, [backend, currentUser, isOpen]);

  const resetForm = () => {
    setUpdateType('instrument');
    setSelectedInstrument('');
    setWhatHappened('');
    setInstrumentCount(0);
    setStudentCount(programEnrollmentCount);
    setStudentWhatHappened('');
    setNotes('');
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
    if (!programId) {
      toast({
        title: 'Cannot save update',
        description:
          'Your program could not be loaded. Refresh the page and try again.',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const title =
        updateType === 'instrument' ? 'Instrument Update' : 'Student Update';

      let fullNote = notes;
      if (updateType === 'instrument' && whatHappened) {
        fullNote = `Reason: ${whatHappened}${notes ? `\n${notes}` : ''}`;
      } else if (updateType === 'student') {
        fullNote = notes;
      }

      const programUpdateData = {
        title,
        program_id: programId,
        created_by: currentUser?.uid,
        update_date: new Date().toISOString(),
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
          let instrumentDelta =
            whatHappened === 'New / Donation'
              ? instrumentCount
              : -1 * instrumentCount;
          const whatHappenedToEventType = {
            Broken: 'broken',
            Missing: 'missing',
            'New / Donation': 'new_donation',
            'Needs repair': 'needs_repair',
          };
          const instrumentEventType =
            whatHappenedToEventType[whatHappened] ?? 'other';
          await backend.post('/instrument-changes', {
            instrumentId: instrument.id,
            updateId: newUpdateId,
            amountChanged: instrumentDelta,
            event_type: instrumentEventType,
            description: instrumentEventType === 'other' ? notes || null : null,
          });
        }
      }

      if (updateType === 'student') {
        const affected = parseInt(String(studentCount), 10);
        const count = Number.isNaN(affected) ? 0 : affected;
        const isPositive = studentWhatHappened === 'new_students_joined';
        const enrollmentDelta = isPositive ? count : -count;
        if (enrollmentDelta !== 0) {
          await backend.post('/enrollmentChange', {
            update_id: newUpdateId,
            enrollment_change: enrollmentDelta,
            graduated_change: studentWhatHappened === 'graduated' ? count : 0,
            event_type: studentWhatHappened || 'other',
            description: notes || null,
          });
        }
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
        <DrawerContent
          maxW={isFullScreen ? '100%' : '50%'}
          borderTopLeftRadius="xl"
          borderBottomLeftRadius="xl"
          overflow="hidden"
        >
          <Flex
            position="absolute"
            top={3}
            left={3}
            zIndex={1}
          >
            <IconButton
              icon={isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
              aria-label={isFullScreen ? 'Minimize' : 'Expand'}
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
              Create New Update
            </Text>
            <Divider mt={3} />
          </Box>

          <DrawerBody
            px={8}
            pb={24}
          >
            <VStack
              spacing={6}
              align="stretch"
              mt={4}
            >
              <Box>
                <Heading
                  size="sm"
                  fontWeight="600"
                  mb={3}
                >
                  What type of update are you submitting today?
                </Heading>
                <HStack
                  spacing={4}
                  alignItems="stretch"
                >
                  <UpdateTypeOptionCard
                    icon={IoMusicalNoteSharp}
                    label="Instrument Update"
                    isSelected={updateType === 'instrument'}
                    onSelect={() => setUpdateType('instrument')}
                  />
                  <UpdateTypeOptionCard
                    icon={FaUser}
                    label="Student Update"
                    isSelected={updateType === 'student'}
                    onSelect={() => setUpdateType('student')}
                  />
                </HStack>
              </Box>

              {updateType === 'instrument' ? (
                <CreateUpdateInstrument
                  selectedInstrument={selectedInstrument}
                  setSelectedInstrument={setSelectedInstrument}
                  whatHappened={whatHappened}
                  setWhatHappened={setWhatHappened}
                  instrumentCount={instrumentCount}
                  setInstrumentCount={setInstrumentCount}
                  programInstrumentCountForSelected={
                    programInstrumentCountForSelected
                  }
                  instruments={instruments}
                  uploadedMedia={uploadedMedia}
                  removeMedia={removeMedia}
                  mediaUploadDisclosure={mediaUploadDisclosure}
                  notes={notes}
                  setNotes={setNotes}
                />
              ) : (
                <CreateUpdateStudent
                  studentCount={studentCount}
                  setStudentCount={setStudentCount}
                  whatHappened={studentWhatHappened}
                  setWhatHappened={setStudentWhatHappened}
                  programEnrollmentCount={programEnrollmentCount}
                  notes={notes}
                  setNotes={setNotes}
                />
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
              <Icon
                as={FiTrash2}
                boxSize={4}
                mr={1}
              />{' '}
              Delete
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
