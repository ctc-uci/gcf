import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  HStack,
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
  Textarea,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';

export const ProgramUpdateForm = ({
  isOpen: isOpenProp,
  onOpen: onOpenProp,
  onClose: onCloseProp,
  programUpdateId = null,
}) => {
  const disclosure = useDisclosure();
  const isControlled = onOpenProp !== undefined && onCloseProp !== undefined;
  const isOpen = isControlled ? isOpenProp : disclosure.isOpen;
  const onClose = isControlled ? onCloseProp : disclosure.onClose;
  const btnRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [programId, setProgramId] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState(null);
  const [graduatedNumber, setGraduatedNumber] = useState(null);
  const [enrollmentChangeId, setEnrollmentChangeId] = useState(null);
  const [notes, setNotes] = useState('');

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
    if(!programUpdateId) {
      setTitle('');
      setDate('');
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
        } else if (role === 'Admin') {
          const response = await backend.get(`/program`);
          programs = response.data || [];
        } else {
          toast({
            title: 'Authorization error',
            description: 'You are not authorized to create a program update.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }
        setAvailablePrograms(programs);

        if (programs.length === 1 && programUpdateId === null) {
          setProgramId(programs[0].id);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load programs.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (programUpdateId === null && currentUser?.uid && role) {
      fetchPrograms();
    }
  }, [role, currentUser, backend, programUpdateId, toast]);

  useEffect(() => {
    const fetchProgramUpdate = async () => {
      if (programUpdateId === null) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await backend.get(
          `/program-updates/${programUpdateId}`
        );
        const data = response.data;

        setTitle(data.title || '');
        setDate(data.updateDate?.split('T')[0] || '');
        setNotes(data.note || '');
        setProgramId(parseInt(data.programId, 10));
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
              const instrumentName = existingInstruments.find(
                (i) => i.id === change.instrumentId
              )?.name;
              if (instrumentName) {
                instrumentsMap[instrumentName] = change.amountChanged;
                changeMeta[instrumentName] = {
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
  }, [programUpdateId, existingInstruments, backend]);

  const removeInstrument = (name) => {
    setAddedInstruments((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    setNewInstruments((prev) => prev.filter((n) => n !== name));
  };

  const validNewInstrument = () => {
    return (
      newInstrumentName.trim().length > 0 &&
      !existingInstruments.some(
        (instr) =>
          instr.name.toLowerCase() === newInstrumentName.trim().toLowerCase()
      )
    );
  };

  const handleNewInstrument = () => {
    if (!validNewInstrument()) {
      setNewInstrumentName('');
      return;
    }
  };

  const handleConfirmAddInstrument = () => {
    handleNewInstrument();

    if (!selectedInstrument && !newInstrumentName) {
      console.log('nothing selected');
      return;
    } else if (quantity === 0) {
      console.log('quantity 0');
      return;
    } else if (selectedInstrument && newInstrumentName) {
      console.log('both selected');
      return;
    }

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

  const handleSubmit = async () => {
    if (!title.trim() || !date || !notes.trim()) {
      toast({
        title: 'Validation error',
        description: 'Please fill in title, date, and notes.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (
      !programUpdateId &&
      (programId === null || programId === undefined || programId === '')
    ) {
      toast({
        title: 'Validation error',
        description: 'A program must be selected to create an update.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      const programUpdateData = {
        title: title ? String(title).trim() : null,
        program_id: parseInt(programId, 10) || null,
        created_by: currentUser?.uid,
        update_date: date ? String(date) : null,
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

      for (const instrumentName of newInstruments) {
        try {
          await backend.post('/instruments', {
            name: instrumentName,
          });
        } catch (error) {
          console.error(`Error adding instrument ${instrumentName}:`, error);
        }
      }

      const instrumentsResponse = await backend.get('/instruments');
      setExistingInstruments(instrumentsResponse.data);

      const deletedInstruments = Object.keys(originalInstruments).filter(
        (name) => !addedInstruments[name]
      );
      console.log('deletedInstruments to remove:', deletedInstruments);

      for (const deletedName of deletedInstruments) {
        try {
          const changeMeta = instrumentChangeMap[deletedName];
          console.log(`Deleting ${deletedName}, changeMeta:`, changeMeta);

          if (changeMeta && changeMeta.changeId) {
            const delRes = await backend.delete(
              `/instrument-changes/${changeMeta.changeId}`
            );
            console.log(
              `Successfully deleted instrument change for ${deletedName}:`,
              delRes && delRes.data ? delRes.data : delRes
            );

            setInstrumentChangeMap((prev) => {
              const p = { ...prev };
              delete p[deletedName];
              return p;
            });

            setOriginalInstruments((prev) => {
              const p = { ...prev };
              delete p[deletedName];
              return p;
            });
          } else {
            console.warn(
              `No changeId found for deleted instrument ${deletedName}`
            );
          }
        } catch (error) {
          console.error(`Error deleting instrument ${deletedName}:`, error);
        }
      }

      if (Object.keys(addedInstruments).length > 0) {
        for (const [name, qty] of Object.entries(addedInstruments)) {
          const meta = instrumentChangeMap[name];
          if (meta && meta.changeId) {
            const originalQty = originalInstruments[name];
            if (originalQty !== qty) {
              try {
                await backend.put(`/instrument-changes/${meta.changeId}`, {
                  instrumentId: meta.instrumentId,
                  updateId: updatedProgramUpdateId,
                  amountChanged: qty,
                });
                console.log(`Updated instrument change for ${name}`);
              } catch (error) {
                console.error(`Error updating instrument ${name}:`, error);
              }
            }
          } else {
            const instrument = instrumentsResponse.data.find(
              (instr) => instr.name === name
            );
            if (instrument) {
              try {
                await backend.post('/instrument-changes', {
                  instrumentId: instrument.id,
                  updateId: updatedProgramUpdateId,
                  amountChanged: qty,
                });
                console.log(`Created instrument change for ${name}`);
              } catch (error) {
                console.error(
                  `Error creating instrument change for ${name}:`,
                  error
                );
              }
            }
          }
        }
      }

      if (enrollmentNumber !== null) {
        if (enrollmentChangeId) {
          await backend.put(`/enrollmentChange/${enrollmentChangeId}`, {
            update_id: updatedProgramUpdateId,
            enrollment_change: enrollmentNumber,
            graduated_change: graduatedNumber || 0,
          });
          console.log('Updated existing enrollment change');
        } else {
          const enrollmentResponse = await backend.post('/enrollmentChange', {
            update_id: updatedProgramUpdateId,
            enrollment_change: enrollmentNumber,
            graduated_change: graduatedNumber || 0,
          });
          setEnrollmentChangeId(enrollmentResponse.data.id);
          console.log('Created new enrollment change');
        }
      }

      try {
        const finalEnrollmentResponse = await backend.get(
          `/enrollmentChange/update/${updatedProgramUpdateId}`
        );
        if (
          finalEnrollmentResponse.data &&
          finalEnrollmentResponse.data.length > 0
        ) {
          const enrollmentData =
            finalEnrollmentResponse.data[
              finalEnrollmentResponse.data.length - 1
            ];

          setEnrollmentChangeId(enrollmentData.id);
          setEnrollmentNumber(enrollmentData.enrollmentChange || null);
          setGraduatedNumber(enrollmentData.graduatedChange || null);
          console.log('Synced enrollment with server state:', enrollmentData);
        } else {
          setEnrollmentChangeId(null);
          setEnrollmentNumber(null);
          setGraduatedNumber(null);
        }
      } catch (error) {
        console.error(
          'Error refetching enrollment changes after submit:',
          error
        );
      }

      try {
        const finalInstrumentChangesResponse = await backend.get(
          `/instrument-changes/update/${updatedProgramUpdateId}`
        );
        if (
          finalInstrumentChangesResponse.data &&
          finalInstrumentChangesResponse.data.length > 0
        ) {
          const instrumentsMap = {};
          const changeMeta = {};
          for (const change of finalInstrumentChangesResponse.data) {
            const instrumentName = existingInstruments.find(
              (i) => i.id === change.instrumentId
            )?.name;
            if (instrumentName) {
              instrumentsMap[instrumentName] = change.amountChanged;
              changeMeta[instrumentName] = {
                changeId: change.id,
                instrumentId: change.instrumentId,
              };
            }
          }
          setAddedInstruments(instrumentsMap);
          setOriginalInstruments(JSON.parse(JSON.stringify(instrumentsMap)));
          setInstrumentChangeMap(changeMeta);
          console.log(
            'Synced addedInstruments with server state:',
            instrumentsMap
          );
        } else {
          setAddedInstruments({});
          setOriginalInstruments({});
          setInstrumentChangeMap({});
        }
      } catch (error) {
        console.error(
          'Error refetching instrument changes after submit:',
          error
        );
        setAddedInstruments({});
      }

      setNewInstruments([]);
      setTitle('');
      setDate('');
      setEnrollmentNumber(null);
      setGraduatedNumber(null);
      setEnrollmentChangeId(null);
      setNotes('');
      setSelectedInstrument('');
      if (programUpdateId === null) {
        setAddedInstruments({});
        setOriginalInstruments({});
        setInstrumentChangeMap({});
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
    } catch (error) {
      console.error('Error submitting program update:', error);
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'Something went wrong. Please try again.';
      const statusCode = error?.response?.status;
      toast({
        title: 'Failed to save',
        description: statusCode ? `${message} (${statusCode})` : message,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <HStack marginBottom="1em">
            <DrawerCloseButton left="4" right="auto" />
            <Button
              colorScheme="teal"
              marginLeft="auto"
              marginRight="2em"
              width="5em"
              height="2em"
              top="2"
              fontSize="small"
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              {programUpdateId ? 'Update' : 'Save'}
            </Button>
          </HStack>

          <DrawerBody>
            <VStack spacing={4} align="stretch" marginLeft="1em">
              <DrawerHeader padding="0 0">
                {programUpdateId ? 'Edit Update' : 'Create New Update'}
              </DrawerHeader>
              <h3>Title</h3>
              <Input
                type="text"
                placeholder="Enter Title Here"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <h3>Program</h3>
              <Select
                placeholder="Select Program"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                isDisabled={
                  programUpdateId !== null || availablePrograms.length === 1
                }
              >
                {availablePrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </Select>

              <h3>Date</h3>
              <Input
                type="date"
                placeholder="MM/DD/YYYY"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <h3># Students Currently Enrolled</h3>
              <NumberInput
                min={0}
                value={enrollmentNumber || ''}
                onChange={(value) =>
                  setEnrollmentNumber(value ? parseInt(value) : null)
                }
              >
                <NumberInputField placeholder="Enter # of Students Enrolled" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>

              <h3># Students Graduated</h3>
              <NumberInput
                min={0}
                value={graduatedNumber || ''}
                onChange={(value) =>
                  setGraduatedNumber(value ? parseInt(value) : null)
                }
              >
                <NumberInputField placeholder="Enter # of Students Graduated" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>

              <h3>Instrument(s) & Quantity</h3>
              <HStack
                border="1px"
                borderColor="gray.200"
                padding="1"
                borderRadius="md"
                spacing={2}
              >
                <Select
                  placeholder="Select Instrument"
                  value={selectedInstrument}
                  onChange={(e) => setSelectedInstrument(e.target.value)}
                >
                  {existingInstruments.map((instrument) => (
                    <option key={instrument.id} value={instrument.name}>
                      {instrument.name}
                    </option>
                  ))}
                </Select>
                <NumberInput
                  step={1}
                  defaultValue={0}
                  min={0}
                  width="8em"
                  value={quantity}
                  onChange={(valueString) => setQuantity(Number(valueString))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Button onClick={handleConfirmAddInstrument}>+ Add</Button>
              </HStack>

              <HStack wrap="wrap">
                {Object.entries(addedInstruments).map(([name, quantity]) => (
                  <Tag key={name}>
                    <TagLabel>
                      {name}: {quantity}
                    </TagLabel>
                    <TagCloseButton onClick={() => removeInstrument(name)} />
                  </Tag>
                ))}
              </HStack>

              <h3>Notes</h3>
              <Textarea
                borderColor="black"
                borderWidth={1}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                minH="120px"
                placeholder="Enter notes"
              />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
