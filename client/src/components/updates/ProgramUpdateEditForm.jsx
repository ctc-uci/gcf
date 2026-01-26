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
    const [isAddingInstrument, setIsAddingInstrument] = useState(false)
    const [isAddingLanguage, setIsAddingLanguage] = useState(false)
    const [isAddingRegionalDirector, setIsAddingRegionalDirector] = useState(false)
    const [instruments, setInstruments] = useState([])
    const [countries, setCountries] = useState([])
    const [selectedInstrument, setSelectedInstrument] = useState('')
    const [quantity, setQuantity] = useState(0)
    const [addedInstruments, setAddedInstruments] = useState({})
    const [newInstrumentName, setNewInstrumentName] = useState('')


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
        let programUpdateResponse, programResponse, countryResponse, instrumentResponse, instrumentChangeResponse;
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
            console.log(program_id)

            // fetching programs, countries, instruments
            try {
                [programResponse, countryResponse, instrumentResponse, instrumentChangeResponse] = await Promise.all([
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
                    })
                ]);
            }
            catch (error){
                console.error('Error fetching countries/program/instruments/instrument_change: ', error)
                return;
            }
            console.log(instrumentChangeResponse);

            // need to get instrument changes with the update id
            // maybe should create route for selecting by update_id?
            const filteredInstrumentChange = instrumentChangeResponse.filter(
                (row) => row.updateId === programUpdateId
            );

            console.log(filteredInstrumentChange)
            const match = new Map(instrumentResponse.map((i) => [i.id, i.name]));
            console.log(match)
            const existingInstruments = {};

            for (const row of filteredInstrumentChange) {
                const name = match.get(row.instrumentId);
                console.log(name)
                // if there is a duplicate just add it on top otherwise make it
                existingInstruments[name] = (existingInstruments[name] ?? 0) + row.amountChanged;
            }
            console.log(existingInstruments)
            setAddedInstruments(existingInstruments);

            setForm({
                id: programResponse.id ?? "",
                created_by: programResponse.createdBy ?? "",
                program_name: programResponse.name ?? "",
                date_created: programResponse.dateCreated
                ? programResponse.dateCreated.slice(0, 10)
                : "",
                country: programResponse.country ?? "",
                title: programResponse.title ?? "",
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

            setCountries(countryResponse);
            setInstruments(instrumentResponse)
        };
        program_data();
    }, [programUpdateId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const addInstrument = async () => {
        const name = newInstrumentName.trim()
        if (!newInstrumentName.trim() || quantity <= 0) {
            return;
        }
        // might want to check if instrument alr exists before adding
        try {
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
        } catch (error) {
            console.error('Error adding instrument:', error);
        }
    };

    const handleAddInstrumentAndQuantity = async () => {
        const instrumentName = selectedInstrument || newInstrumentName.trim();

        if (newInstrumentName) {
            const added = await addInstrument();
        }
        setAddedInstruments(prev => ({
            ...prev,
            [instrumentName] : quantity
        }));
        setSelectedInstrument("");
        setNewInstrumentName("");
        setQuantity(0);
    }


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
                <FormLabel size='sm'>Program Name</FormLabel>
                <Input 
                    name="program_name"
                    placeholder='Program Name'
                    value = {form.program_name}
                    onChange={handleChange}
                />
            </FormControl>
            <FormControl>
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
            <FormControl>
                <FormLabel>Launch Date</FormLabel>
                <Input
                    name="launch_date"
                    type='date' 
                    placeholder='Select Date'
                    value = {form.launch_date}
                    onChange={handleChange}
                    />
            </FormControl>
            <FormControl>
                <FormLabel>Location</FormLabel>
                <Select
                    name="country"
                    placeholder='Select Location'
                    onChange={handleChange}
                    value={form.country}
                >
                {countries.map((c) => (
                    <option key={c.id} value={c.name}>
                    {c.name}
                    </option>
                ))}
                </Select>
            </FormControl>
            <FormControl>
                <FormLabel>Students</FormLabel>
                <NumberInput
                    value={form.students}
                    onChange={(new_students) =>
                        setForm((prev) => ({ ...prev, students: new_students}))
                    }    
                >
                    <NumberInputField/>
                    <NumberInputStepper>
                        <NumberIncrementStepper/>
                        <NumberDecrementStepper/>
                    </NumberInputStepper>
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
                        onChange={(value) => setQuantity(parseInt(value) || 0)}>
                        <NumberInputField/>
                        <NumberInputStepper>
                            <NumberIncrementStepper/>
                            <NumberDecrementStepper/>
                        </NumberInputStepper>
                    </NumberInput>
                    <Button
                        onClick={async () => {
                            await handleAddInstrumentAndQuantity();
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
                <FormLabel>Languages</FormLabel>
                {!isAddingLanguage && <Button onClick={() => setIsAddingLanguage(true)}>+ Add</Button>}
                {isAddingLanguage && 
                <HStack>
                    <Input placeholder="Language" />
                    <Button onClick={() => setIsAddingLanguage(false)}>
                    + Add
                    </Button>
                </HStack>               
                }
            </FormControl>
            <FormControl>
                <FormLabel>Regional Director(s)</FormLabel>
                {!isAddingRegionalDirector && <Button onClick={() => setIsAddingRegionalDirector(true)}>+ Add</Button>}
                {isAddingRegionalDirector && 
                <HStack>
                    <Input placeholder="Regional Director Name" />
                    <Button onClick={() => isAddingRegionalDirector(false)}>
                    + Add
                    </Button>
                </HStack>               
                }
            </FormControl>
            <Divider w="110%"></Divider>
            <HStack w="100%">
                <Button>Delete</Button>
                <Spacer/>
                <Button>Cancel</Button>
                <Button>Save Changes</Button>
            </HStack>
        </VStack>
        
    );
};
