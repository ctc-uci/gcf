import { useState, useEffect } from "react";
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
    Portal
} from '@chakra-ui/react'

// TODO: add delete button, add save/cancel buttons, add expand button, delete and cancel buttons should pop up confirmation dialog

const RegionsForm = ({ isOpen, onClose, onSave }) => {
    const { backend } = useBackendContext();
    const [regionalDirectors, setRegionalDirectors] = useState([]);
    const [countries, setCountries] = useState([]);

    // useEffect to get list of all regional directors for dropdown
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

    // useEffect to get list of all countries for dropdown
    // TODO: instead of fetching country name, fetch ISO codes once new column is added, then use ISO codes to get names through library
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await backend.get('/country');
                const countriesList = Array.isArray(res.data) ? res.data : [];
                setCountries(countriesList);
                console.log("Fetched countries:", countriesList);
            }  
            catch (err) {
                console.error("Error fetching countries:", err);
            }
        }
        fetchCountries();
    }, [backend]);

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
                <Menu>
                    <MenuButton as={Button} variant="outline" size="sm">
                        + Add
                    </MenuButton>
                    <Portal>
                        <MenuList>
                            {countries?.map((country) => (
                                <MenuItem key={country.id} value={country.id}>
                                    {country.name}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Portal>
                </Menu>
            </FormControl>
        </VStack>
    );
}

export default RegionsForm;