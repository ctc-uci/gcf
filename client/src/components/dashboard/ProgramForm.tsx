import {
  Drawer,
  DrawerBody,
//   DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
  VStack,
  HStack,
  Input,
  Select,
  Tag,
  TagLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
//   TagLeftIcon,
//   TagRightIcon,
  TagCloseButton,
//   Input,
} from '@chakra-ui/react'
import { useRef, useState, useEffect } from 'react'

interface ProgramFormState {
    status: "Developing" | "Launched" | null,
    programName: string | null,
    launchDate: string | null,
    region: string | null,
    students: number,
    instruments: {
        [key: string]: number,
    },
    language: string | null,
    programDirectors: string[],
    curriculumLinks: string[],
    media: string[],
}

interface InstrumentFormProps {
    setFormData: React.Dispatch<React.SetStateAction<ProgramFormState>>;
}
const InstrumentForm = ( { setFormData } : InstrumentFormProps ) => {
    const [instrumentName, setInstrumentName] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(0);

    function handleSubmit() {
        setFormData((prevData: ProgramFormState) => ({
            ...prevData,
            instruments: {
                ...prevData.instruments,
                [instrumentName as string]: quantity,
            }
        }));
    }


    return (
        <HStack border="1px" borderColor="gray.200" padding="1" borderRadius="md" spacing={2}>
            <Input placeholder = "Search" value={instrumentName || ''} onChange={(e) => setInstrumentName(e.target.value)} />
            <NumberInput step={1} defaultValue={0} min={0} width="8em" value={quantity} onChange={(valueString) => setQuantity(Number(valueString))}>
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>

            <Button onClick={handleSubmit}> + Add </Button>
        </HStack>
    )
}

const ProgramDirectorForm = () => {

    // const [programDirectors, setProgramDirectors] = useState<string[]>([]);

    useEffect(() => {
        async function fetchProgramDirectors() {
            const directors = await fetch("http://localhost:3001/api/program-directors");
            console.log("directors from db:", directors);
        }
        // fetch all program directors from db
        fetchProgramDirectors();
        
    }, []);



    // function handleSubmit() {
    //     setFormData((prevData: ProgramFormState) => ({
    //         ...prevData,
    //         programDirectors: [...prevData.programDirectors, 
    //             // add new director here
    //         ],
    //     }));
    // }


    return (

        <>
        </>

        // <HStack border="1px" borderColor="gray.200" padding="1" borderRadius="md" spacing={2}>
        //     <Input placeholder = "Search" value={instrumentName || ''} onChange={(e) => setInstrumentName(e.target.value)} />
        //     <NumberInput step={1} defaultValue={0} min={0} width="8em" value={quantity} onChange={(valueString) => setQuantity(Number(valueString))}>
        //         <NumberInputField />
        //         <NumberInputStepper>
        //             <NumberIncrementStepper />
        //             <NumberDecrementStepper />
        //         </NumberInputStepper>
        //     </NumberInput>

        //     <Button onClick={handleSubmit}> + Add </Button>
        // </HStack>
    )
}

export const ProgramForm = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = useRef<HTMLButtonElement>(null);

    const [formState, setFormState] = useState<ProgramFormState>({
        status: null,
        programName: null,
        launchDate: null,
        region: null,
        students: 0,
        instruments: {
            guitar: 10,
            ukelele: 5,
         },
        language: null,
        programDirectors: [],
        curriculumLinks: [],
        media: []
    });

    function handleProgramStatusChange(status: string) {
        setFormState({ ...formState, status: status as "Developing" | "Launched" });
    }

    function handleProgramNameChange(name: string) {
        setFormState({ ...formState, programName: name });
    }

    function handleProgramLaunchDateChange(date: string) {
        setFormState({...formState, launchDate: date});
    }

    function handleRegionChange(regionChange: string) {
        setFormState({...formState, region: regionChange});
    }

    function handleStudentNumberChange(numStudents: number) {
        setFormState({...formState, students: numStudents})
    }
    
    function handleLanguageChange(langChange: string) {
        setFormState({...formState, language: langChange})
    }
    

    useEffect(() => {
        console.log("Program status changed to:", formState);
    }, [formState])




    return (
        <>

            <Button ref={btnRef} colorScheme='teal' onClick={onOpen}>
            Open
            </Button>
            <Drawer
                isOpen={isOpen}
                placement='right'
                onClose={onClose}
                finalFocusRef={btnRef}
                size="lg"

                // width={"40%"}
            >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Program</DrawerHeader>

                <DrawerBody>
                    <VStack spacing={4} align="stretch">
                        <h3>Status</h3>
                        <HStack>
                            <Button onClick={() => handleProgramStatusChange("Developing")}>Developing</Button>
                            <Button onClick={() => handleProgramStatusChange("Launched")}>Launched</Button>
                        </HStack> 
                        <h3>Program Name</h3>
                        <Input placeholder = "Enter Program Name: " onChange={(e) => handleProgramNameChange(e.target.value)}/>
                        <h3>Launch Date</h3>
                        <Input placeholder = "MM/DD/YYYY" onChange={(e) => handleProgramLaunchDateChange(e.target.value)} />
                        <h3>Region</h3>
                        <Select 
                            placeholder='Select region'
                            value = {formState.region || ''}
                            onChange={(e) => handleRegionChange(e.target.value)}
                        > 
                            {/* hardcoded for now but can make a DB call to fetch later */}
                            <option value='north-america'>North America</option>
                            <option value='south-america'>South America</option>
                            <option value='central-america'>Central America</option>
                            <option value='europe'>Europe</option>
                            <option value='asia'>Asia</option>
                            <option value='africa'>Africa</option>
                            <option value='middle-east'>Middle East</option>
                            <option value='australia'>Australia</option>
                        </Select>
                        <h3>Students</h3>
                        <Input placeholder = "Enter # of Students: " onChange={(e) => handleStudentNumberChange(Number(e.target.value))}/>
                        
                        <h3> Instrument(s) & Quantity </h3>
                        <HStack wrap="wrap">

                            <InstrumentForm setFormData={setFormState} />

                            {/* <HStack border="1px" borderColor="gray.200" padding="1" borderRadius="md" spacing={2}>
                                <Input placeholder = "Search" />
                                <NumberInput step={1} defaultValue={0} min={0} width="8em">
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>

                                <Button> + Add </Button>

                            </HStack> */}



                            {
                                Object.keys(formState.instruments).map((instrument) => (
                                    <>
                                        <Tag> 
                                            <TagLabel>{instrument}: {formState.instruments[instrument]}</TagLabel>
                                            <TagCloseButton />
                                        </Tag>
                                    </>
                                ))
                              
                            }



                        </HStack>
                        <h3>Language</h3>
                        <Select 
                            placeholder = "Language"
                            value = {formState.language || ''}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                            <option value = "english">English</option>
                            <option value = "spanish">Spanish</option>
                            <option value = "french">French</option>
                            <option value = "arabic">Arabic</option>
                            <option value = "mandarin">Mandarin</option>
                        </Select>

                        <ProgramDirectorForm />

                    </VStack>
                
                




                </DrawerBody>
{/* 
                <DrawerFooter>
                <Button variant='outline' mr={3} onClick={onClose}>
                    Cancel
                </Button>
                <Button colorScheme='blue'>Save</Button>
                </DrawerFooter> */}
            </DrawerContent>
            </Drawer>
        </>
    )
};



