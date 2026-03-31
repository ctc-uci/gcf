import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  Radio,
  RadioGroup,
  SimpleGrid,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { BsMusicNote } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa6';

import { InstrumentUpdateForm } from './InstrumentUpdateForm';
import { StudentUpdateForm } from './StudentUpdateForm';

const initialFormState = {
  updateType: 'instrument',
  programId: '',
  instrumentEvent: 'broken',
  otherEventDescription: '',
  studentEvent: 'new_joined',
  requiresAdminApproval: false,
  adminApprovalDetails: '',
  date: '',
  enrollmentNumber: null,
  graduatedNumber: null,
  notes: '',
  searchQuery: '',
  selectedInstrument: '',
  newInstrumentName: '',
  quantity: 0,
};

export const CreateProgramUpdateForm = ({ isOpen, onClose, onSave }) => {
  const btnRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();
  const { backend } = useBackendContext();

  const [formState, setFormState] = useState(initialFormState);
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [existingInstruments, setExistingInstruments] = useState([]);
  const [programStudentCounts, setProgramStudentCounts] = useState({});

  const {
    updateType,
    programId,
    instrumentEvent,
    otherEventDescription,
    date,
    enrollmentNumber,
    graduatedNumber,
    notes,
    selectedInstrument,
    newInstrumentName,
    quantity,
  } = formState;

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
    if (!isOpen || !currentUser?.uid || !role) {
      return;
    }

    const fetchPrograms = async () => {
      try {
        let programs = [];
        const counts = {};
        if (role === 'Program Director') {
          const [programResponse, statsResponse] = await Promise.all([
            backend.get(`/program-directors/me/${currentUser?.uid}/program`),
            backend.get(`/program-directors/me/${currentUser?.uid}/stats`),
          ]);
          programs = programResponse.data ? [programResponse.data] : [];
          if (programs.length === 1) {
            counts[programs[0].id] = Number(statsResponse.data?.students ?? 0);
          }
        } else if (role === 'Regional Director') {
          const [programsResponse, tableResponse] = await Promise.all([
            backend.get(`/regional-directors/${currentUser?.uid}/programs`),
            backend.get(`/rdProgramTable/${currentUser?.uid}`),
          ]);
          programs = programsResponse.data || [];
          (tableResponse.data || []).forEach((row) => {
            counts[row.program_id] = Number(row.total_students ?? 0);
          });
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
        setProgramStudentCounts(counts);

        if (programs.length === 1) {
          setFormState((prev) => ({ ...prev, programId: programs[0].id }));
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

    fetchPrograms();
  }, [isOpen, role, currentUser, backend]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setFormState({ ...initialFormState });
  }, [isOpen]);

  useEffect(() => {
    if (updateType === 'student') {
      setFormState((prev) => ({
        ...prev,
        searchQuery: '',
        selectedInstrument: '',
        newInstrumentName: '',
        quantity: 0,
      }));
    }
  }, [updateType]);

  const handleSubmit = async () => {
    if (!programId) {
      toast({
        title: 'Validation error',
        description: 'A program must be selected to create an update.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!date) {
      toast({
        title: 'Validation error',
        description: 'Please select a date.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (updateType === 'student') {
      if (enrollmentNumber === null || enrollmentNumber <= 0) {
        toast({
          title: 'Validation error',
          description: 'Please enter the number of students affected.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      if (!notes.trim()) {
        toast({
          title: 'Validation error',
          description: 'Please add a note.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    if (updateType === 'instrument') {
      if (!selectedInstrument && !newInstrumentName) {
        toast({
          title: 'Validation error',
          description: 'Please select or enter an instrument.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      if (quantity === 0) {
        toast({
          title: 'Validation error',
          description: 'Please enter the number of instruments affected.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      let programUpdateData;

      if (updateType === 'instrument') {
        const instrumentName = selectedInstrument || newInstrumentName;
        const eventLabel =
          instrumentEvent === 'other'
            ? otherEventDescription.trim() || 'Other'
            : instrumentEvent.replace(/_/g, ' ');
        programUpdateData = {
          title: `${instrumentName} - ${eventLabel}`,
          program_id: parseInt(programId, 10) || null,
          created_by: currentUser?.uid,
          update_date: date,
          note: eventLabel,
        };
      } else {
        programUpdateData = {
          title: `Student Update - ${formState.studentEvent.replace(/_/g, ' ')}`,
          program_id: parseInt(programId, 10) || null,
          created_by: currentUser?.uid,
          update_date: date,
          note: notes ? String(notes).trim() : null,
        };
      }

      const response = await backend.post(
        '/program-updates',
        programUpdateData
      );
      const updatedProgramUpdateId = response.data.id;

      if (updateType === 'instrument') {
        const instrumentName = selectedInstrument || newInstrumentName;

        if (newInstrumentName) {
          try {
            await backend.post('/instruments', { name: instrumentName });
          } catch (error) {
            console.error(`Error adding instrument ${instrumentName}:`, error);
          }
        }

        const instrumentsResponse = await backend.get('/instruments');
        setExistingInstruments(instrumentsResponse.data);

        const instrument = instrumentsResponse.data.find(
          (instrument) => instrument.name === instrumentName
        );
        if (instrument) {
          try {
            await backend.post('/instrument-changes', {
              instrumentId: instrument.id,
              updateId: updatedProgramUpdateId,
              amountChanged: quantity,
              event_type: instrumentEvent,
              description:
                instrumentEvent === 'other'
                  ? otherEventDescription.trim() || null
                  : null,
            });
          } catch (error) {
            console.error(
              `Error creating instrument change for ${instrumentName}:`,
              error
            );
          }
        }
      }

      if (updateType === 'student' && enrollmentNumber !== null) {
        await backend.post('/enrollmentChange', {
          update_id: updatedProgramUpdateId,
          enrollment_change: enrollmentNumber,
          graduated_change: graduatedNumber || 0,
          event_type: formState.studentEvent,
          description:
            formState.studentEvent === 'other' ? notes.trim() || null : null,
        });
      }

      setFormState((prev) => ({
        ...prev,
        instrumentEvent: 'broken',
        otherEventDescription: '',
        date: '',
        enrollmentNumber: null,
        graduatedNumber: null,
        notes: '',
        searchQuery: '',
        selectedInstrument: '',
        newInstrumentName: '',
        quantity: 0,
      }));

      toast({
        title: 'Update created',
        description: 'Program update was created successfully.',
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
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={btnRef}
      size="lg"
    >
      <DrawerOverlay />
      <DrawerContent
        display="flex"
        flexDirection="column"
        maxH="100vh"
      >
        <Box
          position="relative"
          pt={2}
          px={2}
        >
          <DrawerCloseButton
            position="absolute"
            left={3}
            top={3}
          />
        </Box>

        <DrawerHeader
          pt={10}
          pb={2}
          textAlign="center"
        >
          <Text
            fontSize="xl"
            fontWeight="semibold"
          >
            Create New Update
          </Text>
        </DrawerHeader>
        <Divider />

        <DrawerBody
          flex="1"
          overflowY="auto"
          px={6}
          py={5}
        >
          <VStack
            spacing={8}
            align="stretch"
          >
            <Box>
              <Text
                fontWeight="semibold"
                mb={3}
              >
                What type of update are you submitting today?
              </Text>
              <RadioGroup
                onChange={(value) =>
                  setFormState((prev) => ({ ...prev, updateType: value }))
                }
                value={updateType}
              >
                <SimpleGrid
                  columns={{ base: 1, sm: 2 }}
                  spacing={4}
                >
                  <Box
                    as="label"
                    cursor="pointer"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderRadius="lg"
                    overflow="hidden"
                    borderColor={
                      updateType === 'instrument' ? 'teal.600' : 'gray.100'
                    }
                    bg="white"
                    transition="border-color 0.2s"
                  >
                    <VStack
                      spacing={3}
                      py={6}
                      px={4}
                      bg="white"
                    >
                      <Icon
                        as={BsMusicNote}
                        boxSize={10}
                        color={
                          updateType === 'instrument' ? 'teal.600' : 'gray.500'
                        }
                        transition="color 0.2s"
                      />
                      <Text fontWeight="bold">Instrument Update</Text>
                    </VStack>
                    <Flex
                      h="44px"
                      align="center"
                      justify="center"
                      bg={updateType === 'instrument' ? 'teal.50' : 'gray.100'}
                      transition="background 0.2s"
                    >
                      <Radio
                        value="instrument"
                        colorScheme="teal"
                      />
                    </Flex>
                  </Box>
                  <Box
                    as="label"
                    cursor="pointer"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderRadius="lg"
                    overflow="hidden"
                    borderColor={
                      updateType === 'student' ? 'teal.600' : 'gray.100'
                    }
                    bg="white"
                    transition="border-color 0.2s"
                  >
                    <VStack
                      spacing={3}
                      py={6}
                      px={4}
                      bg="white"
                    >
                      <Icon
                        as={FaUser}
                        boxSize={10}
                        color={
                          updateType === 'student' ? 'teal.600' : 'gray.500'
                        }
                        transition="color 0.2s"
                      />
                      <Text fontWeight="bold">Student Update</Text>
                    </VStack>
                    <Flex
                      h="44px"
                      align="center"
                      justify="center"
                      bg={updateType === 'student' ? 'teal.50' : 'gray.100'}
                      transition="background 0.2s"
                    >
                      <Radio
                        value="student"
                        colorScheme="teal"
                      />
                    </Flex>
                  </Box>
                </SimpleGrid>
              </RadioGroup>
            </Box>

            {updateType === 'instrument' && (
              <InstrumentUpdateForm
                formState={formState}
                setFormState={setFormState}
                availablePrograms={availablePrograms}
                existingInstruments={existingInstruments}
              />
            )}

            {updateType === 'student' && (
              <StudentUpdateForm
                formState={formState}
                setFormState={setFormState}
                availablePrograms={availablePrograms}
                programStudentCounts={programStudentCounts}
              />
            )}
          </VStack>
        </DrawerBody>

        <DrawerFooter
          borderTopWidth="1px"
          py={4}
          px={6}
          flexShrink={0}
        >
          <HStack
            w="full"
            justify="flex-end"
            spacing={3}
          >
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Submit
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
