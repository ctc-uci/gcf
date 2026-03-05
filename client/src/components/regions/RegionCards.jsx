import { useEffect, useState } from "react";

import { 
    Box,
    Card, 
    CardHeader, 
    CardBody, 
    CardFooter,
    SimpleGrid,
    VStack
} from '@chakra-ui/react'

import { useAuthContext } from "@/contexts/hooks/useAuthContext";import { useBackendContext } from "@/contexts/hooks/useBackendContext";

function RegionCards = () {
    const { currentUser } = useAuthContext();
    const userID = currentUser.uid;
    const { backend } = useBackendContext();

    const [regions, setRegions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await backend.get(`/region/`);
                const regionsList = Array.isArray(res.data) ? res.data : [];
                setRegions(regionsList);
            } catch (err) {
                console.error("Error fetching regions:", err);
            }
        };

    fetchData();
    }, [backend]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await backend.get(`/regionalDirector/`); // TODO: make new route to fetch regional director based on region
                const regionalDirector = Array.isArray(res.data) ? res.data : [];
                setRegionalDirector(regionalDirector);
            } catch (err) {
                console.error("Error fetching regional director:", err);
            }
        };

    fetchData();
    }, [backend]);

    return (
        <Box>
            <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={4}
            >
            {regions.map((region, index) => {
                return (
                    <Card>
                        <CardHeader> Placeholder Region </CardHeader>
                        <CardBody> 
                            <VStack>
                                Placeholder for All Programs in Region 
                            </VStack>
                        </CardBody>
                    </Card>
                );
            })}
            </SimpleGrid>
        </Box>
    );
}