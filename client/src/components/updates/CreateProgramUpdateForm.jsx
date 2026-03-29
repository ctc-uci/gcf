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
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
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
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { BsMusicNote } from 'react-icons/bs';
import { FaCamera, FaTools } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa6';
import { IoMdClose } from 'react-icons/io';
import { MdHelpOutline } from 'react-icons/md';

export const CreateProgramUpdateForm = ({ isOpen, onClose, onSave }) => {
  const btnRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();
  const { backend } = useBackendContext();

  const [updateType, setUpdateType] = useState('instrument');
  const [programId, setProgramId] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState([]);

  const [instrumentEvent, setInstrumentEvent] = useState('broken');
  const [otherDetail, setOtherDetail] = useState('');

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState(null);
  const [graduatedNumber, setGraduatedNumber] = useState(null);
  const [notes, setNotes] = useState('');
  const [mediaFiles, setMediaFiles] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [quantity, setQuantity] = useState(0);

  const [existingInstruments, setExistingInstruments] = useState([]);
  const [addedInstruments, setAddedInstruments] = useState({});
  const [newInstruments, setNewInstruments] = useState([]);

  const todayStr = () => new Date().toISOString().split('T')[0];

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

        if (programs.length === 1) {
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

    fetchPrograms();
  }, [isOpen, role, currentUser, backend, toast]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setUpdateType('instrument');
    setInstrumentEvent('broken');
    setOtherDetail('');
    setTitle('');
    setDate(todayStr());
    setEnrollmentNumber(null);
    setGraduatedNumber(null);
    setNotes('');
    setMediaFiles(null);
    setSearchQuery('');
    setSelectedInstrument('');
    setNewInstrumentName('');
    setQuantity(0);
    setAddedInstruments({});
    setNewInstruments([]);
    setProgramId('');
  }, [isOpen]);

  useEffect(() => {
    if (updateType === 'student') {
      setSearchQuery('');
      setSelectedInstrument('');
      setNewInstrumentName('');
      setQuantity(0);
      setAddedInstruments({});
      setNewInstruments([]);
    }
  }, [updateType]);

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
    }
  };

  const handleConfirmAddInstrument = () => {
    handleNewInstrument();

    if (!selectedInstrument && !newInstrumentName) {
      return;
    }
    if (quantity === 0) {
      return;
    }
    if (selectedInstrument && newInstrumentName) {
      return;
    }

    if (newInstrumentName) {
      setNewInstruments((prev) => [...prev, newInstrumentName]);
    }

    setAddedInstruments((prev) => ({
      ...prev,
      [selectedInstrument || newInstrumentName]: parseInt(quantity, 10),
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
    if (programId === null || programId === undefined || programId === '') {
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

      const response = await backend.post(
        '/program-updates',
        programUpdateData
      );
      const updatedProgramUpdateId = response.data.id;

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

      if (Object.keys(addedInstruments).length > 0) {
        for (const [name, qty] of Object.entries(addedInstruments)) {
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

      if (enrollmentNumber !== null) {
        await backend.post('/enrollmentChange', {
          update_id: updatedProgramUpdateId,
          enrollment_change: enrollmentNumber,
          graduated_change: graduatedNumber || 0,
        });
      }

      setNewInstruments([]);
      setTitle('');
      setDate(todayStr());
      setEnrollmentNumber(null);
      setGraduatedNumber(null);
      setNotes('');
      setSearchQuery('');
      setSelectedInstrument('');
      setNewInstrumentName('');
      setQuantity(0);
      setAddedInstruments({});
      setInstrumentEvent('broken');
      setOtherDetail('');
      setMediaFiles(null);

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
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const programSelectDisabled = availablePrograms.length === 1;

  const sharedFields = (
    <>
      <FormControl>
        <FormLabel fontWeight="semibold">
          Title{' '}
          <Text
            as="span"
            color="red.500"
          >
            *
          </Text>
        </FormLabel>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short title"
          borderColor="#EDF2F7"
        />
      </FormControl>
      <FormControl>
        <FormLabel fontWeight="semibold">
          Program{' '}
          <Text
            as="span"
            color="red.500"
          >
            *
          </Text>
        </FormLabel>
        <Select
          placeholder="Select Program"
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
          isDisabled={programSelectDisabled}
          borderColor="#EDF2F7"
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
      </FormControl>
      <FormControl>
        <FormLabel fontWeight="semibold">
          Date{' '}
          <Text
            as="span"
            color="red.500"
          >
            *
          </Text>
        </FormLabel>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          borderColor="#EDF2F7"
        />
      </FormControl>
      <FormControl>
        <FormLabel># Students currently enrolled</FormLabel>
        <NumberInput
          min={0}
          value={enrollmentNumber ?? ''}
          onChange={(value) =>
            setEnrollmentNumber(
              value !== '' && value !== undefined
                ? parseInt(String(value), 10)
                : null
            )
          }
        >
          <NumberInputField borderColor="#EDF2F7" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel># Students graduated</FormLabel>
        <NumberInput
          min={0}
          value={graduatedNumber ?? ''}
          onChange={(value) =>
            setGraduatedNumber(
              value !== '' && value !== undefined
                ? parseInt(String(value), 10)
                : null
            )
          }
        >
          <NumberInputField borderColor="#EDF2F7" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
    </>
  );

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
                onChange={setUpdateType}
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
                      updateType === 'instrument' ? '#319795' : '#EDF2F7'
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
                          updateType === 'instrument' ? '#319795' : '#718096'
                        }
                        transition="color 0.2s"
                      />
                      <Text fontWeight="bold">Instrument Update</Text>
                    </VStack>
                    <Flex
                      h="44px"
                      align="center"
                      justify="center"
                      bg={updateType === 'instrument' ? '#E6FFFA' : '#EDF2F7'}
                      transition="background 0.2s"
                    >
                      <Radio
                        value="instrument"
                        colorScheme="gray"
                        sx={{
                          '& .chakra-radio__control': {
                            borderWidth: '1px',
                          },
                          ...(updateType === 'instrument' && {
                            '& .chakra-radio__control[data-checked]': {
                              bg: '#319795',
                              borderColor: '#319795',
                            },
                          }),
                        }}
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
                      updateType === 'student' ? '#319795' : '#EDF2F7'
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
                        color={updateType === 'student' ? '#319795' : '#718096'}
                        transition="color 0.2s"
                      />
                      <Text fontWeight="bold">Student Update</Text>
                    </VStack>
                    <Flex
                      h="44px"
                      align="center"
                      justify="center"
                      bg={updateType === 'student' ? '#E6FFFA' : '#EDF2F7'}
                      transition="background 0.2s"
                    >
                      <Radio
                        value="student"
                        colorScheme="gray"
                        sx={{
                          '& .chakra-radio__control': {
                            borderWidth: '1px',
                          },
                          ...(updateType === 'student' && {
                            '& .chakra-radio__control[data-checked]': {
                              bg: '#319795',
                              borderColor: '#319795',
                            },
                          }),
                        }}
                      />
                    </Flex>
                  </Box>
                </SimpleGrid>
              </RadioGroup>
            </Box>

            <VStack
              spacing={4}
              align="stretch"
            >
              {sharedFields}

              {updateType === 'instrument' && (
                <>
                  <Box>
                    <HStack
                      spacing={2}
                      mb={2}
                    >
                      <Icon
                        as={BsMusicNote}
                        color="black"
                      />
                      <Text fontWeight="semibold">
                        Instrument(s) & quantity
                      </Text>
                    </HStack>
                    <HStack
                      borderWidth="1px"
                      borderColor="#EDF2F7"
                      borderRadius="lg"
                      p={3}
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
                        min={0}
                        width="8em"
                        value={quantity}
                        onChange={(valueString) =>
                          setQuantity(Number(valueString))
                        }
                      >
                        <NumberInputField borderColor="#EDF2F7" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Button
                        bg="#319795"
                        color="white"
                        _hover={{ bg: '#2a8785' }}
                        onClick={handleConfirmAddInstrument}
                        isDisabled={!selectedInstrument && !newInstrumentName}
                      >
                        + Add
                      </Button>
                    </HStack>
                    <HStack
                      wrap="wrap"
                      mt={2}
                      spacing={2}
                    >
                      {Object.entries(addedInstruments).map(([name, qty]) => (
                        <Tag
                          key={name}
                          size="md"
                          borderRadius="md"
                        >
                          <TagLabel>
                            {name}: {qty}
                          </TagLabel>
                          <TagCloseButton
                            onClick={() => removeInstrument(name)}
                          />
                        </Tag>
                      ))}
                    </HStack>
                  </Box>

                  <Box>
                    <Text
                      fontWeight="semibold"
                      mb={3}
                    >
                      What happened to this instrument?
                    </Text>
                    <RadioGroup
                      onChange={setInstrumentEvent}
                      value={instrumentEvent}
                    >
                      <Stack spacing={3}>
                        <Radio
                          value="broken"
                          colorScheme="gray"
                          sx={{
                            '& .chakra-radio__control[data-checked]': {
                              bg: '#319795',
                              borderColor: '#319795',
                            },
                          }}
                        >
                          <HStack spacing={2}>
                            <Icon
                              as={IoMdClose}
                              color="black"
                            />
                            <Text>Broken</Text>
                          </HStack>
                        </Radio>
                        <Radio
                          value="missing"
                          colorScheme="gray"
                          sx={{
                            '& .chakra-radio__control[data-checked]': {
                              bg: '#319795',
                              borderColor: '#319795',
                            },
                          }}
                        >
                          <HStack spacing={2}>
                            <Icon
                              as={MdHelpOutline}
                              color="black"
                            />
                            <Text>Missing</Text>
                          </HStack>
                        </Radio>
                        <Radio
                          value="new_donation"
                          colorScheme="gray"
                          sx={{
                            '& .chakra-radio__control[data-checked]': {
                              bg: '#319795',
                              borderColor: '#319795',
                            },
                          }}
                        >
                          <HStack spacing={2}>
                            <Icon
                              as={BsMusicNote}
                              color="black"
                            />
                            <Text>New / Donation</Text>
                          </HStack>
                        </Radio>
                        <Radio
                          value="needs_repair"
                          colorScheme="gray"
                          sx={{
                            '& .chakra-radio__control[data-checked]': {
                              bg: '#319795',
                              borderColor: '#319795',
                            },
                          }}
                        >
                          <HStack spacing={2}>
                            <Icon
                              as={FaTools}
                              color="black"
                            />
                            <Text>Needs repair</Text>
                          </HStack>
                        </Radio>
                        <Radio
                          value="other"
                          colorScheme="gray"
                          sx={{
                            '& .chakra-radio__control[data-checked]': {
                              bg: '#319795',
                              borderColor: '#319795',
                            },
                          }}
                        >
                          <HStack spacing={2}>
                            <Box
                              w={4}
                              h={4}
                              borderRadius="full"
                              borderWidth={2}
                              borderColor="black"
                            />
                            <Text>Other (please explain in note below)</Text>
                          </HStack>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                    {instrumentEvent === 'other' && (
                      <Textarea
                        mt={3}
                        value={otherDetail}
                        onChange={(e) => setOtherDetail(e.target.value)}
                        placeholder="Describe what happened…"
                        borderColor="#EDF2F7"
                      />
                    )}
                  </Box>

                  <Box>
                    <HStack
                      spacing={2}
                      mb={2}
                    >
                      <Icon
                        as={FaCamera}
                        color="black"
                        boxSize={5}
                      />
                      <Text fontWeight="semibold">
                        Do you want to add photos or videos?
                      </Text>
                    </HStack>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      mb={3}
                    >
                      This helps us understand the issue.
                    </Text>
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      p={1}
                      onChange={(e) => setMediaFiles(e.target.files)}
                      borderColor="#EDF2F7"
                    />
                    {mediaFiles?.length > 0 && (
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        mt={2}
                      >
                        {mediaFiles.length} file(s) selected (not uploaded yet).
                      </Text>
                    )}
                  </Box>
                </>
              )}

              <FormControl>
                <FormLabel fontWeight="semibold">
                  Notes{' '}
                  <Text
                    as="span"
                    color="red.500"
                  >
                    *
                  </Text>
                </FormLabel>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  minH="120px"
                  placeholder={
                    updateType === 'student'
                      ? 'Describe the student update…'
                      : 'Enter notes'
                  }
                  borderColor="#EDF2F7"
                />
              </FormControl>
            </VStack>
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
              borderColor="#EDF2F7"
              color="black"
              bg="white"
              _hover={{ bg: '#EDF2F7' }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              bg="#319795"
              color="white"
              _hover={{ bg: '#2a8785' }}
              _active={{ bg: '#267a78' }}
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
