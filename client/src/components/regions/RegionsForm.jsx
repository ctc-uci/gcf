import { useState, useEffect } from "react";
import { useBackendContext } from '@/contexts/hooks/useBackendContext'

import {
  GetCountries
} from "react-country-state-city";

import { BsArrowsAngleContract } from "react-icons/bs";
import { BsArrowsAngleExpand } from "react-icons/bs";

import {
    VStack,
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerHeader,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Select,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Flex,
    Tag,
    TagLabel,
    TagCloseButton,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useToast,
    Input,
} from '@chakra-ui/react'

const RegionsForm = ({ isOpen, region, onClose, onSave, onDelete }) => {
    const { backend } = useBackendContext();
    const [regionalDirectors, setRegionalDirectors] = useState([]);
    const [countries, setCountries] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedDirector, setSelectedDirector] = useState("");
    const [originalDirectorId, setOriginalDirectorId] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [drawerSize, setDrawerSize] = useState("md");
    const [regionName, setRegionName] = useState("");
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchRegionalDirectors = async () => {
            try {
                const res = await backend.get('/regional-directors/all');
                const directorsList = Array.isArray(res.data) ? res.data : [];
                setRegionalDirectors(directorsList);
            }
            catch (err) {
                console.error("Error fetching regional directors:", err);
            }
        }
        fetchRegionalDirectors();
    }, [backend]);

    useEffect(() => {
        GetCountries().then((result) => {
            setCountries(result);
        });
    }, []);
    useEffect(() => {
        if (region) {
            setRegionName(region.name || "");

            const fetchRegionDirector = async () => {
                try {
                    const res = await backend.get(`/regional-directors/region/${region.id}/`);
                    if (res.data) {
                        const match = regionalDirectors.find(d => d.id === res.data.userId);
                        const directorId = match?.id?.toString() ?? "";
                        setSelectedDirector(directorId);
                        setOriginalDirectorId(directorId);
                    } else {
                        setSelectedDirector("");
                        setOriginalDirectorId("");
                    }
                } catch (err) {
                    console.error("Error fetching region director:", err);
                    setSelectedDirector("");
                    setOriginalDirectorId("");
                }
            };
            fetchRegionDirector();

            const fetchRegionCountries = async () => {
                try {
                    const res = await backend.get(`/region/${region.id}/countries`);
                    const regionCountries = Array.isArray(res.data) ? res.data : [];

                    const mapped = regionCountries
                        .map(rc => countries.find(c => c.name === rc.name))
                        .filter(Boolean);

                    setSelectedCountries(mapped);
                } catch (err) {
                    console.error("Error fetching region countries:", err);
                }
            };
            fetchRegionCountries();

        } else {
            setRegionName("");
            setSelectedDirector("");
            setOriginalDirectorId("");
            setSelectedCountries([]);
        }
    }, [countries, region, regionalDirectors, backend]);

    const handleSelect = (country) => {
        if (!selectedCountries.some(c => c.iso2 === country.iso2)) {
            setSelectedCountries(prev => [...prev, country]);
        }
    };

    const handleRemove = (iso2) => {
        setSelectedCountries(prev =>
            prev.filter(c => c.iso2 !== iso2)
        );
    };

    const saveRegion = async () => {
        if (region) {
            await backend.put(`/region/${region.id}`, {
                name: regionName,
                last_modified: new Date().toISOString()
            });

            if (selectedDirector !== originalDirectorId) {
                if (originalDirectorId) {
                    await backend.delete(`/regional-directors/${originalDirectorId}/region/${region.id}`);
                }
                if (selectedDirector) {
                    await backend.put(`/regional-directors/${selectedDirector}/region`, {
                        region_id: region.id
                    });
                }
            }

            const existingRes = await backend.get(`/region/${region.id}/countries`);
            const existingCountries = Array.isArray(existingRes.data) ? existingRes.data : [];
            const existingNames = existingCountries.map(c => c.name);

            const newCountries = selectedCountries.filter(
                c => !existingNames.includes(c.name)
            );            
            
            console.log("Sending country:", {
                region_id: region?.id,
                name: newCountries[0].name,
                iso_code: newCountries[0].iso2
            });
            await Promise.all(
                newCountries.map(country =>
                    backend.post('/country', {
                        region_id: region.id,
                        name: country.name,
                        iso_code: country.iso2,
                        last_modified: new Date().toISOString()
                    })
                )
            );
        } else {
            const newRegion = await backend.post('/region', {
                name: regionName,
                last_modified: new Date().toISOString()
            });
            const newRegionId = newRegion.data.id;

            if (selectedDirector) {
                await backend.put(`/regional-directors/${selectedDirector}/region`, {
                    region_id: newRegionId
                });
            }

            await Promise.all(
                selectedCountries.map(country =>
                    backend.post('/country', {
                        region_id: newRegionId,
                        name: country.name,
                        iso_code: country.iso2,
                        last_modified: new Date().toISOString()
                    })
                )
            );
        }
    };
    return (
        <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            size={drawerSize}
        >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader display="flex" alignItems="center" gap={2} pr={10}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDrawerSize(drawerSize === "md" ? "full" : "md")}
                    >
                        {drawerSize === "md" ? <BsArrowsAngleExpand /> : <BsArrowsAngleContract />}
                    </Button>
                    {region ? "Edit Region" : "New Region"}
                </DrawerHeader>
                <DrawerBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Region Name</FormLabel>
                            <input
                                type='text'
                                placeholder="Enter region name"
                                value={regionName}
                                onChange={(e) => setRegionName(e.target.value)}
                            />
                            <FormErrorMessage>Error: Region name is required.</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Regional Director</FormLabel>
                            <Select
                                placeholder="Select a director"
                                value={selectedDirector}
                                onChange={(e) => setSelectedDirector(e.target.value)}
                            >
                                {regionalDirectors?.map((director) => (
                                    <option key={director.id} value={director.id}>
                                        {director.firstName} {director.lastName}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Assigned Countries</FormLabel>
                            <Flex wrap="wrap" gap={2} mb={2}>
                                {selectedCountries.map((country) => (
                                    <Tag key={country.iso2} variant="solid" colorScheme="gray">
                                        <TagLabel>{country.name}</TagLabel>
                                        <TagCloseButton onClick={() => handleRemove(country.iso2)} />
                                    </Tag>
                                ))}
                            </Flex>
                            <Menu>
                                <MenuButton as={Button} variant="outline" size="sm">
                                    + Add
                                </MenuButton>
                                <MenuList maxH="300px" overflowY="auto">
                                    <Input
                                        placeholder="Search countries..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        mx={2}
                                        width="90%"
                                        mb={2}
                                    />
                                    {filteredCountries?.map((country) => (
                                        <MenuItem key={country.id} value={country.id} onClick={() => handleSelect(country)}>
                                            {country.name}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </Menu>
                        </FormControl>

                        <Flex width="100%" justifyContent="space-between" mt={4}>
                            <Button colorScheme="red" variant="ghost" onClick={() => setIsDeleteDialogOpen(true)}>
                                Delete
                            </Button>
                            <Flex gap={2}>
                                <Button variant="outline" onClick={() => setIsCancelDialogOpen(true)}>
                                    Cancel
                                </Button>
                                <Button colorScheme="teal" onClick={async () => {
                                    try {
                                        await saveRegion();
                                        toast({
                                            title: "Successfully saved region",
                                            status: "success",
                                            duration: 5000,
                                            isClosable: true,
                                        });
                                        onSave();
                                    } catch (err) {
                                        console.error("Error saving region:", err);
                                    }
                                }}>
                                    Save
                                </Button>
                            </Flex>
                        </Flex>

                        <AlertDialog
                            isOpen={isDeleteDialogOpen}
                            onClose={() => setIsDeleteDialogOpen(false)}
                        >
                            <AlertDialogOverlay>
                                <AlertDialogContent>
                                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                        Delete Region
                                    </AlertDialogHeader>
                                    <AlertDialogBody>
                                        Are you sure you want to delete this region?
                                    </AlertDialogBody>
                                    <AlertDialogFooter>
                                        <Button onClick={() => setIsDeleteDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button 
                                            colorScheme="red" 
                                            onClick={async () => {
                                                try {
                                                    await backend.delete(`/region/${region.id}`);
                                                    toast({
                                                        title: "Region successfully deleted",
                                                        status: "success",
                                                        duration: 5000,
                                                        isClosable: true,
                                                    });
                                                    onDelete();
                                                    setIsDeleteDialogOpen(false);
                                                } catch (err) {
                                                    console.error("Error deleting region:", err);
                                                }
                                            }} 
                                            ml={3}
                                        >
                                            Delete
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialogOverlay>
                        </AlertDialog>

                        <AlertDialog
                            isOpen={isCancelDialogOpen}
                            onClose={() => setIsCancelDialogOpen(false)}
                        >
                            <AlertDialogOverlay>
                                <AlertDialogContent>
                                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                        Unsaved Changes
                                    </AlertDialogHeader>
                                    <AlertDialogBody>
                                        Are you sure you want to exit? You have unsaved changes.
                                    </AlertDialogBody>
                                    <AlertDialogFooter>
                                        <Button onClick={async () => {
                                            try {
                                                await saveRegion();
                                                toast({
                                                    title: "Successfully saved region",
                                                    status: "success",
                                                    duration: 5000,
                                                    isClosable: true,
                                                });
                                                onSave();
                                                setIsCancelDialogOpen(false);
                                            } catch (err) {
                                                console.error("Error saving region:", err);
                                            }
                                        }}>
                                            Save & Exit
                                        </Button>
                                        <Button colorScheme="red" onClick={() => { onClose(); setIsCancelDialogOpen(false); }} ml={3}>
                                            Exit Without Saving
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialogOverlay>
                        </AlertDialog>
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
}

export default RegionsForm;