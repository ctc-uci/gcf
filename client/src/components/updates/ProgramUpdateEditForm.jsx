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
  Spacer
} from "@chakra-ui/react";

import { useState, useEffect } from "react";


/*import {
    AddIcon
} from "@chakra-ui/icons";*/

export const ProgramUpdateEditForm = ( {programUpdateId} ) => {
    console.log(programUpdateId)

    const [isAddingInstrument, setIsAddingInstrument] = useState(false)
    const [isAddingLanguage, setIsAddingLanguage] = useState(false)
    const [isAddingRegionalDirector, setIsAddingRegionalDirector] = useState(false)

    const [countries, setCountries] = useState([])

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
        const program_data = async () => {
            const programUpdate = await fetch(
                    `http://localhost:3001/program-updates/${programUpdateId}`
                ).then((r) => r.json());
            console.log(programUpdate)
            const program_id = programUpdate.programId; 

            if (!program_id) {
                console.log("No programid found on program update");
                return;
            }


            const [
                programResult,
                countryResult,
                programUpdateResult,
            ] = await Promise.all([
                fetch(`http://localhost:3001/program/${program_id}`).then(r => r.json()),
                fetch(`http://localhost:3001/country`).then(r => r.json()),
            ]);

            setForm({
                id: programResult.id ?? "",
                created_by: programResult.createdBy ?? "",
                program_name: programResult.name ?? "",
                date_created: programResult.dateCreated
                ? programResult.dateCreated.slice(0, 10)
                : "",
                country: programResult.country ?? "",
                title: programResult.title ?? "",
                description: programResult.description ?? "",
                primary_language: programResult.primaryLanguage ?? "",
                playlist_link: "",
                partner_org: programResult.partnerOrg ?? "",
                program_status: programResult.status ?? "",
                launch_date: programResult.launchDate
                ? programResult.launchDate.slice(0, 10)
                : "",
                note: programUpdateResult ?? "",
                countries: countryResult ?? ""
            });

            setCountries(countryResult);

            console.log("meow");
        };
        program_data();
    }, [programUpdateId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
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
                    name="program_launch_date"
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
                    <Input placeholder="Instrument" />
                    <NumberInput>
                        <NumberInputField/>
                        <NumberInputStepper>
                            <NumberIncrementStepper/>
                            <NumberDecrementStepper/>
                        </NumberInputStepper>
                    </NumberInput>
                    <Button onClick={() => setIsAddingInstrument(false)}>
                    + Add
                    </Button>
                </HStack>               
                }
            </FormControl>
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
