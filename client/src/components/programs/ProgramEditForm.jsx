import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Heading,
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
  VStack,
} from '@chakra-ui/react';

import { PartnerOrganizationField } from '@/components/partners/PartnerOrganizationField';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { FaTrash, FaUserCircle } from 'react-icons/fa';

export const ProgramUpdateEditForm = ({ programUpdateId }) => {
  const { backend } = useBackendContext();

  const [isAddingInstrument, setIsAddingInstrument] = useState(false);
  const [instruments, setInstruments] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [addedInstruments, setAddedInstruments] = useState({});
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [currentRegionalDirectors, setCurrentRegionalDirectors] = useState([]);
  const [programDirectorOptions, setProgramDirectorOptions] = useState([]);
  const [selectedProgramDirectorId, setSelectedProgramDirectorId] =
    useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState(null);
  const [graduatedNumber, setGraduatedNumber] = useState(null);
  const [newInstruments, setNewInstruments] = useState([]);
  const [form, setForm] = useState({
    id: '',
    created_by: '',
    program_name: '',
    date_created: '',
    country: '',
    title: '',
    description: '',
    primary_language: '',
    playlist_link: '',
    partner_org: '',
    program_status: '',
    launch_date: '',
    countries: '',
    note: '',
  });

  useEffect(() => {
    let programUpdateResponse,
      programResponse,
      countryResponse,
      instrumentResponse,
      instrumentChangeResponse,
      enrollmentChangeResponse,
      regionalDirectorsResponse,
      programDirectorsResponse;
    const program_data = async () => {
      try {
        programUpdateResponse = await backend
          .get(`/program-updates/${programUpdateId}`)
          .then((r) => r.data);
      } catch (error) {
        console.error('Error fetching program update: ', error);
        return;
      }
      const program_id = programUpdateResponse.programId;

      try {
        [
          programResponse,
          countryResponse,
          instrumentResponse,
          instrumentChangeResponse,
          enrollmentChangeResponse,
          regionalDirectorsResponse,
          programDirectorsResponse,
        ] = await Promise.all([
          backend.get(`/program/${program_id}`).then((r) => r.data),
          backend.get(`/country`).then((r) => r.data),
          backend.get(`/instruments`).then((r) => r.data),
          backend
            .get(`/instrument-changes/update/${programUpdateId}`)
            .then((r) => r.data),
          backend
            .get(`/enrollmentChange/update/${programUpdateId}`)
            .then((r) => r.data),
          backend
            .get(`/program/${program_id}/regional-directors`)
            .then((r) => r.data),
          backend
            .get(`/program/${program_id}/program-directors`)
            .then((r) => r.data),
        ]);
      } catch (error) {
        console.error(
          'Error fetching countries/program/instruments/instrument_change: ',
          error
        );
        return;
      }

      const latestEnrollmentChange =
        enrollmentChangeResponse.length > 0
          ? enrollmentChangeResponse[enrollmentChangeResponse.length - 1]
          : null;

      if (latestEnrollmentChange) {
        setEnrollmentNumber(latestEnrollmentChange.enrollmentChange ?? null);
        setGraduatedNumber(latestEnrollmentChange.graduatedChange ?? null);
      } else {
        setEnrollmentNumber(null);
        setGraduatedNumber(null);
      }

      const match = new Map(instrumentResponse.map((i) => [i.id, i.name]));
      const instruments = {};

      for (const row of instrumentChangeResponse) {
        const name = match.get(row.instrumentId);
        instruments[name] = (instruments[name] ?? 0) + row.amountChanged;
      }
      setAddedInstruments(instruments);

      setForm({
        id: programResponse.id ?? '',
        created_by: programResponse.createdBy ?? '',
        program_name: programResponse.name ?? '',
        date_created: programResponse.dateCreated
          ? programResponse.dateCreated.slice(0, 10)
          : '',
        country: programResponse.country ?? '',
        title: programUpdateResponse.title ?? '',
        description: programResponse.description ?? '',
        primary_language: programResponse.primaryLanguage ?? '',
        playlist_link: '',
        partner_org: programResponse.partnerOrg ?? '',
        program_status: programResponse.status ?? '',
        launch_date: programResponse.launchDate
          ? programResponse.launchDate.slice(0, 10)
          : '',
        note: programUpdateResponse.note ?? '',
      });

      setCurrentRegionalDirectors(
        Array.isArray(regionalDirectorsResponse)
          ? regionalDirectorsResponse
          : []
      );
      const programDirectorsArray = Array.isArray(programDirectorsResponse)
        ? programDirectorsResponse
        : [];
      setProgramDirectorOptions(programDirectorsArray);
      if (programDirectorsArray.length > 0) {
        setSelectedProgramDirectorId(String(programDirectorsArray[0].userId));
      }
      setCountries(countryResponse);
      setInstruments(instrumentResponse);
    };
    program_data();
  }, [programUpdateId, backend]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validNewInstrument = () => {
    return (
      newInstrumentName.trim().length > 0 &&
      !instruments.some(
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

  const handleAddInstrumentAndQuantity = () => {
    handleNewInstrument();
    const typed = newInstrumentName.trim();
    const chosen = selectedInstrument.trim();
    const instrumentName = chosen || typed;

    if (!instrumentName || quantity <= 0) return;

    if (typed) {
      setNewInstruments((prev) => [...prev, typed]);
    }

    setAddedInstruments((prev) => ({
      ...prev,
      [instrumentName]: (prev[instrumentName] ?? 0) + quantity,
    }));

    setSelectedInstrument('');
    setNewInstrumentName('');
    setQuantity(0);
  };

  const removeInstrument = (name) => {
    setAddedInstruments((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      const programData = {
        name: form.program_name,
        status: form.program_status,
        launchDate: form.launch_date,
        country: form.country,
        primaryLanguage: form.primary_language,
        partnerOrg: form.partner_org,
        title: form.title,
        //playlist_link: form.playlist_link,
      };

      console.log('New instruments to add:', newInstruments);
      try {
        await backend.delete(`/instrument-changes/update/${programUpdateId}`);
      } catch (error) {
        console.error(`Error deleting instrument changes:`, error);
      }

      for (const instrumentName of newInstruments) {
        try {
          await backend.post('/instruments', { name: instrumentName });
        } catch (error) {
          console.error(`Error adding instrument ${instrumentName}:`, error);
        }
      }

      const instrumentsRes = await backend.get('/instruments');
      const instrumentsData = instrumentsRes.data;

      if (Object.keys(addedInstruments).length > 0) {
        const instrumentChanges = Object.entries(addedInstruments).map(
          ([name, qty]) => {
            const instrument = instrumentsData.find(
              (instr) => instr.name === name
            );
            if (!instrument) {
              throw new Error(`Instrument not found after refetch: ${name}`);
            }

            console.log(
              'instrumentsData, update id, and qty',
              instrumentsData,
              programUpdateId,
              qty
            );

            return {
              instrument_id: instrument.id,
              update_id: programUpdateId,
              amount_changed: qty,
            };
          }
        );

        for (const change of instrumentChanges) {
          await backend.post('/instrument-changes', {
            instrumentId: change.instrument_id,
            updateId: change.update_id,
            amountChanged: change.amount_changed,
          });
        }
      }
      await backend.put(`/program/${form.id}`, programData);

      if (enrollmentNumber !== null && graduatedNumber !== null) {
        console.log('Sending enrollment change:', {
          update_id: programUpdateId,
          enrollment_change: enrollmentNumber,
          graduated_change: graduatedNumber,
        });

        try {
          await backend.post('/enrollmentChange', {
            update_id: programUpdateId,
            enrollment_change: enrollmentNumber,
            graduated_change: graduatedNumber,
          });
        } catch (error) {
          console.error('POST /enrollmentChange failed:', error);
        }
        console.log('Enrollment change saved');
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  return (
    <VStack
      p={8}
      width="35%"
      borderWidth="1px"
      borderColor="lightblue"
      align="stretch"
      spacing={6}
    >
      <Heading
        size="md"
        textAlign="center"
      >
        Program
      </Heading>
      <Divider />

      <Box>
        <Heading
          size="md"
          fontWeight="semibold"
          mb={3}
        >
          General Information
        </Heading>
        <VStack
          align="stretch"
          spacing={4}
        >
          <FormControl isRequired>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              Program Name
            </FormLabel>
            <Input
              name="program_name"
              placeholder="Enter Program Title"
              value={form.program_name}
              onChange={handleChange}
            />
          </FormControl>

          <PartnerOrganizationField
            valueId={form.partner_org}
            onChangeId={(id) =>
              setForm((prev) => ({
                ...prev,
                partner_org: String(id),
              }))
            }
          />

          <FormControl isRequired>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              Status
            </FormLabel>
            <Select
              name="program_status"
              value={form.program_status}
              onChange={handleChange}
              placeholder="Select Status"
            >
              <option value="Active">Launched</option>
              <option value="Inactive">Developing</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              Launch Date
            </FormLabel>
            <Input
              name="launch_date"
              type="date"
              placeholder="MM/DD/YYYY"
              value={form.launch_date}
              onChange={handleChange}
            />
          </FormControl>
        </VStack>
      </Box>

      <Box>
        <Heading
          size="md"
          fontWeight="semibold"
          mb={3}
        >
          Location &amp; Language
        </Heading>
        <VStack
          align="stretch"
          spacing={3}
        >
          <FormControl isRequired>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              Location
            </FormLabel>
            <Select
              name="country"
              placeholder="Select Country"
              onChange={handleChange}
              value={form.country}
            >
              {countries.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              Primary Language
            </FormLabel>
            <Input
              name="primary_language"
              placeholder="Enter Language"
              value={form.primary_language}
              onChange={handleChange}
            />
          </FormControl>
        </VStack>
      </Box>

      <Box>
        <Heading
          size="md"
          fontWeight="semibold"
          mb={3}
        >
          Students &amp; Instruments
        </Heading>
        <VStack
          align="stretch"
          spacing={3}
        >
          <FormControl>
            <FormLabel
              fontWeight="normal"
              color="gray"
            >
              Current Students
            </FormLabel>
            <NumberInput
              width="100%"
              value={enrollmentNumber ?? 0}
              onChange={(value) =>
                setEnrollmentNumber(value ? parseInt(value) : null)
              }
            >
              <NumberInputField bg="gray.100" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel
              fontWeight="normal"
              color="gray"
            >
              Graduated Students
            </FormLabel>
            <NumberInput
              width="100%"
              value={graduatedNumber ?? 0}
              onChange={(value) =>
                setGraduatedNumber(value ? parseInt(value) : null)
              }
            >
              <NumberInputField bg="gray.100" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel
              fontWeight="normal"
              color="gray"
            >
              Instrument &amp; Quantity
            </FormLabel>
            {!isAddingInstrument && (
              <Button
                size="sm"
                onClick={() => setIsAddingInstrument(true)}
              >
                + Add
              </Button>
            )}
            {isAddingInstrument && (
              <HStack
                align="flex-end"
                spacing={3}
              >
                <Select
                  name="instrument"
                  placeholder="Select Instrument"
                  onChange={(e) => {
                    setSelectedInstrument(e.target.value);
                    setNewInstrumentName('');
                  }}
                  value={selectedInstrument}
                >
                  {instruments.map((instrument) => (
                    <option
                      key={instrument.id}
                      value={instrument.name}
                    >
                      {instrument.name}
                    </option>
                  ))}
                </Select>
                <Input
                  placeholder="Or type a new instrument"
                  value={newInstrumentName}
                  onChange={(e) => {
                    setNewInstrumentName(e.target.value);
                    setSelectedInstrument('');
                  }}
                />
                <NumberInput
                  value={quantity}
                  min={0}
                  onChange={(_, valueAsNumber) => {
                    setQuantity(valueAsNumber || 0);
                  }}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Button
                  size="sm"
                  onClick={() => {
                    handleAddInstrumentAndQuantity();
                    setIsAddingInstrument(false);
                  }}
                >
                  + Add
                </Button>
              </HStack>
            )}
          </FormControl>

          {Object.keys(addedInstruments).length > 0 && (
            <HStack
              width="100%"
              flexWrap="wrap"
              spacing={2}
            >
              {Object.entries(addedInstruments).map(([name, quantity]) => (
                <Tag
                  key={name}
                  size="lg"
                  bg="gray.200"
                >
                  <TagLabel>
                    {name} - {quantity}
                  </TagLabel>
                  <TagCloseButton onClick={() => removeInstrument(name)} />
                </Tag>
              ))}
            </HStack>
          )}
        </VStack>
      </Box>

      <Box>
        <Heading
          size="md"
          fontWeight="semibold"
          mb={3}
        >
          Assigned Directors
        </Heading>
        <VStack
          align="stretch"
          spacing={3}
        >
          <FormControl>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              Regional Director(s)
            </FormLabel>
            {Array.isArray(currentRegionalDirectors) &&
              currentRegionalDirectors.length > 0 && (
                <VStack
                  align="start"
                  spacing={1}
                  mb={2}
                >
                  {currentRegionalDirectors.map((d) => (
                    <HStack
                      key={d.userId}
                      spacing={2}
                    >
                      <FaUserCircle />
                      <Text>
                        {`${d.firstName ?? ''} ${d.lastName ?? ''}`.trim()}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              )}
          </FormControl>

          <FormControl>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              Program Director
            </FormLabel>
            <HStack spacing={2}>
              <FaUserCircle />
              <Select
                value={selectedProgramDirectorId}
                onChange={(e) => setSelectedProgramDirectorId(e.target.value)}
                placeholder="Select Program Director"
              >
                {programDirectorOptions.map((d) => (
                  <option
                    key={d.userId}
                    value={d.userId}
                  >
                    {d.firstName} {d.lastName}
                  </option>
                ))}
              </Select>
            </HStack>
          </FormControl>
        </VStack>
      </Box>

      {/* Resources */}
      <Box mt={8}>
        <Heading
          size="md"
          fontWeight="semibold"
          mb={3}
        >
          Resources
        </Heading>
        <VStack
          align="stretch"
          spacing={4}
        >
          <FormControl>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              Curriculum Link
            </FormLabel>
            <Button
              size="sm"
              variant="outline"
            >
              + Add
            </Button>
          </FormControl>

          <FormControl>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              Files
            </FormLabel>
            <Button
              size="sm"
              variant="outline"
            >
              + Add
            </Button>
          </FormControl>

          <FormControl>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              Media
            </FormLabel>
            <Button
              size="sm"
              variant="outline"
            >
              See All Media
            </Button>
          </FormControl>
        </VStack>
      </Box>

      <Divider />
      <HStack
        w="100%"
        justify="space-between"
      >
        <Button
          leftIcon={<FaTrash />}
          variant="ghost"
          colorScheme="red"
        >
          Delete
        </Button>
        <HStack spacing={3}>
          <Button variant="ghost">Cancel</Button>
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </HStack>
      </HStack>
    </VStack>
  );
};
