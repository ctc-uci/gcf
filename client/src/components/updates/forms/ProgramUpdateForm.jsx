import { useEffect, useRef, useState } from 'react';

import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  IconButton,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';

function formatUpdateDisplayDate(value) {
  if (value === null || value === undefined || value === '') return '';
  const s = String(value).trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (ymd && !/\d{1,2}:\d{2}/.test(s)) {
    const [, y, mo, d] = ymd;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d));
    if (Number.isNaN(dt.getTime())) return s;
    return dt.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) return s;
  return dt.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';

export const ProgramUpdateForm = ({
  isOpen: isOpenProp,
  onOpen: onOpenProp,
  onClose: onCloseProp,
  onSave,
  programUpdateId = null,
  isInstrumentUpdate = null,
  selectedUpdate = null,
}) => {
  const disclosure = useDisclosure();
  const isControlled = onOpenProp !== undefined && onCloseProp !== undefined;
  const isOpen = isControlled ? isOpenProp : disclosure.isOpen;
  const onClose = isControlled ? onCloseProp : disclosure.onClose;
  const btnRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [programId, setProgramId] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();

  const [title, setTitle] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState(null);
  const [graduatedNumber, setGraduatedNumber] = useState(null);
  const [enrollmentChangeId, setEnrollmentChangeId] = useState(null);
  const [notes, setNotes] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [updateType, setUpdateType] = useState('');
  const [programName, setProgramName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [updateDateTime, setUpdateDateTime] = useState('');

  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [quantity, setQuantity] = useState(0);

  const [existingInstruments, setExistingInstruments] = useState([]);
  const [addedInstruments, setAddedInstruments] = useState({});
  const [originalInstruments, setOriginalInstruments] = useState({});
  const [newInstruments, setNewInstruments] = useState([]);
  const [instrumentChangeMap, setInstrumentChangeMap] = useState({});

  const { backend } = useBackendContext();
  const toast = useToast();

  useEffect(() => {
    if (!programUpdateId) {
      setTitle('');
      setNotes('');
      setProgramId('');
      setEnrollmentNumber(null);
      setGraduatedNumber(null);
      setEnrollmentChangeId(null);
      setAddedInstruments({});
      setOriginalInstruments({});
      setNewInstruments([]);
      setSelectedInstrument('');
      setQuantity(0);
      setFlagged(false);
      setUpdateType('');
      setProgramName('');
      setAuthorName('');
      setUpdateDateTime('');
    }
  }, [programUpdateId]);

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await backend.get('/instruments');
        setExistingInstruments(response.data);
      } catch (error) {
        console.error('Error fetching instruments:', error);
        setExistingInstruments([]);
      }
    };
    fetchInstruments();
  }, [backend]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        let programs = [];
        if (role === 'Program Director') {
          const response = await backend.get(
            `/program-directors/me/${currentUser?.uid}/program`
          );
          programs = response.data ? [response.data] : [];
        } else if (role === 'Regional Director') {
          const response = await backend.get(
            `/regional-directors/${currentUser?.uid}/programs`
          );
          programs = response.data || [];
        } else if (role === 'Admin' || role === 'Super Admin') {
          const response = await backend.get(`/program`);
          programs = response.data || [];
        }
        setAvailablePrograms(programs);
        if (programs.length === 1 && programUpdateId === null) {
          setProgramId(programs[0].id);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };
    if (programUpdateId === null && currentUser?.uid && role) {
      fetchPrograms();
    }
  }, [role, currentUser, backend, programUpdateId]);

  useEffect(() => {
    const fetchProgramUpdate = async () => {
      if (programUpdateId === null) return;
      setIsLoading(true);
      if (
        selectedUpdate &&
        String(selectedUpdate.id) === String(programUpdateId)
      ) {
        setProgramName(selectedUpdate.name || '');
        setAuthorName(
          [selectedUpdate.firstName, selectedUpdate.lastName]
            .filter(Boolean)
            .join(' ') || ''
        );
        setUpdateDateTime(selectedUpdate.updateDate || '');
      }
      try {
        const response = await backend.get(
          `/program-updates/${programUpdateId}`
        );
        const data = response.data;
        setTitle(data.title || '');
        setNotes(data.note || '');
        setProgramId(parseInt(data.programId, 10));
        setUpdateDateTime(data.updateDate || '');

        const pid = parseInt(data.programId, 10);
        const listRow =
          selectedUpdate &&
          String(selectedUpdate.id) === String(programUpdateId)
            ? {
                name: selectedUpdate.name || '',
                author: [selectedUpdate.firstName, selectedUpdate.lastName]
                  .filter(Boolean)
                  .join(' '),
              }
            : null;

        if (listRow) {
          setProgramName(listRow.name);
          setAuthorName(listRow.author);
        } else {
          let resolvedProgramName = '';
          let resolvedAuthorName = '';
          const fetchGcfName = async (id) => {
            if (id == null || id === '') return '';
            try {
              const userRes = await backend.get(`/gcf-users/${id}`);
              return (
                [userRes.data?.firstName, userRes.data?.lastName]
                  .filter(Boolean)
                  .join(' ') || ''
              );
            } catch {
              return '';
            }
          };
          try {
            const progRes = await backend.get(`/program/${pid}`);
            resolvedProgramName = progRes.data?.name || '';
            const programCreatorId = progRes.data?.createdBy;
            resolvedAuthorName = await fetchGcfName(programCreatorId);
            if (!resolvedAuthorName && data.createdBy != null) {
              resolvedAuthorName = await fetchGcfName(data.createdBy);
            }
          } catch (e) {
            console.error('Error fetching program or author:', e);
          }
          setProgramName(resolvedProgramName);
          setAuthorName(resolvedAuthorName);
        }
        setUpdateType(data.updateType || data.title || '');
        setFlagged(data.flagged || false);

        try {
          const enrollmentResponse = await backend.get(
            `/enrollmentChange/update/${programUpdateId}`
          );
          if (enrollmentResponse.data && enrollmentResponse.data.length > 0) {
            const enrollmentData =
              enrollmentResponse.data[enrollmentResponse.data.length - 1];
            setEnrollmentChangeId(enrollmentData.id);
            setEnrollmentNumber(enrollmentData.enrollmentChange || null);
            setGraduatedNumber(enrollmentData.graduatedChange || null);
          }
        } catch (error) {
          console.error('Error fetching enrollment changes:', error);
        }

        try {
          const instrumentChangesResponse = await backend.get(
            `/instrument-changes/update/${programUpdateId}`
          );
          if (
            instrumentChangesResponse.data &&
            instrumentChangesResponse.data.length > 0
          ) {
            const instrumentsMap = {};
            const changeMeta = {};
            for (const change of instrumentChangesResponse.data) {
              const iName = existingInstruments.find(
                (i) => i.id === change.instrumentId
              )?.name;
              if (iName) {
                instrumentsMap[iName] = change.amountChanged;
                changeMeta[iName] = {
                  changeId: change.id,
                  instrumentId: change.instrumentId,
                };
              }
            }
            setAddedInstruments(instrumentsMap);
            setOriginalInstruments(JSON.parse(JSON.stringify(instrumentsMap)));
            setInstrumentChangeMap(changeMeta);
          }
        } catch (error) {
          console.error('Error fetching instrument changes:', error);
        }
      } catch (error) {
        console.error('Error fetching program update:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgramUpdate();
  }, [programUpdateId, existingInstruments, backend, selectedUpdate]);

  const removeInstrument = (name) => {
    setAddedInstruments((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    setNewInstruments((prev) => prev.filter((n) => n !== name));
  };

  const handleConfirmAddInstrument = () => {
    if (!selectedInstrument && !newInstrumentName) return;
    if (quantity === 0) return;
    if (selectedInstrument && newInstrumentName) return;

    if (newInstrumentName) {
      setNewInstruments((prev) => [...prev, newInstrumentName]);
    }
    setAddedInstruments((prev) => ({
      ...prev,
      [selectedInstrument || newInstrumentName]: parseInt(quantity),
    }));
    setNewInstrumentName('');
    setSelectedInstrument('');
    setQuantity(0);
  };

  const handleSubmit = async (markResolved = false) => {
    setIsLoading(true);
    try {
      const programUpdateData = {
        title: title ? String(title).trim() : null,
        program_id: parseInt(programId, 10) || null,
        created_by: currentUser?.uid,
        update_date: new Date().toISOString(),
        note: notes ? String(notes).trim() : null,
      };

      let updatedProgramUpdateId = programUpdateId;

      if (programUpdateId) {
        await backend.put(
          `/program-updates/${programUpdateId}`,
          programUpdateData
        );
      } else {
        const response = await backend.post(
          '/program-updates',
          programUpdateData
        );
        updatedProgramUpdateId = response.data.id;
      }

      // Handle new instruments
      for (const iName of newInstruments) {
        try {
          await backend.post('/instruments', { name: iName });
        } catch (error) {
          console.error(`Error adding instrument ${iName}:`, error);
        }
      }

      const instrumentsResponse = await backend.get('/instruments');
      setExistingInstruments(instrumentsResponse.data);

      // Handle deleted instruments
      const deletedInstruments = Object.keys(originalInstruments).filter(
        (name) => !addedInstruments[name]
      );
      for (const deletedName of deletedInstruments) {
        const changeMeta = instrumentChangeMap[deletedName];
        if (changeMeta?.changeId) {
          await backend.delete(`/instrument-changes/${changeMeta.changeId}`);
        }
      }

      // Handle added/updated instruments
      if (Object.keys(addedInstruments).length > 0) {
        for (const [name, qty] of Object.entries(addedInstruments)) {
          const meta = instrumentChangeMap[name];
          if (meta?.changeId) {
            if (originalInstruments[name] !== qty) {
              await backend.put(`/instrument-changes/${meta.changeId}`, {
                instrumentId: meta.instrumentId,
                updateId: updatedProgramUpdateId,
                amountChanged: qty,
              });
            }
          } else {
            const instrument = instrumentsResponse.data.find(
              (i) => i.name === name
            );
            if (instrument) {
              await backend.post('/instrument-changes', {
                instrumentId: instrument.id,
                updateId: updatedProgramUpdateId,
                amountChanged: qty,
              });
            }
          }
        }
      }

      if (isInstrumentUpdate && updatedProgramUpdateId) {
        const { data: rowsForThisProgramUpdate = [] } = await backend.get(
          `/instrument-changes/update/${updatedProgramUpdateId}`
        );
        for (const row of rowsForThisProgramUpdate) {
          await backend.put(`/instrument-changes/${row.id}`, {
            special_request: flagged,
          });
        }
      }

      // Handle enrollment
      if (enrollmentNumber !== null) {
        if (enrollmentChangeId) {
          await backend.put(`/enrollmentChange/${enrollmentChangeId}`, {
            update_id: updatedProgramUpdateId,
            enrollment_change: enrollmentNumber,
            graduated_change: graduatedNumber || 0,
          });
        } else {
          const enrollmentResponse = await backend.post('/enrollmentChange', {
            update_id: updatedProgramUpdateId,
            enrollment_change: enrollmentNumber,
            graduated_change: graduatedNumber || 0,
          });
          setEnrollmentChangeId(enrollmentResponse.data.id);
        }
      }

      toast({
        title: programUpdateId ? 'Update saved' : 'Update created',
        description: programUpdateId
          ? 'Program update was updated successfully.'
          : 'Program update was created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSave?.();
      onClose();
    } catch (error) {
      console.error('Error submitting program update:', error);
      toast({
        title: 'Failed to save',
        description:
          error?.response?.data?.message ??
          error?.message ??
          'Something went wrong.',
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
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
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
            Program Update
          </Text>
          <Divider mt={3} />
        </Box>

        <DrawerBody px={8} pb={24}>
          <VStack spacing={6} align="stretch">
            <Heading size="md" mt={4}>
              Update Information
            </Heading>

            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
              <GridItem>
                <Text color="teal.500" fontSize="sm" fontWeight="500" mb={1}>
                  Author
                </Text>
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    name={authorName || undefined}
                    bg="teal.500"
                    color="white"
                  />
                  <Text>{authorName || '—'}</Text>
                </HStack>
              </GridItem>
              <GridItem>
                <Text color="teal.500" fontSize="sm" fontWeight="500" mb={1}>
                  Program
                </Text>
                <Text fontWeight="500">{programName || '—'}</Text>
              </GridItem>
              <GridItem>
                <Text color="teal.500" fontSize="sm" fontWeight="500" mb={1}>
                  Time
                </Text>
                <Text>{formatUpdateDisplayDate(updateDateTime) || '—'}</Text>
              </GridItem>
            </Grid>
            {isInstrumentUpdate && (
              <Box>
                <Text color="teal.500" fontSize="sm" fontWeight="500" mb={2}>
                  Flag
                </Text>
                <Checkbox
                  isChecked={flagged}
                  onChange={(e) => setFlagged(e.target.checked)}
                >
                  Yes, this is a special request
                </Checkbox>
              </Box>
            )}
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
              <GridItem>
                <Text color="teal.500" fontSize="sm" fontWeight="500" mb={1}>
                  Update Type
                </Text>
                <Text>{isInstrumentUpdate ? 'Instrument' : 'Student'}</Text>
              </GridItem>
            </Grid>

            <Box>
              <Text color="teal.500" fontSize="sm" fontWeight="500" mb={2}>
                Photos/Videos
              </Text>
              <Text color="gray.400" fontSize="sm">
                No media attached
              </Text>
            </Box>

            <Box>
              <Text color="teal.500" fontSize="sm" fontWeight="500" mb={2}>
                Note
              </Text>
              <Text>{notes || ''}</Text>
            </Box>

            <Divider />
            {isInstrumentUpdate && (
              <Box>
                <Heading size="md">Edit Update</Heading>

                <Box>
                  <Text color="teal.500" fontSize="sm" fontWeight="500" mb={2}>
                    Instrument & Quantity
                  </Text>
                  <HStack wrap="wrap" spacing={2} mb={3}>
                    {Object.entries(addedInstruments).map(([name, qty]) => (
                      <Tag
                        key={name}
                        size="lg"
                        borderRadius="md"
                        variant="outline"
                      >
                        <TagLabel>
                          {name} {qty}
                        </TagLabel>
                        <TagCloseButton
                          onClick={() => removeInstrument(name)}
                        />
                      </Tag>
                    ))}
                  </HStack>
                  <HStack spacing={2}>
                    <Select
                      placeholder="Select Instrument"
                      value={selectedInstrument}
                      onChange={(e) => setSelectedInstrument(e.target.value)}
                      size="sm"
                      maxW="200px"
                    >
                      {existingInstruments.map((instrument) => (
                        <option key={instrument.id} value={instrument.name}>
                          {instrument.name}
                        </option>
                      ))}
                    </Select>
                    <NumberInput
                      step={1}
                      min={0}
                      width="80px"
                      value={quantity}
                      onChange={(v) => setQuantity(Number(v))}
                      size="sm"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleConfirmAddInstrument}
                    >
                      + Add
                    </Button>
                  </HStack>
                </Box>
              </Box>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
