import { useState, useEffect } from "react";
import { useBackendContext } from '@/contexts/hooks/useBackendContext'

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
} from '@chakra-ui/react'

const RegionsForm = ({ isOpen, region, onClose, onSave, onDelete }) => {
    const { backend } = useBackendContext();
    const [regionalDirectors, setRegionalDirectors] = useState([]);
    const [countries, setCountries] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedDirector, setSelectedDirector] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [drawerSize, setDrawerSize] = useState("md");
    const [regionName, setRegionName] = useState("");
    const toast = useToast();

    // useEffect to fetch names of all regional directors for dropdown
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

    // useEffect to fetch countries
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await backend.get('/country');
                const countriesList = Array.isArray(res.data) ? res.data : [];
                setCountries(countriesList);
            }  
            catch (err) {
                console.error("Error fetching countries:", err);
            }
        }
        fetchCountries();
    }, [backend]);

    // useEffect to pre-fill the region information when using the Edit button
    useEffect(() => {
        if (region) {
            setRegionName(region.name || "");
            const match = regionalDirectors.find(
                d => d.firstName === region.regionalDirector?.firstName &&
                    d.lastName === region.regionalDirector?.lastName
            );
            setSelectedDirector(match?.id?.toString() ?? "");

            // fetch and set existing countries for this region
            const fetchRegionCountries = async () => {
                try {
                    const res = await backend.get(`/region/${region.id}/countries`);
                    const regionCountries = Array.isArray(res.data) ? res.data : [];
                    setSelectedCountries(regionCountries.map(c => c.name));
                } catch (err) {
                    console.error("Error fetching region countries:", err);
                    setSelectedCountries([]);
                }
            };
            fetchRegionCountries();

        } else {
            setRegionName("");
            setSelectedDirector("");
            setSelectedCountries([]);
        }
    }, [region, regionalDirectors]);

    const handleSelect = (country) => {
        if (!selectedCountries.includes(country)) {
            setSelectedCountries([...selectedCountries, country]);
        }
    };

    const handleRemove = (country) => {
        setSelectedCountries(selectedCountries.filter(c => c !== country));
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
                        {drawerSize === "md" ? "⤢" : "⤡"}
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
                                    <Tag key={country} variant="solid" colorScheme="gray">
                                        <TagLabel>{country}</TagLabel>
                                        <TagCloseButton onClick={() => handleRemove(country)} />
                                    </Tag>
                                ))}
                            </Flex>
                            <Menu>
                                <MenuButton as={Button} variant="outline" size="sm">
                                    + Add
                                </MenuButton>
                                <MenuList>
                                    {countries?.map((country) => (
                                        <MenuItem key={country.id} value={country.id} onClick={() => handleSelect(country.name)}>
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
                                        if (region) {
                                            await backend.put(`/region/${region.id}`, {
                                                name: regionName,
                                                last_modified: new Date().toISOString()
                                            });

                                            const existingRes = await backend.get(`/region/${region.id}/countries`);
                                            const existingCountries = Array.isArray(existingRes.data) ? existingRes.data : [];
                                            const existingNames = existingCountries.map(c => c.name);

                                            const newCountries = selectedCountries.filter(name => !existingNames.includes(name));
                                            await Promise.all(newCountries.map((countryName) =>
                                                backend.post('/country', {
                                                    region_id: region.id,
                                                    name: countryName,
                                                    last_modified: new Date().toISOString()
                                                })
                                            ));
                                        } else {
                                            const newRegion = await backend.post('/region', {
                                                name: regionName,
                                                last_modified: new Date().toISOString()
                                            });
                                            const newRegionId = newRegion.data.id;

                                            await Promise.all(selectedCountries.map((countryName) =>
                                                backend.post('/country', {
                                                    region_id: newRegionId,
                                                    name: countryName,
                                                    last_modified: new Date().toISOString()
                                                })
                                            ));
                                        }
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
                                                if (region) {
                                                    await backend.put(`/region/${region.id}`, {
                                                        name: regionName,
                                                        last_modified: new Date().toISOString()
                                                    });

                                                    const existingRes = await backend.get(`/region/${region.id}/countries`);
                                                    const existingCountries = Array.isArray(existingRes.data) ? existingRes.data : [];
                                                    const existingNames = existingCountries.map(c => c.name);

                                                    const newCountries = selectedCountries.filter(name => !existingNames.includes(name));
                                                    await Promise.all(newCountries.map((countryName) =>
                                                        backend.post('/country', {
                                                            region_id: region.id,
                                                            name: countryName,
                                                            last_modified: new Date().toISOString()
                                                        })
                                                    ));
                                                } else {
                                                    const newRegion = await backend.post('/region', {
                                                        name: regionName,
                                                        last_modified: new Date().toISOString()
                                                    });
                                                    const newRegionId = newRegion.data.id;

                                                    await Promise.all(selectedCountries.map((countryName) =>
                                                        backend.post('/country', {
                                                            region_id: newRegionId,
                                                            name: countryName,
                                                            last_modified: new Date().toISOString()
                                                        })
                                                    ));
                                                }
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