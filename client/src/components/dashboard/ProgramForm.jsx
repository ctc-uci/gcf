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
  TagCloseButton
} from '@chakra-ui/react'
import { useRef, useState, useEffect } from 'react'
import { useBackendContext } from '@/contexts/hooks/useBackendContext' 


// sub-component for adding instruments
const InstrumentForm = ( { setFormData }) => {
    const [instruments, setInstruments] = useState([]);
    const [quantity, setQuantity] = useState(0);
    const [selectedInstrument, setSelectedInstrument] = useState('');
    const { backend } = useBackendContext();

    function handleSubmit() {
        if (!selectedInstrument || quantity === 0) return;

        setFormData((prevData) => ({
            ...prevData,
            instruments: {
                ...prevData.instruments,
                [selectedInstrument]: quantity,
            }
        }));

        setSelectedInstrument('');
        setQuantity(0);
    }

    useEffect(() => {
        async function fetchInstruments() {
            try {
                const response = await backend.get('/instruments')
                const instrument_names = response.data;
                
                const instrumentMap = new Map();
                instrument_names.forEach((instrument) => {
                    if (!instrumentMap.has(instrument.name)) {
                        instrumentMap.set(instrument.name, instrument)
                    }
                });
                const unique_instruments = Array.from(instrumentMap.values());
                setInstruments(unique_instruments);
            }
            catch (error) {
                console.error("Error fetching instruments:", error);
            }
        }
        fetchInstruments();
    }, [backend]);

    return (
       <HStack border="1px" borderColor="gray.200" padding="1" borderRadius="md" spacing={2}>
            <Select
                placeholder="Select Instrument" 
                value={selectedInstrument} 
                onChange={(e) => setSelectedInstrument(e.target.value)}
            >
                {instruments.map((instrument) => {
                    return <option key = {instrument.id} value = {instrument.name}>{instrument.name}</option>
                })} 
                
            </Select>
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

const ProgramDirectorForm = ( { formState, setFormData }) => {

    const [programDirectors, setProgramDirectors] = useState([]);
    const [selectedDirector, setSelectedDirector] = useState('');

    const { backend }  = useBackendContext();

    useEffect(() => {
        async function fetchProgramDirectors() {
            const response = await backend.get("/program-directors/program-director-names");
            const directors = response.data;
            setProgramDirectors(directors);
        }
        // fetch all program directors from db
        fetchProgramDirectors();
        
    }, [backend]);



    function handleSubmit() {
        if (!selectedDirector) return;

        const alreadyAdded = formState.programDirectors.find((d) => d.userId === selectedDirector);
        if (alreadyAdded) {
            alert("This director has already been added!");
            return;
        } 

        const directorObj = programDirectors.find((d) => d.userId === selectedDirector);
        if (!directorObj) return;

        setFormData((prevData) => ({
            ...prevData,
            programDirectors: [...prevData.programDirectors, directorObj],
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
                        <option value={director.userId} key={director.userId}>{director.firstName} {director.lastName}</option>
                    ))
                }
            </Select>

            <Button onClick={handleSubmit}> + Add </Button>
        </HStack>
    )
}

// sub-component for adding curriculum links

const CurriculumLinkForm = ( { setFormData } ) => {
    const [link, setLink] = useState(null);
    const [display, setDisplay] = useState(null);

    function handleSubmit() {
        if (!link || !display) return;

        let validLink = link
        if (!link.startsWith('http://') && !link.startsWith('https://')) {
            validLink = 'https://' + link;
        }
        setFormData((prevData) => ({
            ...prevData, 
            curriculumLinks: {
                ...prevData.curriculumLinks,
                [validLink]: display 
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


export const ProgramForm = ({ isOpen: isOpenProp, onOpen: onOpenProp, onClose: onCloseProp, program}) => {
    const disclosure = useDisclosure();
    const isControlled = onOpenProp !== undefined && onCloseProp !== undefined;
    const isOpen = isControlled ? isOpenProp : disclosure.isOpen;
    const onClose = isControlled ? onCloseProp : disclosure.onClose;
    const btnRef = useRef(null);
    const { backend } = useBackendContext();
    const [regions, setRegions] = useState([]);
    const [formState, setFormState] = useState({
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
        },
        media: []
    });

    useEffect(() => {
        if (program) {
            setFormState({
                status: program.status ?? null,
                programName: program.title ?? '',
                launchDate: program.launchDate ?? '',
                region: program.location ?? '',
                students: program.students ?? 0,
                instruments: program.instruments ?? {},
                language: program.primaryLanguage ?? null,
                programDirectors: program.programDirectors ?? [],
                curriculumLinks: {},
                media: program.media ?? []
            });
        }
    }, [program])

    function handleProgramStatusChange(status) {
        setFormState({ ...formState, status: status});
    }

    function handleProgramNameChange(name) {
        setFormState({ ...formState, programName: name });
    }

    function handleProgramLaunchDateChange(date) {
        setFormState({...formState, launchDate: date});
    }

    function handleRegionChange(regionChange) {
        setFormState({...formState, region: regionChange});
    }

    function handleStudentNumberChange(numStudents) {
        setFormState({...formState, students: numStudents})
    }
    
    function handleLanguageChange(langChange) {
        setFormState({...formState, language: langChange})
    }

    async function handleSave() {
        try {
            const data = {
                id: formState.id,
                title: formState.title ?? formState.name,
                status: formState.status,
                launchDate: formState.launchDate,
                location: formState.countryName ?? "",
                students: formState.students ?? 0,
                instruments: formState.instruments ?? 0,
                totalInstruments: formState.instruments ?? 0,
                playlists: Object.entries(formState.curriculumLinks || {}).map(([link, display]) => ({
                    link, display
                })),
                primaryLanguage: formState.primaryLanguage,
                programDirectors: Array.isArray(formState.programDirectors)
        ? formState.programDirectors.map((d) => d.userId ?? d) : [],
                media: formState.media || []
            };

            if (program) {
                await backend.put(`/program/${program.id}`, data);
            } else {
                await backend.post(`/program`, data);
            }

            onClose();
        } catch (err) {
            console.error("Error saving program:", err);
        }
    }
    

    // debug log to see how state changes as we edit the form
    useEffect(() => {
        console.log("Program status changed to:", formState);
    }, [formState])

    useEffect(() => {
        async function getRegions() {
            try {
                const response = await backend.get("/region");
                const region_list = response.data.map((region) => region.name);
                const filtered_list = [... new Set(region_list)];
                setRegions(filtered_list);
            } catch (error) {
                console.error("Error fetching regions:", error);
            }
        }
        getRegions();
    }, [backend, setRegions]);

    return (
        <>
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
                        <Input placeholder = "Enter Program Name" value={formState.programName || ''} onChange={(e) => handleProgramNameChange(e.target.value)}/>
                        <h3>Launch Date</h3>
                        <Input type = "date" placeholder = "MM/DD/YYYY" value={formState.launchDate || ''} onChange={(e) => handleProgramLaunchDateChange(e.target.value)} />
                        <h3>Region</h3>
                        <Select 
                            placeholder='Select region'
                            value = {formState.region || ''}
                            onChange={(e) => handleRegionChange(e.target.value)}
                        >
                            {regions.map((region) => (
                                <option key = {region} value ={region}>{region}</option>
                            ))}
                        </Select>
                        <h3>Students</h3>
                        <NumberInput min = {0} value={formState.students} onChange={(e) => handleStudentNumberChange(Number(e))}>
                            <NumberInputField placeholder = "Enter # of Students"/>
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                        
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
                            <ProgramDirectorForm formState = {formState} setFormData={setFormState}/>
                            {formState.programDirectors.map((director) => (
                                <Tag key={director.userId}> 
                                    <TagLabel>{`${director.firstName} ${director.lastName}`}</TagLabel>
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
                                    <TagLabel 
                                        cursor="pointer" 
                                        onClick={() => {
                                            window.open(link, '_blank', 'noopener,noreferrer');
                                        }}
                                    >
                                        {display}
                                    </TagLabel>
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
                        {/* TODO: Add media input */}
                    </VStack>
                </DrawerBody>
            </DrawerContent>
            </Drawer>
        </>
    )
};


