import { useEffect, useMemo, useRef, useState } from 'react';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
  Skeleton,
  SkeletonText,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';
import { FaUser } from 'react-icons/fa6';
import { FiMaximize2, FiMinimize2, FiTrash2 } from 'react-icons/fi';
import { IoMusicalNoteSharp } from 'react-icons/io5';

import { MediaUploadModal } from '../../../media/MediaUploadModal';
import { ReviewProgramUpdate } from '../ReviewProgramUpdate';
import CreateUpdateInstrument from './CreateUpdateInstrument';
import CreateUpdateStudent from './CreateUpdateStudent';

const INSTRUMENT_EVENT_TO_LABEL = {
  broken: 'Broken',
  missing: 'Missing',
  new_donation: 'New / Donation',
  needs_repair: 'Needs repair',
  other: 'Other',
};

const WHAT_HAPPENED_TO_EVENT_TYPE = {
  Broken: 'broken',
  Missing: 'missing',
  'New / Donation': 'new_donation',
  'Needs repair': 'needs_repair',
  Other: 'other',
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

const UpdateTypeOptionCard = ({ icon, label, isSelected, onSelect }) => (
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
    <Box flex={5} p={6} alignItems="center" justifyContent="center">
      <Box mt={3}>
        <Icon as={icon} boxSize={8} color={isSelected ? 'teal.600' : 'gray.500'} />
        <Text fontWeight="bold" fontSize="sm">{label}</Text>
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
        w="20px" h="20px" borderRadius="full" border="2px solid"
        borderColor={isSelected ? 'teal.500' : 'gray.300'}
        bg={isSelected ? 'teal.500' : 'white'}
        display="flex" alignItems="center" justifyContent="center"
      >
        {isSelected && <Box w="8px" h="8px" borderRadius="full" bg="white" />}
      </Box>
    </Box>
  </Box>
);

export const CreateUpdateDrawer = ({
  isOpen, onClose, onSave,
  editProgramUpdateId = null,
  editVariant = null,
  editInstrumentName = null,
}) => {
  const { t } = useTranslation();
  const btnRef = useRef(null);
  const cancelDeleteRef = useRef(null);
  const { currentUser } = useAuthContext();
  const { backend } = useBackendContext();
  const toast = useToast();
  const mediaUploadDisclosure = useDisclosure();
  const deleteConfirmDisclosure = useDisclosure();
  const reviewDisclosure = useDisclosure();

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeletingUpdate, setIsDeletingUpdate] = useState(false);
  const [editingInstrumentChangeId, setEditingInstrumentChangeId] = useState(null);
  const [editingEnrollmentChangeId, setEditingEnrollmentChangeId] = useState(null);
  const [pendingChanges, setPendingChanges] = useState([]);

  const isEditMode = (editProgramUpdateId ?? '') !== '';

  const [updateType, setUpdateType] = useState('instrument');
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [instrumentCount, setInstrumentCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [studentWhatHappened, setStudentWhatHappened] = useState('');
  const [programEnrollmentCount, setProgramEnrollmentCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [specialRequest, setSpecialRequest] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const originalMediaIds = useRef(new Set());
  const originalValues = useRef(null);

  const [instruments, setInstruments] = useState([]);
  const [programId, setProgramId] = useState(null);
  const [instrumentCountsByName, setInstrumentCountsByName] = useState({});

  useEffect(() => {
    backend.get('/instruments')
      .then(r => setInstruments(r.data || []))
      .catch(e => console.error('Error fetching instruments:', e));
  }, [backend]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    backend.get(`/program-directors/me/${currentUser.uid}/program`)
      .then(r => { if (r.data) setProgramId(r.data.id); })
      .catch(e => console.error('Error fetching program:', e));
  }, [backend, currentUser]);

  useEffect(() => {
    if (!programId || !isOpen) return;
    backend.get(`/program/${programId}/instruments`)
      .then(r => {
        const map = {};
        for (const row of r.data || []) {
          if (row.name != null) map[row.name] = Number(row.quantity ?? 0);
        }
        setInstrumentCountsByName(map);
      })
      .catch(e => { console.error('Error fetching instrument totals:', e); setInstrumentCountsByName({}); });
  }, [backend, programId, isOpen]);

  const programInstrumentCountForSelected = useMemo(() => (
    selectedInstrument ? (instrumentCountsByName[selectedInstrument] ?? 0) : null
  ), [selectedInstrument, instrumentCountsByName]);

  useEffect(() => {
    if (!isOpen || !currentUser?.uid) return;
    backend.get(`/program-directors/me/${currentUser.uid}/stats`)
      .then(r => setProgramEnrollmentCount(Number(r.data?.students ?? 0)))
      .catch(e => console.error('Error fetching program stats:', e));
  }, [backend, currentUser, isOpen]);

  useEffect(() => {
    if (!isEditMode) { setEditingInstrumentChangeId(null); setEditingEnrollmentChangeId(null); return; }
    if (!isOpen || editVariant == null) return;
    let cancelled = false;

    const load = async () => {
      if (editVariant === 'instrument' && !instruments?.length) return;
      setIsEditLoading(true);
      try {
        const { data: pu } = await backend.get(`/program-updates/${editProgramUpdateId}`);
        if (cancelled) return;
        setProgramId(pu.programId);
        setUpdateType(editVariant);
        let loadedInstrumentChangeId = null;

        if (editVariant === 'instrument') {
          const { data: icRows = [] } = await backend.get(`/instrument-changes/update/${editProgramUpdateId}`);
          if (cancelled) return;
          let change = icRows[icRows.length - 1];
          if (editInstrumentName && icRows.length && instruments?.length) {
            const found = icRows.find(c => instruments.find(i => i.id === c.instrumentId)?.name === editInstrumentName);
            if (found) change = found;
          }
          if (change && instruments?.length) {
            loadedInstrumentChangeId = change.id;
            const inst = instruments.find(i => i.id === change.instrumentId);
            const instrumentName = inst?.name || '';
            const label = INSTRUMENT_EVENT_TO_LABEL[change.eventType] || 'Other';
            const amt = Number(change.amountChanged);
            const count = change.eventType === 'new_donation'
              ? Math.max(0, Number.isNaN(amt) ? 0 : amt)
              : Math.abs(Number.isNaN(amt) ? 0 : amt);
            const noteVal = extraNotesFromStoredNote(pu.note || '');
            const specialRequestVal = change.specialRequest === true;
            setSelectedInstrument(instrumentName);
            setEditingInstrumentChangeId(change.id);
            setWhatHappened(label);
            setInstrumentCount(count);
            setSpecialRequest(specialRequestVal);
            setNotes(noteVal);
            originalValues.current = { selectedInstrument: instrumentName, whatHappened: label, instrumentCount: count, notes: noteVal, specialRequest: specialRequestVal };
          }
        } else {
          const { data: ecRows = [] } = await backend.get(`/enrollmentChange/update/${editProgramUpdateId}`);
          if (cancelled) return;
          const ec = ecRows[ecRows.length - 1];
          if (ec) {
            const et = ec.eventType || 'other';
            const count = et === 'graduated' ? Number(ec.graduatedChange) || 0 : Math.abs(Number(ec.enrollmentChange) || 0);
            const noteVal = pu.note || '';
            setEditingEnrollmentChangeId(ec.id);
            setStudentWhatHappened(et);
            setStudentCount(count);
            setNotes(noteVal);
            originalValues.current = { studentWhatHappened: et, studentCount: count, notes: noteVal };
          }
        }

        if (loadedInstrumentChangeId) {
          try {
            const { data: mediaData = [] } = await backend.get(`/instrument-change-photos/instrument-change/${loadedInstrumentChangeId}`);
            if (!cancelled && mediaData.length > 0) {
              const urlResponses = await Promise.all(mediaData.map(m => backend.get(`/images/url/${m.s3Key}`)));
              if (cancelled) return;
              originalMediaIds.current = new Set(mediaData.map(m => m.id));
              setUploadedMedia(mediaData.map((m, i) => ({ id: m.id, s3_key: m.s3Key, file_name: m.fileName, file_type: m.fileType, previewUrl: urlResponses[i].data.url })));
            }
          } catch (e) { console.error('Error loading media for edit:', e); }
        }
      } catch (e) {
        console.error('Error loading update for edit:', e);
        toast({ title: 'Could not load update', status: 'error', duration: 5000, isClosable: true });
      } finally {
        if (!cancelled) setIsEditLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [isOpen, isEditMode, editProgramUpdateId, editVariant, editInstrumentName, instruments, backend, toast]);

  const handleClose = () => {
    setUpdateType('instrument'); setSelectedInstrument(''); setWhatHappened('');
    setInstrumentCount(0); setStudentCount(0); setStudentWhatHappened('');
    setNotes(''); setSpecialRequest(false); setUploadedMedia([]);
    originalMediaIds.current = new Set(); originalValues.current = null;
    setIsFullScreen(false); setEditingInstrumentChangeId(null); setEditingEnrollmentChangeId(null);
    onClose();
  };

  const confirmDeleteProgramUpdate = async () => {
    if (!editProgramUpdateId) return;
    setIsDeletingUpdate(true);
    try {
      await backend.delete(`/program-updates/${editProgramUpdateId}`);
      toast({ title: t('updates.deleteSuccessTitle'), description: t('updates.deleteSuccessDesc'), status: 'success', duration: 5000, isClosable: true });
      deleteConfirmDisclosure.onClose();
      onSave?.();
      handleClose();
    } catch (error) {
      console.error('Error deleting update:', error);
      toast({ title: t('updates.deleteErrorTitle'), description: t('updates.deleteErrorDesc'), status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsDeletingUpdate(false);
    }
  };

  const handleSave = async (isConfirmed = false) => {
    if (!programId) {
      toast({ title: t('updates.cannotSaveTitle'), description: t('updates.cannotSaveDesc'), status: 'error', duration: 7000, isClosable: true });
      return;
    }

    const isInstrumentDecrement = Boolean(selectedInstrument) && updateType === 'instrument' && Boolean(whatHappened) && whatHappened !== 'New / Donation';
    if (isInstrumentDecrement) {
      const currentTotal = programInstrumentCountForSelected ?? instrumentCountsByName[selectedInstrument] ?? 0;
      const n = Number(instrumentCount) || 0;
      if (n > currentTotal) {
        toast({ title: 'Cannot save', description: currentTotal <= 0 ? `There are no ${selectedInstrument} instruments on record.` : `You cannot report more (${n}) than the current total (${currentTotal}) for ${selectedInstrument}.`, status: 'error', duration: 7000, isClosable: true });
        return;
      }
    }

    const isStudentDecrement = updateType === 'student' && Boolean(studentWhatHappened) && studentWhatHappened !== 'new_joined';
    if (isStudentDecrement) {
      const currentTotal = Number(programEnrollmentCount) || 0;
      const n = Number(studentCount) || 0;
      if (n > currentTotal) {
        toast({ title: 'Cannot save', description: currentTotal <= 0 ? 'There are no students on record.' : `You cannot report more students (${n}) than the current total (${currentTotal}).`, status: 'error', duration: 7000, isClosable: true });
        return;
      }
    }

    // In edit mode, show the review modal first
    if (isEditMode && !isConfirmed) {
      const orig = originalValues.current || {};
      const changes = updateType === 'instrument'
        ? [
            { label: t('updates.instrument'), oldValue: orig.selectedInstrument, newValue: selectedInstrument },
            { label: t('updates.whatHappened'), oldValue: orig.whatHappened, newValue: whatHappened },
            { label: t('updates.quantity'), oldValue: orig.instrumentCount, newValue: instrumentCount },
            { label: t('updates.specialRequest'), oldValue: orig.specialRequest, newValue: specialRequest },
            { label: t('updates.notes'), oldValue: orig.notes, newValue: notes },
          ]
        : [
            { label: t('updates.whatHappened'), oldValue: orig.studentWhatHappened, newValue: studentWhatHappened },
            { label: t('updates.studentCount'), oldValue: orig.studentCount, newValue: studentCount },
            { label: t('updates.notes'), oldValue: orig.notes, newValue: notes },
          ];
      setPendingChanges(changes);
      reviewDisclosure.onOpen();
      return;
    }

    const fullNote = updateType === 'instrument' && whatHappened
      ? `Reason: ${whatHappened}${notes ? `\n${notes}` : ''}`
      : notes;
    const timestamp = new Date().toISOString();
    const programUpdateData = {
      title: updateType === 'instrument' ? 'Instrument Update' : 'Student Update',
      program_id: programId, created_by: currentUser?.uid,
      update_date: timestamp, updated_at: timestamp, note: fullNote || null,
    };

    setIsLoading(true);
    try {
      if (isEditMode) {
        await backend.put(`/program-updates/${editProgramUpdateId}`, programUpdateData);

        if (updateType === 'instrument' && editingInstrumentChangeId && selectedInstrument) {
          const instrument = instruments.find(i => i.name === selectedInstrument || String(i.id) === selectedInstrument);
          if (instrument) {
            const instrumentDelta = whatHappened === 'New / Donation' ? instrumentCount : -1 * instrumentCount;
            const instrumentEventType = WHAT_HAPPENED_TO_EVENT_TYPE[whatHappened] ?? 'other';
            await backend.put(`/instrument-changes/${editingInstrumentChangeId}`, {
              instrumentId: instrument.id, updateId: editProgramUpdateId,
              amountChanged: instrumentDelta, event_type: instrumentEventType,
              description: instrumentEventType === 'other' ? notes || null : null,
              special_request: specialRequest,
            });
          }
        }

        if (updateType === 'student' && editingEnrollmentChangeId) {
          const count = parseInt(String(studentCount), 10) || 0;
          const enrollmentDelta = studentWhatHappened === 'new_joined' ? count : -count;
          await backend.put(`/enrollmentChange/${editingEnrollmentChangeId}`, {
            update_id: editProgramUpdateId, enrollment_change: enrollmentDelta,
            graduated_change: studentWhatHappened === 'graduated' ? count : 0,
            event_type: studentWhatHappened || 'other', description: notes || null,
          });
        }

        const currentMediaIds = new Set(uploadedMedia.filter(m => m.id).map(m => m.id));
        for (const id of originalMediaIds.current) {
          if (!currentMediaIds.has(id)) {
            await backend.delete(updateType === 'instrument' ? `/instrument-change-photos/${id}` : `/mediaChange/${id}`);
          }
        }
        originalMediaIds.current = new Set(currentMediaIds);
        for (const media of uploadedMedia) {
          if (media.id) continue;
          if (updateType === 'instrument') {
            await backend.post('/instrument-change-photos', { instrument_change_id: editingInstrumentChangeId, s3_key: media.s3_key, file_name: media.file_name, file_type: media.file_type });
          }
        }

        toast({ title: 'Update saved', description: 'Your program update was updated successfully.', status: 'success', duration: 5000, isClosable: true, position: 'bottom' });
        reviewDisclosure.onClose();
        onSave?.();
        handleClose();
        return;
      }

      // Create mode
      const response = await backend.post('/program-updates', { ...programUpdateData, show_on_table: true, resolved: false });
      const newUpdateId = response.data.id;

      if (updateType === 'instrument' && selectedInstrument) {
        const instrument = instruments.find(i => i.name === selectedInstrument || String(i.id) === selectedInstrument);
        if (instrument) {
          const instrumentDelta = whatHappened === 'New / Donation' ? instrumentCount : -1 * instrumentCount;
          const instrumentEventType = WHAT_HAPPENED_TO_EVENT_TYPE[whatHappened] ?? 'other';
          const icResponse = await backend.post('/instrument-changes', {
            instrumentId: instrument.id, updateId: newUpdateId, amountChanged: instrumentDelta,
            event_type: instrumentEventType, description: instrumentEventType === 'other' ? notes || null : null,
            special_request: specialRequest,
          });
          for (const media of uploadedMedia) {
            await backend.post('/instrument-change-photos', { instrument_change_id: icResponse.data.id, s3_key: media.s3_key, file_name: media.file_name, file_type: media.file_type });
          }
        }
      }

      if (updateType === 'student') {
        const count = parseInt(String(studentCount), 10) || 0;
        const enrollmentDelta = studentWhatHappened === 'new_joined' ? count : -count;
        if (enrollmentDelta !== 0) {
          await backend.post('/enrollmentChange', {
            update_id: newUpdateId, enrollment_change: enrollmentDelta,
            graduated_change: studentWhatHappened === 'graduated' ? count : 0,
            event_type: studentWhatHappened || 'other', description: notes || null,
          });
        }
      }

      const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
      toast({ title: t('updates.createdTitle'), description: t('updates.createdDesc', { time: timeStr }), status: 'info', duration: 5000, isClosable: true, position: 'bottom' });
      onSave?.();
      handleClose();
    } catch (error) {
      console.error('Error saving program update:', error);
      toast({ title: t('updates.failedCreateTitle'), description: error?.response?.data?.message ?? t('updates.failedSaveDesc'), status: 'error', duration: 7000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={handleClose} finalFocusRef={btnRef} size={isFullScreen ? 'full' : 'lg'}>
        <DrawerOverlay />
        <DrawerContent maxW={isFullScreen ? '100%' : '50%'} borderTopLeftRadius="xl" borderBottomLeftRadius="xl" overflow="hidden">
          <Flex position="absolute" top={3} left={3} zIndex={1}>
            <IconButton
              icon={isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
              aria-label={isFullScreen ? t('fullscreenFlyout.minimize') : t('fullscreenFlyout.expand')}
              variant="ghost" size="sm" onClick={() => setIsFullScreen(!isFullScreen)}
            />
          </Flex>

          <Box pt={6} pb={2} px={8}>
            <Text fontSize="xl" fontWeight="600" textAlign="center">
              {isEditMode ? t('updates.editUpdate') : t('updates.createDrawerTitle')}
            </Text>
            <Divider mt={3} />
          </Box>

          <DrawerBody
            px={8}
            pb={24}
          >
            {isEditLoading && (
              <Box>
                <SkeletonText
                  mt="4"
                  noOfLines={4}
                  spacing="4"
                  skeletonHeight="5"
                  mb="10"
                />
                <Skeleton h="200px" />
                <SkeletonText
                  mt="4"
                  noOfLines={4}
                  spacing="4"
                  skeletonHeight="5"
                  mb="10"
                />
                <Skeleton h="50px" />
              </Box>
            )}
            <VStack
              spacing={6}
              align="stretch"
              mt={4}
              display={isEditLoading ? 'none' : 'flex'}
            >
              <Box>
                <Heading size="sm" fontWeight="600" mb={3}>
                  {isEditMode ? t('updates.updateType') : t('updates.createTypeQuestion')}
                </Heading>
                {isEditMode ? (
                  <Text fontWeight="600" color="gray.700">
                    {updateType === 'instrument' ? t('updates.titleInstrumentUpdate') : t('updates.titleStudentUpdate')}
                  </Text>
                ) : (
                  <HStack spacing={4} alignItems="stretch">
                    <UpdateTypeOptionCard icon={IoMusicalNoteSharp} label={t('updates.instrumentUpdateCard')} isSelected={updateType === 'instrument'} onSelect={() => setUpdateType('instrument')} />
                    <UpdateTypeOptionCard icon={FaUser} label={t('updates.studentUpdateCard')} isSelected={updateType === 'student'} onSelect={() => setUpdateType('student')} />
                  </HStack>
                )}
              </Box>

              {updateType === 'instrument' ? (
                <CreateUpdateInstrument
                  selectedInstrument={selectedInstrument} setSelectedInstrument={setSelectedInstrument}
                  whatHappened={whatHappened} setWhatHappened={setWhatHappened}
                  instrumentCount={instrumentCount} setInstrumentCount={setInstrumentCount}
                  programInstrumentCountForSelected={programInstrumentCountForSelected}
                  instruments={instruments} uploadedMedia={uploadedMedia}
                  removeMedia={(index) => setUploadedMedia(prev => prev.filter((_, i) => i !== index))}
                  mediaUploadDisclosure={mediaUploadDisclosure}
                  notes={notes} setNotes={setNotes}
                  specialRequest={specialRequest} setSpecialRequest={setSpecialRequest}
                />
              ) : (
                <CreateUpdateStudent
                  studentCount={studentCount} setStudentCount={setStudentCount}
                  whatHappened={studentWhatHappened} setWhatHappened={setStudentWhatHappened}
                  programEnrollmentCount={programEnrollmentCount}
                  notes={notes} setNotes={setNotes}
                />
              )}
            </VStack>
          </DrawerBody>

          <Flex position="absolute" bottom={0} left={0} right={0} bg="white" borderTop="1px solid" borderColor="gray.200" px={8} py={4} justify={isEditMode ? 'space-between' : 'flex-end'} align="center">
            {isEditMode && (
              <Button variant="ghost" color="red.500" fontWeight="500" onClick={deleteConfirmDisclosure.onOpen} isDisabled={isLoading || isEditLoading || isDeletingUpdate}>
                <Icon as={FiTrash2} boxSize={4} mr={1} /> {t('common.delete')}
              </Button>
            )}
            <HStack spacing={3}>
              <Button variant="outline" onClick={handleClose} isDisabled={isLoading || isEditLoading}>{t('common.cancel')}</Button>
              <Button bg="teal.500" color="white" _hover={{ bg: 'teal.600' }} onClick={() => handleSave(false)} isLoading={isLoading || isEditLoading}>{t('common.save')}</Button>
            </HStack>
          </Flex>
        </DrawerContent>
      </Drawer>

      <ReviewProgramUpdate
        isOpen={reviewDisclosure.isOpen}
        onClose={reviewDisclosure.onClose}
        onConfirm={() => handleSave(true)}
        changes={pendingChanges}
        isLoading={isLoading}
      />

      <AlertDialog isOpen={deleteConfirmDisclosure.isOpen} leastDestructiveRef={cancelDeleteRef} onClose={deleteConfirmDisclosure.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">{t('updates.deleteUpdateTitle')}</AlertDialogHeader>
            <AlertDialogBody>{t('updates.deleteUpdateBody')}</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={deleteConfirmDisclosure.onClose} isDisabled={isDeletingUpdate}>{t('common.cancel')}</Button>
              <Button colorScheme="red" ml={3} onClick={confirmDeleteProgramUpdate} isLoading={isDeletingUpdate}>{t('common.delete')}</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <MediaUploadModal isOpen={mediaUploadDisclosure.isOpen} onClose={mediaUploadDisclosure.onClose} onUploadComplete={(files) => setUploadedMedia(prev => [...prev, ...files])} formOrigin="update" />
    </>
  );
};