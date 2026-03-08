import { useState, useEffect, useRef } from "react";
import { useBackendContext } from '@/contexts/hooks/useBackendContext'

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import {
    VStack,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Select,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Portal,
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
} from '@chakra-ui/react'

const RegionsForm = ({ isOpen, onClose, onSave, onDelete }) => {
    const { backend } = useBackendContext();
    const [regionalDirectors, setRegionalDirectors] = useState([]);
    const [countries, setCountries] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

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

    // useEffect to fetch countries; TODO: switch to use library
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

    const handleSelect = (country) => {
        if (!selectedCountries.includes(country)) {
            setSelectedCountries([...selectedCountries, country]);
        }
    };

    const handleRemove = (country) => {
        setSelectedCountries(selectedCountries.filter(c => c !== country));
    };

    return (
        <VStack spacing={4}>
            <FormControl isRequired>
                <FormLabel>Region Name</FormLabel>
                <input type='text' placeholder="Enter region name" />
                <FormErrorMessage>Error: Region name is required.</FormErrorMessage>
            </FormControl>

            <FormControl>
                <FormLabel>Regional Director</FormLabel>
                <Select placeholder="Region Name" width="20%">
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
                    <Portal>
                        <MenuList>
                            {countries?.map((country) => (
                                <MenuItem key={country.id} value={country.id} onClick={() => handleSelect(country.name)}>
                                    {country.name}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Portal>
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
                    <Button colorScheme="teal" onClick={onSave}>
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
                            <Button colorScheme="red" onClick={() => { onDelete(); setIsDeleteDialogOpen(false); }} ml={3}>
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
                            <Button onClick={() => { onSave(); setIsCancelDialogOpen(false); }}>
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
    );
}

export default RegionsForm;