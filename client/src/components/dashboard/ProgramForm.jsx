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
import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { MediaUploadModal } from "../media/MediaUploadModal";


// sub-component for adding instruments
const InstrumentForm = ({ setFormData }) => {
    const [instruments, setInstruments] = useState([]);
    const [quantity, setQuantity] = useState(0);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState('');
    const { backend } = useBackendContext();

    function handleSubmit() {
        if (!selectedInstrumentId || quantity === 0) return;

        const instrumentObj = instruments.find(
            (instrument) => String(instrument.id) === String(selectedInstrumentId)
        );
        if (!instrumentObj) return;

        setFormData((prevData) => ({
            ...prevData,
            instruments: {
                ...prevData.instruments,
                [selectedInstrumentId]: {
                    id: Number(selectedInstrumentId),
                    name: instrumentObj.name,
                    quantity,
                },
            },
        }));

        setSelectedInstrumentId('');
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
                value={selectedInstrumentId}
                onChange={(e) => setSelectedInstrumentId(e.target.value)}
            >
                {instruments.map((instrument) => (
                    <option key={instrument.id} value={instrument.id}>
                        {instrument.name}
                    </option>
                ))}
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

const ProgramDirectorForm = ({ formState, setFormData }) => {
    const [programDirectors, setProgramDirectors] = useState([]);
    const [selectedDirector, setSelectedDirector] = useState('');
    const { backend } = useBackendContext();

    useEffect(() => {
        async function fetchProgramDirectors() {
            const response = await backend.get("/program-directors/program-director-names");
            const directors = response.data;

            //avoid dup key error
            const uniqueDirectors = Array.from(
                new Map((directors || []).map((d) => [d.userId, d])).values()
            );

            setProgramDirectors(uniqueDirectors);
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
                value={selectedDirector}
                onChange={(e) => setSelectedDirector(e.target.value)}
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

const CurriculumLinkForm = ({ formState, setFormData }) => {
    const [link, setLink] = useState('');
    const [display, setDisplay] = useState('');

    function handleSubmit() {
        if (!link?.trim()) return;

        let validLink = link.trim();
        if (!validLink.startsWith('http://') && !validLink.startsWith('https://')) {
            validLink = 'https://' + validLink;
        }

        const alreadyAdded = (formState.curriculumLinks ?? []).some(
            (p) => p.link === validLink
        );
        if (alreadyAdded) return;

        setFormData((prevData) => ({
            ...prevData,
            curriculumLinks: [
                ...(prevData.curriculumLinks ?? []),
                { link: validLink, name: (display || 'Playlist').trim() || 'Playlist' }
            ]
        }));

        setLink('');
        setDisplay('');
    }

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
            <Button onClick={handleSubmit}>+ Add</Button>
        </HStack>
    )
}

const MediaUploadForm = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    // TODO: preview media uploads on the form
    return (
        <>
            <Button onClick={onOpen}> + Add </Button>
            <MediaUploadModal
                isOpen={isOpen}
                onClose={onClose}
                onUploadComplete={() => {
                }}
                formOrigin={"program"}
            />
        </>
    )
}

export const ProgramForm = ({ isOpen: isOpenProp, onOpen: onOpenProp, onClose: onCloseProp, program }) => {
    const disclosure = useDisclosure();

    const isControlled = onOpenProp !== undefined && onCloseProp !== undefined;
    const isOpen = isControlled ? isOpenProp : disclosure.isOpen;
    const onClose = isControlled ? onCloseProp : disclosure.onClose;
    const btnRef = useRef(null);
    const { backend } = useBackendContext();
    const [regions, setRegions] = useState([]);
    const [countries, setCountries] = useState([]);
    const { currentUser } = useAuthContext();

    const [initialProgramDirectorIds, setInitialProgramDirectorIds] = useState([]);
    const [initialInstrumentQuantities, setInitialInstrumentQuantities] = useState({});
    const [initialCurriculumLinks, setInitialCurriculumLinks] = useState([]);


    const [formState, setFormState] = useState({
        status: null,
        programName: null,
        launchDate: null,
        regionId: null,
        country: null,
        students: 0,
        instruments: {
        },
        language: null,
        programDirectors: [],
        curriculumLinks: [],
        media: []
    });

    useEffect(() => {

        async function loadProgramRegionData() {
            if (!program) {
                setFormState({
                    status: null,
                    programName: null,
                    launchDate: null,
                    regionId: null,
                    country: null,
                    students: 0,
                    instruments: {},
                    language: null,
                    programDirectors: [],
                    curriculumLinks: [],
                    media: []
                });
                setInitialProgramDirectorIds([]);
                setInitialInstrumentQuantities({});
                setInitialCurriculumLinks([]);
                return;
            }

            let regionId = null;

            if (program.country) {
                try {
                    const countryResponse = await backend(`/country/${program.country}`);
                    regionId = countryResponse.data.regionId;
                } catch (error) {
                    console.error("error fetching country/region", error);
                }
            }

            const mappedProgramDirectors = (program.programDirectors ?? []).map(d => ({
                userId: d.userId ?? d.id ?? d.user_id,
                firstName: d.firstName,
                lastName: d.lastName,
            }));

            const instrumentMap = {};
            const initialInstrumentMap = {};
            try {
                const instrumentsResponse = await backend.get(`/program/${program.id}/instruments`);
                const instruments = instrumentsResponse.data || [];
                instruments.forEach((inst) => {
                    const id = inst.instrumentId ?? inst.id;
                    if (!id) return;
                    instrumentMap[id] = {
                        id,
                        name: inst.name,
                        quantity: inst.quantity ?? 0,
                    };
                    initialInstrumentMap[id] = inst.quantity ?? 0;
                });
            } catch (err) {
                console.error("Error fetching program instruments:", err);
            }

            setFormState({
                status: program.status ?? null,
                programName: program.title ?? '',
                launchDate: program.launchDate ? program.launchDate.split('T')[0] : '',
                regionId: regionId,
                country: program.country ?? null,
                students: program.students ?? 0,
                instruments: instrumentMap,
                language: program.primaryLanguage?.toLowerCase() ?? null,


                programDirectors: mappedProgramDirectors,

                curriculumLinks: Array.isArray(program.playlists)
                    ? program.playlists
                        .filter((p) => p.link)
                        .map((p) => ({ link: p.link, name: p.name || 'Playlist' }))
                    : [],
                media: program.media ?? []
            });
            setInitialProgramDirectorIds(
                mappedProgramDirectors.map(d => d.userId).filter(Boolean)
            );
            setInitialInstrumentQuantities(initialInstrumentMap);
            setInitialCurriculumLinks(
                (program.playlists ?? []).filter((p) => p.link).map((p) => p.link)
            );
            regionId = null;

        }
        loadProgramRegionData();

    }, [program, backend])

    function handleProgramStatusChange(status) {
        setFormState({ ...formState, status: status });
    }

    function handleProgramNameChange(name) {
        setFormState({ ...formState, programName: name });
    }

    function handleProgramLaunchDateChange(date) {
        setFormState({ ...formState, launchDate: date });
    }

    function handleRegionChange(regionId) {
        setFormState({ ...formState, regionId: Number(regionId), country: null });
    }

    function handleCountryChange(countryId) {
        setFormState({ ...formState, country: Number(countryId) });
    }

    function handleStudentNumberChange(numStudents) {
        setFormState({ ...formState, students: numStudents })
    }

    function handleLanguageChange(langChange) {
        setFormState({ ...formState, language: langChange })
    }
    async function handleSave() {
        //[TODO] : TOTAL INSTRUMENTS, INSTRUMENTS, PARTNERORG
        try {
            const data = {
                name: formState.programName,
                title: formState.programName,
                status: formState.status,
                launchDate: formState.launchDate,
                country: formState.country,
                students: formState.students ?? 0,
                primaryLanguage: formState.language,
                partnerOrg: 1, // TODO: this field doesnt exist in the form
                createdBy: currentUser?.uid || currentUser?.id,
                description: '', // TODO: this field doesnt exist in the form
            };

            let programId;
            const oldStudentCount = program?.students || 0;


            if (program) {
                await backend.put(`/program/${program.id}`, data);
                programId = program.id
            } else {
                const response = await backend.post(`/program`, data);
                programId = response.data.id

            }


            if (formState.programDirectors.length > 0) {
                for (const director of formState.programDirectors) {
                    if (
                        director.userId &&
                        !initialProgramDirectorIds.includes(director.userId)
                    ) {
                        await backend.post(`/program-directors`, {
                            userId: director.userId,
                            programId
                        });
                    }
                }
            }

            //curriclum links / playlists
            const currentLinks = (formState.curriculumLinks ?? []).map((p) => p.link);
            for (const playlist of formState.curriculumLinks ?? []) {
                if (!initialCurriculumLinks.includes(playlist.link)) {
                    await backend.post(`/program/${programId}/playlists`, {
                        link: playlist.link,
                        name: playlist.name || 'Playlist'
                    });
                }
            }
            for (const oldLink of initialCurriculumLinks) {
                if (!currentLinks.includes(oldLink)) {
                    await backend.delete(`/program/${programId}/playlists`, {
                        data: { link: oldLink }
                    });
                }
            }

            const studentCountChange = formState.students - oldStudentCount;


            const instrumentChanges = [];
            const allInstrumentIds = new Set([
                ...Object.keys(initialInstrumentQuantities || {}),
                ...Object.keys(formState.instruments || {}),
            ]);

            for (const id of allInstrumentIds) {
                const newQty = formState.instruments?.[id]?.quantity ?? 0;
                const oldQty = initialInstrumentQuantities?.[id] ?? 0;
                const instrumentDiff = newQty - oldQty;
                if (instrumentDiff !== 0) {
                    instrumentChanges.push({
                        instrumentId: Number(id),
                        amountChanged: instrumentDiff,
                    });
                }
            }

            const hasStudentChange = studentCountChange !== 0;
            const hasInstrumentChange = instrumentChanges.length > 0;

            if (hasStudentChange || hasInstrumentChange) {
                const updateResponse = await backend.post(`/program-updates`, {
                    title: 'update program stats',
                    program_id: programId,
                    created_by: currentUser?.uid || currentUser?.id,
                    update_date: new Date().toISOString(),
                    note: 'Program update',
                });

                const updateId = updateResponse.data.id;

                if (hasStudentChange) {
                    await backend.post(`/enrollmentChange`, {
                        update_id: updateId,
                        enrollment_change: studentCountChange,
                        graduated_change: 0
                    });
                }

                if (hasInstrumentChange) {
                    for (const instrumentChange of instrumentChanges) {
                        await backend.post(`/instrument-changes`, {
                            instrumentId: instrumentChange.instrumentId,
                            updateId,
                            amountChanged: instrumentChange.amountChanged,
                        });
                    }
                }
            }

            onClose();
            window.location.reload();
        } catch (err) {
            console.error("Error saving program:", err);
        }
    }

    useEffect(() => {
        console.log("Program status changed to:", formState);
    }, [formState])

    useEffect(() => {
        async function getRegions() {
            try {
                const response = await backend.get("/region");
                setRegions(response.data);
            } catch (error) {
                console.error("Error fetching regions:", error);
            }
        }
        getRegions();
    }, [formState.regionId, backend]);

    useEffect(() => {
        async function getCountriesForRegion() {
            if (!formState.regionId) {
                setCountries([]);
                return;
            }

            try {
                const response = await backend.get(`/region/${formState.regionId}/countries`);
                setCountries(response.data);
            } catch (error) {
                console.error("Error fetching countries:", error);
                setCountries([]);
            }
        }
        getCountriesForRegion();
    }, [formState.regionId, backend]);
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
                        <DrawerCloseButton left="4" right="auto" />
                        <Button colorScheme="teal" marginLeft="auto" marginRight="2em" width="5em" height="2em" top="2" fontSize="small" onClick={handleSave}> Save </Button>
                    </HStack>

                    <DrawerBody>
                        <VStack spacing={4} align="stretch" marginLeft="1em">
                            <DrawerHeader padding="0 0">
                                Program
                            </DrawerHeader>
                            <h3>Status</h3>
                            <HStack>
                                {/* changed developing => inactive, launched => active to match the enum values in the database schema for program */}
                                <Button onClick={() => handleProgramStatusChange("Inactive")} colorScheme={formState.status === "Inactive" ? "teal" : undefined}>Developing</Button>
                                <Button onClick={() => handleProgramStatusChange("Active")} colorScheme={formState.status === "Active" ? "teal" : undefined}>Launched</Button>
                            </HStack>
                            <h3>Program Name</h3>
                            <Input placeholder="Enter Program Name" value={formState.programName || ''} onChange={(e) => handleProgramNameChange(e.target.value)} />
                            <h3>Launch Date</h3>
                            <Input type="date" placeholder="MM/DD/YYYY" value={formState.launchDate || ''} onChange={(e) => handleProgramLaunchDateChange(e.target.value)} />
                            <h3>Region</h3>
                            <Select
                                placeholder='Select region'
                                value={formState.regionId || ''}
                                onChange={(e) => handleRegionChange(e.target.value)}
                            >
                                {regions.map((region) => (
                                    <option key={region.id} value={region.id}>{region.name}</option>
                                ))}
                            </Select>
                            {formState.regionId && (
                                <>
                                    <h3>Country</h3>
                                    <Select
                                        placeholder='Select Country'
                                        value={formState.country || ''}
                                        onChange={(e) => handleCountryChange(e.target.value)}
                                    >
                                        {countries.map((country) => (
                                            <option key={country.id} value={country.id}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </Select>
                                </>
                            )}
                            <h3>Students</h3>
                            <NumberInput min={0} value={formState.students} onChange={(e) => handleStudentNumberChange(Number(e))}>
                                <NumberInputField placeholder="Enter # of Students" />
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

                                {Object.entries(formState.instruments || {}).map(
                                    ([instrumentId, instrumentData]) => (
                                        <Tag key={instrumentId}>
                                            <TagLabel>
                                                {instrumentData.name}: {instrumentData.quantity}
                                            </TagLabel>
                                            <TagCloseButton
                                                onClick={() => {
                                                    setFormState((prevData) => {
                                                        const {
                                                            [instrumentId]: _,
                                                            ...remainingInstruments
                                                        } = prevData.instruments;
                                                        return {
                                                            ...prevData,
                                                            instruments: remainingInstruments,
                                                        };
                                                    });
                                                }}
                                            />
                                        </Tag>
                                    )
                                )}
                            </HStack>
                            <h3>Language</h3>
                            <Select
                                placeholder="Language"
                                value={formState.language || ''}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                            >
                                {/* TODO: Language DB Table */}
                                <option value="english">English</option>
                                <option value="spanish">Spanish</option>
                                <option value="french">French</option>
                                <option value="arabic">Arabic</option>
                                <option value="mandarin">Mandarin</option>
                            </Select>
                            <h3>Program Directors</h3>
                            <HStack wrap="wrap">
                                <ProgramDirectorForm formState={formState} setFormData={setFormState} />
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
                            <CurriculumLinkForm formState={formState} setFormData={setFormState} />
                            <HStack wrap="wrap">
                                {(formState.curriculumLinks ?? []).map((playlist) => (
                                    <Tag key={playlist.link}>
                                        <TagLabel
                                            cursor="pointer"
                                            onClick={() => {
                                                window.open(playlist.link, '_blank', 'noopener,noreferrer');
                                            }}
                                        >
                                            {playlist.name}
                                        </TagLabel>
                                        <TagCloseButton
                                            onClick={() => {
                                                setFormState((prev) => ({
                                                    ...prev,
                                                    curriculumLinks: prev.curriculumLinks.filter(
                                                        (p) => p.link !== playlist.link
                                                    )
                                                }));
                                            }}
                                        />
                                    </Tag>
                                ))}
                            </HStack>
                            {/* TODO: Add media input */}
                            <h4>Media</h4>
                            <MediaUploadForm />

                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
};


