import {
  Drawer,
  DrawerBody,
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
  TagCloseButton,
} from '@chakra-ui/react'
import { useRef, useState, useEffect } from 'react'
import { useBackendContext } from '@/contexts/hooks/useBackendContext' 

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
    curriculumLinks: {
        [key: string]: string
    }
    media: string[],
}

// sub-component for adding instruments
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

        setInstrumentName(null);
        setQuantity(0);
    }

    return (
       <HStack border="1px" borderColor="gray.200" padding="1" borderRadius="md" spacing={2}>
            <Input 
                placeholder="Search" 
                value={instrumentName || ''} 
                onChange={(e) => setInstrumentName(e.target.value)} 
            />
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
            <Button onClick={handleSubmit}> + Add </Button>
        </HStack>
    )
}
// sub-component for adding program directors
interface ProgramDirectorForm {
    setFormData: React.Dispatch<React.SetStateAction<ProgramFormState>>;
}

const ProgramDirectorForm = ( { setFormData } : ProgramDirectorForm ) => {

    const [programDirectors, setProgramDirectors] = useState<string[]>([]);
    const [selectedDirector, setSelectedDirector] = useState<string>('');

    const { backend }  = useBackendContext();

    useEffect(() => {
        async function fetchProgramDirectors() {
            const response = await backend.get("/program-directors");
            const directors = response.data;
            // filter for userId only
            setProgramDirectors(directors.map((director: { userId: string, programId: string}) => director.userId));
        }
        // fetch all program directors from db
        fetchProgramDirectors();
        
    }, [backend]);



    function handleSubmit() {
        if (!selectedDirector) return;
        
        setFormData((prevData: ProgramFormState) => ({
            ...prevData,
            programDirectors: [...prevData.programDirectors, selectedDirector],
        }));

         setSelectedDirector('');
    }


    return (
        <HStack border="1px" borderColor="gray.200" padding="1" borderRadius="md" spacing={2}>
            <Select 
                placeholder="Select Program Director"
                value = {selectedDirector}
                onChange = {(e) => setSelectedDirector(e.target.value)}
            >
                {
                    (programDirectors).map((director) => (
                        <option value={director} key={director}>{director}</option>
                    ))
                }
            </Select>

            <Button onClick={handleSubmit}> + Add </Button>
        </HStack>
    )
}

// sub-component for adding curriculum links
interface CurriculumLinkFormProps {
    setFormData: React.Dispatch<React.SetStateAction<ProgramFormState>>;
}

const CurriculumLinkForm = ( { setFormData } : CurriculumLinkFormProps ) => {
    const [link, setLink] = useState<string | null>(null);
    const [display, setDisplay] = useState<string | null>(null);

    function handleSubmit() {
        if (!link || !display) return;
        setFormData((prevData: ProgramFormState) => ({
            ...prevData, 
            curriculumLinks: {
                ...prevData.curriculumLinks,
                [link as string]: display as string
            }
        }));

        setLink(null);
        setDisplay(null);
    };
    
         
    return (
        <HStack border="1px" borderColor="gray.200" padding="1" borderRadius="md" spacing={2}>
            <Input 
                placeholder="Link" 
                value={link || ''} 
                onChange={(e) => setLink(e.target.value)} 
            />

            <Input 
                placeholder="Display Name" 
                value={display || ''} 
                onChange={(e) => setDisplay(e.target.value)} 
            />

            <Button onClick={handleSubmit}> + Add </Button>
        </HStack>
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
         },
        language: null,
        programDirectors: [],
        curriculumLinks: {
            "https://youtube.com": "YouTube Link",
        },
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

    function handleSave() {
        // implement save functionality later
        onClose();
    }
    

    // debug log to see how state changes as we edit the form
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
            >
            <DrawerOverlay />
            <DrawerContent>
                <HStack marginBottom="1em">
                    <DrawerCloseButton left="4" right="auto"/>
                    <Button colorScheme="teal" marginLeft="auto" marginRight="2em" width="5em" height="2em" top="2" fontSize="small" onClick={handleSave}> Save </Button>
                </HStack>
                
                <DrawerBody>
                    <VStack spacing={4} align="stretch" marginLeft="1em">
                        <DrawerHeader padding="0 0">
                            Program
                        </DrawerHeader>
                        <h3>Status</h3>
                        <HStack>
                            <Button onClick={() => handleProgramStatusChange("Developing")} colorScheme={formState.status === "Developing" ? "teal" : undefined}>Developing</Button>
                            <Button onClick={() => handleProgramStatusChange("Launched")} colorScheme={formState.status === "Launched" ? "teal" : undefined}>Launched</Button>
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

                            <InstrumentForm 
                                setFormData={setFormState} 
                            />

                            {Object.keys(formState.instruments).map((instrument) => (
                                <Tag key={instrument}> 
                                    <TagLabel>{instrument}: {formState.instruments[instrument]}</TagLabel>
                                    <TagCloseButton onClick={() => {
                                        setFormState((prevData) => {
                                            const { [instrument]: _, ...remainingInstruments } = prevData.instruments;
                                            return { ...prevData, instruments: remainingInstruments };
                                        });
                                    }} />
                                </Tag>
                            ))}
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
                        <h3>Program Directors</h3>
                        <HStack wrap = "wrap">
                            <ProgramDirectorForm setFormData={setFormState}/>
                            {formState.programDirectors.map((director) => (
                                <Tag key={director}> 
                                    <TagLabel>{director}</TagLabel>
                                    <TagCloseButton onClick={() => {
                                        setFormState((prevData) => ({
                                            ...prevData,
                                            programDirectors: prevData.programDirectors.filter(d => d !== director)
                                        }));
                                    }} />
                                </Tag>
                            ))}
                        </HStack>

                        <h3>Curriculum Links</h3>   
                        <CurriculumLinkForm setFormData={setFormState} />

                        <HStack wrap="wrap">
                            {Object.entries(formState.curriculumLinks).map(([link, display]) => (
                                <Tag key={link}>
                                    <TagLabel>{display}</TagLabel>
                                    <TagCloseButton onClick={() => {
                                        setFormState((prevData) => {
                                            const { [link]: _, ...remainingLinks } = prevData.curriculumLinks;
                                            return {
                                                ...prevData,
                                                curriculumLinks: remainingLinks
                                            };
                                        });
                                    }} />
                                </Tag>
                            ))}
                        </HStack>
                    </VStack>
                </DrawerBody>
            </DrawerContent>
            </Drawer>
        </>
    )
};



