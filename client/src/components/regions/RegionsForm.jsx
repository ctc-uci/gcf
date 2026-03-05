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
} from '@chakra-ui/react'

// TODO: add delete button, add save/cancel buttons, add expand button, delete and cancel buttons should pop up confirmation dialog

const RegionsForm = () => {
    const { backend } = useBackendContext();
    const [regionalDirectors, setRegionalDirectors] = useState([]);

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

    console.log("Regional Directors:", regionalDirectors);

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
                <Button> +Add</Button>
            </FormControl>
        </VStack>
    );
}

export default RegionsForm;