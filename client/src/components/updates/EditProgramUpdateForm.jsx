import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
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
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { InstrumentSearchInput } from '@/components/common/InstrumentSearchInput';
import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';

export const EditProgramUpdateForm = ({
  isOpen,
  onClose,
  onSave,
  programUpdateId = null,
}) => {
  const btnRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [programId, setProgramId] = useState('');
  const { currentUser } = useAuthContext();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState(null);
  const [graduatedNumber, setGraduatedNumber] = useState(null);
  const [enrollmentChangeId, setEnrollmentChangeId] = useState(null);
  const [notes, setNotes] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
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
    const fetchProgramUpdate = async () => {
      if (!programUpdateId) {
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
      return;
    } else if (quantity === 0) {
      return;
    } else if (selectedInstrument && newInstrumentName) {
      return;
    }

    if (newInstrumentName) {
      setNewInstruments((prev) => [...prev, newInstrumentName]);
    }

    setAddedInstruments((prev) => ({
      ...prev,
      [selectedInstrument || newInstrumentName]: parseInt(quantity),
    }));

    setSearchQuery('');
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
    if (!programUpdateId) {
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

      const updatedProgramUpdateId = programUpdateId;

      await backend.put(
        `/program-updates/${programUpdateId}`,
        programUpdateData
      );

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

      for (const deletedName of deletedInstruments) {
        try {
          const changeMeta = instrumentChangeMap[deletedName];

          if (changeMeta && changeMeta.changeId) {
            await backend.delete(`/instrument-changes/${changeMeta.changeId}`);

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
        } else {
          const enrollmentResponse = await backend.post('/enrollmentChange', {
            update_id: updatedProgramUpdateId,
            enrollment_change: enrollmentNumber,
            graduated_change: graduatedNumber || 0,
          });
          setEnrollmentChangeId(enrollmentResponse.data.id);
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
      setSearchQuery('');
      setSelectedInstrument('');
      setNewInstrumentName('');

      toast({
        title: 'Update saved',
        description: 'Program update was updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSave?.();
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

  const programSelectDisabled = true;
  const availablePrograms = [];

  return (
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
          <DrawerCloseButton
            left="4"
            right="auto"
          />
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
            Update
          </Button>
        </HStack>

        <DrawerBody>
          <VStack
            spacing={4}
            align="stretch"
            marginLeft="1em"
          >
            <DrawerHeader
              padding="0 0"
              textAlign="center"
              width="100%"
            >
              Edit Update
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
              isDisabled={programSelectDisabled}
            >
              {availablePrograms.map((program) => (
                <option
                  key={program.id}
                  value={program.id}
                >
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
              align="flex-start"
              wrap="wrap"
            >
              <Box
                flex="1"
                minW="12rem"
              >
                <InstrumentSearchInput
                  instruments={existingInstruments}
                  value={searchQuery}
                  onChange={(val) => {
                    setSearchQuery(val);
                    if (val) {
                      setSelectedInstrument('');
                      setNewInstrumentName('');
                    }
                  }}
                  onSelectExisting={(inst) => {
                    setSelectedInstrument(inst.name);
                    setNewInstrumentName('');
                    setSearchQuery('');
                  }}
                  onCreateNew={(name) => {
                    setNewInstrumentName(name.trim());
                    setSelectedInstrument('');
                    setSearchQuery('');
                  }}
                  placeholder="Search instrument"
                />
                {(selectedInstrument || newInstrumentName) && (
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    mt={1}
                  >
                    Selected: {selectedInstrument || newInstrumentName}
                  </Text>
                )}
              </Box>
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
              <Button
                onClick={handleConfirmAddInstrument}
                isDisabled={!selectedInstrument && !newInstrumentName}
              >
                + Add
              </Button>
            </HStack>

            <HStack wrap="wrap">
              {Object.entries(addedInstruments).map(([name, qty]) => (
                <Tag key={name}>
                  <TagLabel>
                    {name}: {qty}
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
  );
};
