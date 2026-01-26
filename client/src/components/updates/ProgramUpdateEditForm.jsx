import {
  VStack,
  Card,
  CardBody,
  CardHeader,
  Text,
  Heading,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  HStack,
  Spacer,
  Tag,
  TagLabel,
  TagCloseButton
} from "@chakra-ui/react";

import { useState, useEffect } from "react";


/*import {
    AddIcon
} from "@chakra-ui/icons";*/

export const ProgramUpdateEditForm = ( {programUpdateId} ) => {
    const [isAddingInstrument, setIsAddingInstrument] = useState(false);
    const [isAddingLanguage, setIsAddingLanguage] = useState(false);
    const [isAddingRegionalDirector, setIsAddingRegionalDirector] = useState(false);
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
     const [existingInstruments, setExistingInstruments] = useState([])
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')


    const [form, setForm] = useState({
        id: "",
        created_by: "",
        program_name: "",
        date_created: "",
        country: "",
        title: "",
        description: "",
        primary_language: "",
        playlist_link: "",
        partner_org: "",
        program_status: "",
        launch_date: "",
        countries: "",
        note: ""
    });

    useEffect(() => {
        let programUpdateResponse, programResponse, countryResponse, instrumentResponse, instrumentChangeResponse, userResponse, enrollmentChangeResponse;
        const program_data = async () => {
            // fetching program update to get program id
            try {
                programUpdateResponse = await fetch(
                    `http://localhost:3001/program-updates/${programUpdateId}`
                ).then((r) => {
                    if (!r.ok) throw new Error(`Program Update Error: ${r.status}`)
                    return r.json()
            });
            } catch (error) {
                console.error('Error fetching program update: ', error)
                return;
            }
            const program_id = programUpdateResponse.programId;

            // fetching programs, countries, instruments
            try {
                [programResponse, countryResponse, instrumentResponse, instrumentChangeResponse, enrollmentChangeResponse] = await Promise.all([
                    fetch(`http://localhost:3001/program/${program_id}`).then((r) => {
                    if (!r.ok) throw new Error(`Program Error: ${r.status}`);
                    return r.json();
                    }),
                    fetch(`http://localhost:3001/country`).then((r) => {
                    if (!r.ok) throw new Error(`Country Error: ${r.status}`);
                    return r.json();
                    }),
                    fetch(`http://localhost:3001/instruments`).then((r) => {
                    if (!r.ok) throw new Error(`Country Error: ${r.status}`);
                    return r.json();
                    }),
                    fetch(
                    `http://localhost:3001/instrument-changes/`
                    ).then((r) => {
                    if (!r.ok) throw new Error(`Instrument Change Error: ${r.status}`)
                    return r.json();
                    }),
                    fetch(
                    `http://localhost:3001/enrollmentChange/`
                    ).then((r) => {
                    if (!r.ok) throw new Error(`Enrollment Change Error: ${r.status}`)
                    return r.json();
                    })
                ]);
            }
            catch (error){
                console.error('Error fetching countries/program/instruments/instrument_change: ', error);
                return;
            }

            // same things with the update id 
            // maybe add a route

            const filteredEnrollmentChange = enrollmentChangeResponse.filter(
                (row) => row.updateId === programUpdateId
            );

            const latestEnrollmentChange =
            filteredEnrollmentChange.length > 0
                ? filteredEnrollmentChange[filteredEnrollmentChange.length - 1]
                : null;

            if (latestEnrollmentChange) {
                setEnrollmentNumber(latestEnrollmentChange.enrollmentChange ?? null);
                setGraduatedNumber(latestEnrollmentChange.graduatedChange ?? null);
            } else {
                setEnrollmentNumber(null);
                setGraduatedNumber(null);
            }

            // need to get instrument changes with the update id
            // maybe should create route for selecting by update_id?
            const filteredInstrumentChange = instrumentChangeResponse.filter(
                (row) => row.updateId === programUpdateId
            );

            const match = new Map(instrumentResponse.map((i) => [i.id, i.name]));
            const instruments = {};

            for (const row of filteredInstrumentChange) {
                const name = match.get(row.instrumentId);
                // if there is a duplicate just add it on top otherwise make it
                instruments[name] = (instruments[name] ?? 0) + row.amountChanged;
            }
            setAddedInstruments(instruments);

            // need to get regional directors
            // maybe should create route for selecting by role_name and created_by id?

            setForm({
                id: programResponse.id ?? "",
                created_by: programResponse.createdBy ?? "",
                program_name: programResponse.name ?? "",
                date_created: programResponse.dateCreated
                ? programResponse.dateCreated.slice(0, 10)
                : "",
                country: programResponse.country ?? "",
                title: programUpdateResponse.title ?? "",
                description: programResponse.description ?? "",
                primary_language: programResponse.primaryLanguage ?? "",
                playlist_link: "",
                partner_org: programResponse.partnerOrg ?? "",
                program_status: programResponse.status ?? "",
                launch_date: programResponse.launchDate
                ? programResponse.launchDate.slice(0, 10)
                : "",
                note: programUpdateResponse.note ?? "",
            });

             //fetching gcf users to get regional directors
            try {
                userResponse = await fetch(
                    `http://localhost:3001/gcf-users`
                ).then((r) => {
                    if (!r.ok) throw new Error(`User Error: ${r.status}`)
                    return r.json()
            });
            } catch (error) {
                console.error('Error fetching user: ', error)
                return;
            }

            const filteredRegionalDirectors = userResponse.filter(
                user => user.role === "Regional Director"
            );

            setAddedRegionalDirectors(
                Object.fromEntries(
                    filteredRegionalDirectors.map((u) => [u.id, `${u.firstName} ${u.lastName}`])
                )
            );
        
            
            setRegionalDirectors(filteredRegionalDirectors);
            setCountries(countryResponse);
            setInstruments(instrumentResponse);
        };
        program_data();
    }, [programUpdateId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };


    const validNewInstrument = () => {
        return newInstrumentName.trim().length > 0 && 
            !instruments.some(instr => instr.name.toLowerCase() === newInstrumentName.trim().toLowerCase());
    }

    const handleNewInstrument = () => {
        if (!validNewInstrument()) {
            setNewInstrumentName('');
            return;
        }
    };

    const handleAddInstrumentAndQuantity = () => {
        handleNewInstrument()
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
        

        setSelectedInstrument("");
        setNewInstrumentName("");
        setQuantity(0);
    };


    const removeInstrument = (name) => {
        setAddedInstruments(prev => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
        });
    };

    const handleAddRegionalDirector = () => {
        const directorId = selectedRegionalDirector;
        if (!directorId) return;

        const user = regionalDirectors.find((u) => String(u.id) === String(directorId));
        if (!user) return; // still protects you if data isn't loaded

        setAddedRegionalDirectors((prev) => ({
            ...prev,
            [directorId]: `${user.firstName} ${user.lastName}`,
        }));

        setSelectedRegionalDirector("");
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
            }

            const programUpdateData = {
                title: form.title,
                updateDate: new Date().toISOString().slice(0, 10),
            }

            console.log("New instruments to add:", newInstruments);

            for (const instrumentName of newInstruments) {
            try {
                const res = await fetch("http://localhost:3001/instruments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: instrumentName }),
                });

                if (!res.ok) {
                throw new Error(`POST /instruments failed: ${res.status}`);
                }

                console.log(`Added new instrument: ${instrumentName}`);
            } catch (error) {
                console.error(`Error adding instrument ${instrumentName}:`, error);
            }
            }

            // refetch instruments to get their ids
            const instrumentsRes = await fetch("http://localhost:3001/instruments");
            if (!instrumentsRes.ok) {
            throw new Error(`GET /instruments failed: ${instrumentsRes.status}`);
            }
            const instrumentsData = await instrumentsRes.json();
            setExistingInstruments(instrumentsData);

            console.log("Added Instruments:", addedInstruments);

            // create instrument changes if any instruments were added
            if (Object.keys(addedInstruments).length > 0) {
            const instrumentChanges = Object.entries(addedInstruments).map(([name, qty]) => {
                const instrument = instrumentsData.find((instr) => instr.name === name);
                if (!instrument) {
                throw new Error(`Instrument not found after refetch: ${name}`);
                }

                console.log("instrumentsData, update id, and qty", instrumentsData, programUpdateId, qty);

                return {
                instrument_id: instrument.id,
                update_id: programUpdateId,
                amount_changed: qty,
                };
            });

            console.log("Sending instrument changes:", instrumentChanges[0]);

            for (const change of instrumentChanges) {
                const res = await fetch("http://localhost:3001/instrument-changes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    instrumentId: change.instrument_id,
                    updateId: change.update_id,
                    amountChanged: change.amount_changed,
                }),
                });

                if (!res.ok) {
                throw new Error(`POST /instrument-changes failed: ${res.status}`);
                }
            }
            }
            
            const programPutResponse = await fetch(`http://localhost:3001/program/${form.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(programData),
                });
            if (!programPutResponse.ok) throw new Error(`PUT program failed: ${programPutResponse.status}`);

            const programUpdatePutResponse = await fetch(`http://localhost:3001/program-updates/${programUpdateId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(programUpdateData),
                });
            if (!programUpdatePutResponse.ok) throw new Error(`PUT program failed: ${programUpdatePutResponse.status}`);

            const instrumentNameToId = new Map(instruments.map((i) => [i.name, i.id]));

            const rows = Object.entries(addedInstruments).map(([name, qty]) => ({
                instrumentId: instrumentNameToId.get(name),
                updateId: programUpdateId,
                amountChanged: qty,
            }));

            if (enrollmentNumber !== null && graduatedNumber !== null) {
                console.log("Sending enrollment change:", {
                    update_id: programUpdateId,
                    enrollment_change: enrollmentNumber,
                    graduated_change: graduatedNumber,
                });

                const enrollmentPostResponse = await fetch("http://localhost:3001/enrollmentChange", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                    update_id: programUpdateId,
                    enrollment_change: enrollmentNumber,
                    graduated_change: graduatedNumber,
                    }),
                });
                if (!enrollmentPostResponse.ok) {
                    throw new Error(`POST enrollmentChange failed: ${enrollmentPostResponse.status}`);
                }
                console.log("Enrollment change saved");
            }


            const addInstrument = async () => {
            const name = newInstrumentName.trim()

            // might want to check if instrument alr exists before adding
            const postResponse = await fetch('http://localhost:3001/instruments', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({name}),
            });

            // reftch for dropdown
            if (!postResponse.ok) {
                throw new Error(`POST instrument error: ${postResponse.status}`);
                }

                const getResponse = await fetch("http://localhost:3001/instruments");

                if (!getResponse.ok) {
                throw new Error(`GET instruments failed: ${getResponse.status}`);
                }

                const instrumentsData = await getResponse.json();
                setInstruments(instrumentsData);

                setNewInstrumentName("");
                return name;
            };
        } catch (err) {
            console.error("Save failed:", err);
        }
    };
    return (
        <VStack p={8} width='35%' borderWidth="1px" borderColor="lightblue">
            <Heading size="md" textAlign="center">Program</Heading>
            <Divider w="110%" mb={4}></Divider>
            <Card bg='gray.100'>
                <CardHeader pt={6} pb={0}>
                    <Heading size="sm">Update Notes</Heading>
                </CardHeader>
                <CardBody py={1}>
                    <Text placeholder = "None">
                        {form.note}
                    </Text>
                </CardBody>
            </Card>
            <FormControl isRequired>
                <FormLabel fontWeight="normal" color="gray">
                    Title
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
            <FormControl isRequired>
                <FormLabel size='sm'>Program Name</FormLabel>
                <Input 
                    name="program_name"
                    placeholder='Program Name'
                    value = {form.program_name}
                    onChange={handleChange}
                />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select 
                    name="program_status"
                    value={form.program_status}
                    onChange={handleChange}
                    placeholder='Select Status'
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </Select>
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Launch Date</FormLabel>
                <Input
                    name="launch_date"
                    type='date' 
                    placeholder='Select Date'
                    value = {form.launch_date}
                    onChange={handleChange}
                    />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Select
                    name="country"
                    placeholder='Select Location'
                    onChange={handleChange}
                    value={form.country}
                >
                {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                    {c.name}
                    </option>
                ))}
                </Select>
            </FormControl>
            <FormControl>
                <FormLabel fontWeight="normal" color="gray">
                    # Students currently enrolled
                </FormLabel>
                <NumberInput 
                    width="30%" 
                    value={enrollmentNumber ?? ""} 
                    onChange={(value) => setEnrollmentNumber(value ? parseInt(value) : null)}
                >
                    <NumberInputField bg="gray.100"></NumberInputField>
                </NumberInput>
            </FormControl>
            <FormControl >
                <FormLabel fontWeight="normal" color="gray">
                    # Students graduated
                </FormLabel>
                <NumberInput 
                    width="30%" 
                    value={graduatedNumber ?? ""} 
                    onChange={(value) => setGraduatedNumber(value ? parseInt(value) : null)}
                >
                    <NumberInputField bg="gray.100"></NumberInputField>
                </NumberInput>
            </FormControl>
             <FormControl>
                <FormLabel>Instruments & Quantity</FormLabel>
                {!isAddingInstrument && <Button onClick={() => setIsAddingInstrument(true)}>+ Add</Button>}
                {isAddingInstrument && 
                <HStack>
                    <Select
                        name="instrument"
                        placeholder='Select Instrument'
                        onChange={(e) => {
                            setSelectedInstrument(e.target.value);
                            setNewInstrumentName("");
                        }}
                        value={selectedInstrument}
                    >
                    {instruments.map(instrument => (
                        <option key={instrument.id} value={instrument.name}>
                            {instrument.name}
                        </option>
                    ))}
                    </Select>
                    <Input
                        placeholder="Or type a new instrument"
                        value={newInstrumentName}
                        onChange={(e) => {
                            setNewInstrumentName(e.target.value);
                            setSelectedInstrument("");
                        }}
                    />
                    <NumberInput
                        value={quantity}
                        min={0}
                        onChange={(_, valueAsNumber) => {
                        setQuantity(valueAsNumber || 0);
                    }}
                    >
                        <NumberInputField/>
                        <NumberInputStepper>
                            <NumberIncrementStepper/>
                            <NumberDecrementStepper/>
                        </NumberInputStepper>
                    </NumberInput>
                    <Button
                        onClick={ () => {
                             handleAddInstrumentAndQuantity();
                            setIsAddingInstrument(false);
                        }}
                    >
                    + Add
                    </Button>
                </HStack>               
                }
            </FormControl>
            {
                Object.keys(addedInstruments).length > 0 && (
                    <HStack width="100%" flexWrap="wrap" spacing={2}>
                        {Object.entries(addedInstruments).map(([name, quantity]) => (
                            <Tag key={name} size="lg" bg="gray.200">
                                <TagLabel>{name} - {quantity}</TagLabel>
                                <TagCloseButton onClick={() => removeInstrument(name)} />
                            </Tag>
                        ))}
                    </HStack>
                )
            }
            <FormControl>
                <FormLabel>Primary Language</FormLabel>
                <HStack>
                    <Input 
                        name="primary_language"
                        placeholder='Language'
                        value = {form.primary_language}
                        onChange={handleChange}
                    />
                </HStack>               
            </FormControl>
            <FormControl>
                <FormLabel>Regional Director(s)</FormLabel>
                {!isAddingRegionalDirector && <Button onClick={() => setIsAddingRegionalDirector(true)}>+ Add</Button>}
                {isAddingRegionalDirector && 
                <HStack>
                    <Select
                        name="regional_director"
                        placeholder='Select Regional Director(s)'
                        onChange={(e) => setSelectedRegionalDirector(e.target.value)}
                        value={selectedRegionalDirector}
                    >
                    {regionalDirectors.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                        </option>
                    ))}
                    </Select>
                    <Button 
                            onClick={ () => {
                            handleAddRegionalDirector();
                            setIsAddingRegionalDirector(false);
                    }}>
                    + Add
                    </Button>
                </HStack>               
                }
            </FormControl>
            {
                Object.keys(regionalDirectors).length > 0 && (
                    <HStack width="100%" flexWrap="wrap" spacing={2}>
                        {Object.entries(addedRegionalDirectors).map(([id, name]) => (
                        <Tag key={id} size="lg" bg="gray.200">
                            <TagLabel>{name}</TagLabel>
                            <TagCloseButton onClick={() => removeRegionalDirector(id)} />
                        </Tag>
                        ))}
                    </HStack>
                )
            }
            <Divider w="110%"></Divider>
            <HStack w="100%">
                <Button>Delete</Button>
                <Spacer/>
                <Button>Cancel</Button>
                <Button onClick = {handleSubmit}>Save Changes</Button>
            </HStack>
        </VStack>
        
    );
};
