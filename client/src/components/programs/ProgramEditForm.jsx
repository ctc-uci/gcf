import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
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

export const ProgramUpdateEditForm = ({ programUpdateId }) => {
  const { backend } = useBackendContext();

  const [isAddingInstrument, setIsAddingInstrument] = useState(false);
  const [isAddingRegionalDirector, setIsAddingRegionalDirector] =
    useState(false);
  const [instruments, setInstruments] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [addedInstruments, setAddedInstruments] = useState({});
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [regionalDirectors, setRegionalDirectors] = useState([]);
  const [selectedRegionalDirector, setSelectedRegionalDirector] = useState('');
  const [addedRegionalDirectors, setAddedRegionalDirectors] = useState({});
  const [enrollmentNumber, setEnrollmentNumber] = useState(null);
  const [graduatedNumber, setGraduatedNumber] = useState(null);
  const [newInstruments, setNewInstruments] = useState([]);

  /**
   * Legacy / unused state from earlier iterations.
   * Keeping these commented out for easy revert, per request.
   */
  // const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  // const [existingInstruments, setExistingInstruments] = useState([]);
  // const [title, setTitle] = useState('');
  // const [date, setDate] = useState('');

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
      userResponse,
      enrollmentChangeResponse;
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

      try {
        userResponse = await backend
          .get(`/gcf-users/role/${encodeURIComponent('Regional Director')}`)
          .then((r) => r.data);
      } catch (error) {
        console.error('Error fetching user: ', error);
        return;
      }

      setAddedRegionalDirectors(
        Object.fromEntries(
          userResponse.map((u) => [u.id, `${u.firstName} ${u.lastName}`])
        )
      );

      setRegionalDirectors(userResponse);
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

  const handleAddRegionalDirector = () => {
    const directorId = selectedRegionalDirector;
    if (!directorId) return;

    const user = regionalDirectors.find(
      (u) => String(u.id) === String(directorId)
    );
    if (!user) return;

    setAddedRegionalDirectors((prev) => ({
      ...prev,
      [directorId]: `${user.firstName} ${user.lastName}`,
    }));

    setSelectedRegionalDirector('');
  };

  const removeRegionalDirector = (id) => {
    setAddedRegionalDirectors((prev) => {
      const updated = { ...prev };
      delete updated[id];
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

      /**
       * Legacy / unused payload from earlier iterations.
       * Keeping commented out for easy revert, per request.
       */
      // const programUpdateData = {
      //   title: form.title,
      //   updateDate: new Date().toISOString().slice(0, 10),
      // };

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
      // Legacy: previously stored this in state; not needed for current flow
      // setExistingInstruments(instrumentsData);

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

      /**
       * Legacy / unused mapping from earlier iterations.
       * Keeping commented out for easy revert, per request.
       */
      // const instrumentNameToId = new Map(
      //   instruments.map((i) => [i.name, i.id])
      // );
      // const rows = Object.entries(addedInstruments).map(([name, qty]) => ({
      //   instrumentId: instrumentNameToId.get(name),
      //   updateId: programUpdateId,
      //   amountChanged: qty,
      // }));

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

      /**
       * Legacy / unused helper from earlier iterations.
       * Keeping commented out for easy revert, per request.
       */
      // const addInstrument = async () => {
      //   const name = newInstrumentName.trim();
      //
      //   try {
      //     await backend.post('/instruments', { name });
      //
      //     const instrumentsData = (await backend.get('/instruments')).data;
      //     setInstruments(instrumentsData);
      //
      //     setNewInstrumentName('');
      //     return name;
      //   } catch (error) {
      //     const status = error?.response?.status;
      //     throw new Error(
      //       `Instrument request failed: ${status ?? 'network/unknown'}`
      //     );
      //   }
      // };
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  /**
   * Legacy JSX (pre hi-fi grouping) kept for easy revert.
   * NOTE: This is intentionally commented out per request.
   */
  // const legacyRender = (
  //   <VStack p={8} width="35%" borderWidth="1px" borderColor="lightblue">
  //     <Heading size="md" textAlign="center">
  //       Program
  //     </Heading>
  //     <Divider w="110%" mb={4}></Divider>
  //     {programUpdateId && (
  //       <>
  //         <Card bg="gray.100">
  //           <CardHeader pt={6} pb={0}>
  //             <Heading size="sm">Update Notes</Heading>
  //           </CardHeader>
  //           <CardBody py={1}>
  //             <Text placeholder="None">{form.note}</Text>
  //           </CardBody>
  //         </Card>
  //         <FormControl isRequired>
  //           <FormLabel fontWeight="normal" color="gray">
  //             Title
  //           </FormLabel>
  //           <Input
  //             name="title"
  //             type="text"
  //             placeholder="Enter Title Here"
  //             bg="gray.100"
  //             value={form.title}
  //             onChange={handleChange}
  //           />
  //         </FormControl>
  //       </>
  //     )}
  //     {/* ... remainder omitted ... */}
  //   </VStack>
  // );
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

      {programUpdateId && (
        <>
          <Card bg="gray.50">
            <CardHeader
              pt={4}
              pb={2}
            >
              <Heading size="sm">Update Notes</Heading>
            </CardHeader>
            <CardBody py={2}>
              <Text placeholder="None">{form.note}</Text>
            </CardBody>
          </Card>
          <FormControl isRequired>
            <FormLabel
              fontWeight="normal"
              color="gray"
            >
              Update Title
            </FormLabel>
            <Input
              name="title"
              type="text"
              placeholder="Enter Title Here"
              bg="gray.100"
              value={form.title}
              onChange={handleChange}
            />
          </FormControl>
          <Divider />
        </>
      )}

      {/* General Information */}
      <Box>
        <Heading
          size="sm"
          mb={2}
        >
          General Information
        </Heading>
        <VStack
          align="stretch"
          spacing={3}
        >
          <FormControl isRequired>
            <FormLabel size="sm">Program Name</FormLabel>
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
            <FormLabel size="sm">Status</FormLabel>
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
            <FormLabel size="sm">Launch Date</FormLabel>
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

      {/* Location & Language */}
      <Box>
        <Heading
          size="sm"
          mb={2}
        >
          Location &amp; Language
        </Heading>
        <VStack
          align="stretch"
          spacing={3}
        >
          <FormControl isRequired>
            <FormLabel size="sm">Location</FormLabel>
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
            <FormLabel size="sm">Primary Language</FormLabel>
            <Input
              name="primary_language"
              placeholder="Enter Language"
              value={form.primary_language}
              onChange={handleChange}
            />
          </FormControl>
        </VStack>
      </Box>

      {/* Students & Instruments */}
      <Box>
        <Heading
          size="sm"
          mb={2}
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
              width="50%"
              value={enrollmentNumber ?? ''}
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
              width="50%"
              value={graduatedNumber ?? ''}
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
            <FormLabel>Instrument(s) &amp; Quantity</FormLabel>
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

      {/* Assigned Directors */}
      <Box>
        <Heading
          size="sm"
          mb={2}
        >
          Assigned Directors
        </Heading>
        <VStack
          align="stretch"
          spacing={3}
        >
          <FormControl>
            <FormLabel>Regional Director(s)</FormLabel>
            {!isAddingRegionalDirector && (
              <Button
                size="sm"
                onClick={() => setIsAddingRegionalDirector(true)}
              >
                + Add
              </Button>
            )}
            {isAddingRegionalDirector && (
              <HStack>
                <Select
                  name="regional_director"
                  placeholder="Select Regional Director(s)"
                  onChange={(e) => setSelectedRegionalDirector(e.target.value)}
                  value={selectedRegionalDirector}
                >
                  {regionalDirectors.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </Select>
                <Button
                  size="sm"
                  onClick={() => {
                    handleAddRegionalDirector();
                    setIsAddingRegionalDirector(false);
                  }}
                >
                  + Add
                </Button>
              </HStack>
            )}
          </FormControl>

          {Object.keys(regionalDirectors).length > 0 && (
            <HStack
              width="100%"
              flexWrap="wrap"
              spacing={2}
            >
              {Object.entries(addedRegionalDirectors).map(([id, name]) => (
                <Tag
                  key={id}
                  size="lg"
                  bg="gray.200"
                >
                  <TagLabel>{name}</TagLabel>
                  <TagCloseButton onClick={() => removeRegionalDirector(id)} />
                </Tag>
              ))}
            </HStack>
          )}
        </VStack>
      </Box>

      <Divider />
      <HStack
        w="100%"
        justify="space-between"
      >
        <Button
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
            Save Changes
          </Button>
        </HStack>
      </HStack>
    </VStack>
  );
};
