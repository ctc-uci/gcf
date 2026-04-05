import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Box,
  Button,
  Center,
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
  Spinner,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';
import { FaUser } from 'react-icons/fa6';
import {
  FiMaximize2,
  FiMinimize2,
  FiMusic,
  FiTrash2,
  FiUser,
} from 'react-icons/fi';
import { IoMusicalNoteSharp } from 'react-icons/io5';

import { MediaUploadModal } from '../../../media/MediaUploadModal';
import CreateUpdateInstrument from './CreateUpdateInstrument';
import CreateUpdateStudent from './CreateUpdateStudent';

const INSTRUMENT_EVENT_TO_LABEL = {
  broken: 'Broken',
  missing: 'Missing',
  new_donation: 'New / Donation',
  needs_repair: 'Needs repair',
  other: 'Other',
};

function extraNotesFromStoredNote(note) {
  if (!note) return '';
  const prefix = 'Reason: ';
  if (!note.startsWith(prefix)) return note;
  const rest = note.slice(prefix.length);
  const nl = rest.indexOf('\n');
  if (nl === -1) return '';
  return rest.slice(nl + 1).trim();
}

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

export const CreateUpdateDrawer = ({
  isOpen,
  onClose,
  onSave,
  editProgramUpdateId = null,
  editVariant = null,
  editInstrumentName = null,
}) => {
  const { t } = useTranslation();
  const btnRef = useRef(null);
  const { currentUser } = useAuthContext();
  const { backend } = useBackendContext();
  const toast = useToast();
  const mediaUploadDisclosure = useDisclosure();

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editingInstrumentChangeId, setEditingInstrumentChangeId] =
    useState(null);
  const [editingEnrollmentChangeId, setEditingEnrollmentChangeId] =
    useState(null);

  const isEditMode = (editProgramUpdateId ?? '') !== '';

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
          if (row.name !== undefined && row.name !== null) {
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

  useEffect(() => {
    if (!isEditMode) {
      setEditingInstrumentChangeId(null);
      setEditingEnrollmentChangeId(null);
      return;
    }
    if (!isOpen || editVariant === null || editVariant === undefined) return;

    let cancelled = false;

    const load = async () => {
      if (editVariant === 'instrument' && !instruments?.length) {
        return;
      }

      setIsEditLoading(true);
      try {
        const { data: pu } = await backend.get(
          `/program-updates/${editProgramUpdateId}`
        );
        if (cancelled) return;

        setProgramId(pu.programId);
        setUpdateType(editVariant);

        if (editVariant === 'instrument') {
          const { data: icRows = [] } = await backend.get(
            `/instrument-changes/update/${editProgramUpdateId}`
          );
          if (cancelled) return;

          let change = icRows[icRows.length - 1];
          if (editInstrumentName && icRows.length && instruments?.length) {
            const found = icRows.find((c) => {
              const inst = instruments.find((i) => i.id === c.instrumentId);
              return inst?.name === editInstrumentName;
            });
            if (found) change = found;
          }

          if (change && instruments?.length) {
            const inst = instruments.find((i) => i.id === change.instrumentId);
            setSelectedInstrument(inst?.name || '');
            setEditingInstrumentChangeId(change.id);
            const label =
              INSTRUMENT_EVENT_TO_LABEL[change.eventType] || 'Other';
            setWhatHappened(label);
            const amt = Number(change.amountChanged);
            const isDonation = change.eventType === 'new_donation';
            setInstrumentCount(
              isDonation
                ? Math.max(0, Number.isNaN(amt) ? 0 : amt)
                : Math.abs(Number.isNaN(amt) ? 0 : amt)
            );
            setNotes(extraNotesFromStoredNote(pu.note || ''));
          }
        } else {
          const { data: ecRows = [] } = await backend.get(
            `/enrollmentChange/update/${editProgramUpdateId}`
          );
          if (cancelled) return;

          const ec = ecRows[ecRows.length - 1];
          if (ec) {
            setEditingEnrollmentChangeId(ec.id);
            const et = ec.eventType || 'other';
            setStudentWhatHappened(et);
            if (et === 'graduated') {
              setStudentCount(Number(ec.graduatedChange) || 0);
            } else if (et === 'new_joined') {
              setStudentCount(Number(ec.enrollmentChange) || 0);
            } else {
              setStudentCount(Math.abs(Number(ec.enrollmentChange) || 0));
            }
            setNotes(pu.note || '');
          }
        }
      } catch (e) {
        console.error('Error loading update for edit:', e);
        toast({
          title: 'Could not load update',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        if (!cancelled) setIsEditLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    isEditMode,
    editProgramUpdateId,
    editVariant,
    editInstrumentName,
    instruments,
    backend,
    toast,
  ]);

  const resetForm = () => {
    setUpdateType('instrument');
    setSelectedInstrument('');
    setWhatHappened('');
    setInstrumentCount(0);
    setStudentCount(0);
    setStudentWhatHappened('');
    setNotes('');
    setUploadedMedia([]);
    setIsFullScreen(false);
    setEditingInstrumentChangeId(null);
    setEditingEnrollmentChangeId(null);
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
        title: t('updates.cannotSaveTitle'),
        description: t('updates.cannotSaveDesc'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      return;
    }

    // Prevent decrementing an instrument/students if goes over the current total
    const isInstrumentDecrement =
      Boolean(selectedInstrument) &&
      updateType === 'instrument' &&
      Boolean(whatHappened) &&
      whatHappened !== 'New / Donation';

    if (isInstrumentDecrement && selectedInstrument) {
      const currentTotal =
        programInstrumentCountForSelected ??
        instrumentCountsByName[selectedInstrument] ??
        0;
      const n = Number(instrumentCount) || 0;
      if (n > currentTotal) {
        toast({
          title: 'Cannot save',
          description:
            currentTotal <= 0
              ? `There are no ${selectedInstrument} instruments on record. You cannot remove more than you have.`
              : `You cannot report more (${n}) than the current total (${currentTotal}) for ${selectedInstrument}.`,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        return;
      }
    }

    const isStudentDecrement =
      updateType === 'student' &&
      Boolean(studentWhatHappened) &&
      studentWhatHappened !== 'new_joined';

    if (isStudentDecrement) {
      const currentTotal = Number(programEnrollmentCount) || 0;
      const n = Number(studentCount) || 0;
      if (n > currentTotal) {
        toast({
          title: 'Cannot save',
          description:
            currentTotal <= 0
              ? 'There are no students on record. You cannot remove more than you have.'
              : `You cannot report more students (${n}) than the current total (${currentTotal}).`,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        return;
      }
    }

    const whatHappenedToEventType = {
      Broken: 'broken',
      Missing: 'missing',
      'New / Donation': 'new_donation',
      'Needs repair': 'needs_repair',
      Other: 'other',
    };

    let fullNote = notes;
    if (updateType === 'instrument' && whatHappened) {
      fullNote = `Reason: ${whatHappened}${notes ? `\n${notes}` : ''}`;
    } else if (updateType === 'student') {
      fullNote = notes;
    }

    const programUpdateData = {
      title:
        updateType === 'instrument' ? 'Instrument Update' : 'Student Update',
      program_id: programId,
      created_by: currentUser?.uid,
      update_date: new Date().toISOString(),
      note: fullNote || null,
    };

    setIsLoading(true);
    try {
      if (isEditMode) {
        await backend.put(
          `/program-updates/${editProgramUpdateId}`,
          programUpdateData
        );

        if (
          updateType === 'instrument' &&
          editingInstrumentChangeId &&
          selectedInstrument
        ) {
          const instrument = instruments.find(
            (i) =>
              i.name === selectedInstrument ||
              String(i.id) === selectedInstrument
          );
          if (instrument) {
            const instrumentDelta =
              whatHappened === 'New / Donation'
                ? instrumentCount
                : -1 * instrumentCount;
            const instrumentEventType =
              whatHappenedToEventType[whatHappened] ?? 'other';
            await backend.put(
              `/instrument-changes/${editingInstrumentChangeId}`,
              {
                instrumentId: instrument.id,
                updateId: editProgramUpdateId,
                amountChanged: instrumentDelta,
                event_type: instrumentEventType,
                description:
                  instrumentEventType === 'other' ? notes || null : null,
              }
            );
          }
        }

        if (updateType === 'student' && editingEnrollmentChangeId) {
          const affected = parseInt(String(studentCount), 10);
          const count = Number.isNaN(affected) ? 0 : affected;
          const isPositive = studentWhatHappened === 'new_joined';
          const enrollmentDelta = isPositive ? count : -count;
          await backend.put(`/enrollmentChange/${editingEnrollmentChangeId}`, {
            update_id: editProgramUpdateId,
            enrollment_change: enrollmentDelta,
            graduated_change: studentWhatHappened === 'graduated' ? count : 0,
            event_type: studentWhatHappened || 'other',
            description: notes || null,
          });
        }

        for (const media of uploadedMedia) {
          await backend.post('/mediaChange', {
            update_id: editProgramUpdateId,
            s3_key: media.s3_key,
            file_name: media.file_name,
            file_type: media.file_type,
            is_thumbnail: false,
            instrument_id: null,
          });
        }

        toast({
          title: 'Update saved',
          description: 'Your program update was updated successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        });

        onSave?.();
        handleClose();
        return;
      }

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
          const instrumentDelta =
            whatHappened === 'New / Donation'
              ? instrumentCount
              : -1 * instrumentCount;
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
        const isPositive = studentWhatHappened === 'new_joined';
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
        title: t('updates.createdTitle'),
        description: t('updates.createdDesc', { time: timeStr }),
        status: 'info',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });

      onSave?.();
      handleClose();
    } catch (error) {
      console.error('Error saving program update:', error);
      toast({
        title: t('updates.failedCreateTitle'),
        description:
          error?.response?.data?.message ?? t('updates.failedSaveDesc'),
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
              {isEditMode ? 'Edit Update' : t('updates.createDrawerTitle')}
            </Text>
            <Divider mt={3} />
          </Box>

          <DrawerBody
            px={8}
            pb={24}
          >
            {isEditLoading && (
              <Center py={10}>
                <Spinner
                  size="lg"
                  color="teal.500"
                />
              </Center>
            )}
            <VStack
              spacing={6}
              align="stretch"
              mt={4}
              display={isEditLoading ? 'none' : 'flex'}
            >
              <Box>
                <Heading
                  size="sm"
                  fontWeight="600"
                  mb={3}
                >
                  {isEditMode ? 'Update type' : t('updates.createTypeQuestion')}
                </Heading>
                {isEditMode ? (
                  <Text
                    fontWeight="600"
                    color="gray.700"
                  >
                    {updateType === 'instrument'
                      ? 'Instrument Update'
                      : 'Student Update'}
                  </Text>
                ) : (
                  <HStack
                    spacing={4}
                    alignItems="stretch"
                  >
                    <UpdateTypeOptionCard
                      icon={IoMusicalNoteSharp}
                      label={t('updates.instrumentUpdateCard')}
                      isSelected={updateType === 'instrument'}
                      onSelect={() => setUpdateType('instrument')}
                    />
                    <UpdateTypeOptionCard
                      icon={FaUser}
                      label={t('updates.studentUpdateCard')}
                      isSelected={updateType === 'student'}
                      onSelect={() => setUpdateType('student')}
                    />
                  </HStack>
                )}
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
            {!isEditMode ? (
              <Button
                variant="ghost"
                color="red.500"
                fontWeight="500"
                onClick={handleDelete}
                isDisabled={isLoading || isEditLoading}
              >
                <Icon
                  as={FiTrash2}
                  boxSize={4}
                  mr={1}
                />{' '}
                {t('updates.deleteDraft')}
              </Button>
            ) : (
              <Box aria-hidden />
            )}
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={handleClose}
                isDisabled={isLoading || isEditLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                bg="teal.500"
                color="white"
                _hover={{ bg: 'teal.600' }}
                onClick={handleSave}
                isLoading={isLoading || isEditLoading}
              >
                {t('common.save')}
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
