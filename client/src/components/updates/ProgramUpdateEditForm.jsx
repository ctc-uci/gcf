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
        launch_date: ""
    });

    useEffect(() => {
        if (!programUpdateId) {
            console.log("woof")
            return;
        }
        const program_data = async () => {
            const result = await fetch (
                `http://localhost:3001/program-updates/${programUpdateId}`
            );
            const data = await result.json();

            console.log(data);
            console.log("meow");
        };
        program_data();
    }, [programUpdateId]);

    return (
        <VStack p={8} width='35%' borderWidth="1px" borderColor="lightblue">
            <Heading size="md" textAlign="center">Program</Heading>
            <Divider w="110%" mb={4}></Divider>
            <Card bg='gray.100'>
                <CardHeader pt={6} pb={0}>
                    <Heading size="sm">Update Notes</Heading>
                </CardHeader>
                <CardBody py={1}>
                    <Text>
                        Instrument number went down due to damage, waiting on replacement strings. Recruited John Doe as a program director as they've been getting more involved. Student number updated from 100 to 120.
                    </Text>
                </CardBody>
            </Card>
            <FormControl isRequired>
                <FormLabel size='sm'>Program Name</FormLabel>
                <Input placeholder='Program Name'/>
            </FormControl>
            <FormControl>
                <FormLabel>Status</FormLabel>
                <Select placeholder='Select Option'/>
            </FormControl>
            <FormControl>
                <FormLabel>Launch Date</FormLabel>
                <Input type='date' placeholder='Select Date'/>
            </FormControl>
            <FormControl>
                <FormLabel>Location</FormLabel>
                <Select placeholder='Select Location'/>
            </FormControl>
            <FormControl>
                <FormLabel>Students</FormLabel>
                <NumberInput>
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
