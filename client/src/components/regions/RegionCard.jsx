import {
    HStack,
    Box,
    Card,
    CardHeader,
    CardBody,
    Text,
    Icon,
    Button,
} from '@chakra-ui/react'

import { GrEdit } from "react-icons/gr";
import { MdAccountCircle } from "react-icons/md";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useEffect, useState } from "react";

export const RegionCard = ({ region, onEdit }) => {
    const { backend } = useBackendContext();
    const [regionalDirector, setRegionalDirector] = useState(null);
    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await backend.get(`/regional-directors/region/${region.id}/`);
                const regionalDirector = res.data ? res.data : null;
                setRegionalDirector(regionalDirector);
            } catch (err) {
                console.error("Error fetching regional director:", err);
            }
        };

    fetchData();
    }, [region.id, backend]);

    useEffect(() => {
        if (!regionalDirector?.userId) return;
        const fetchData = async () => {
            try {
                const res = await backend.get(`/regional-directors/${regionalDirector?.userId}/programs`);
                const programs = res.data ? res.data : [];
                setPrograms(programs);
            } catch (err) {
                console.error("Error fetching programs:", err);
            }
        };

    fetchData();
    }, [regionalDirector?.userId, backend]);

    return (
        <Card 
            h="100%" 
            display="flex" 
            flexDirection="column"
            role="group"
            position="relative"
            _hover={{shadow: "md"}}
        >
            <CardHeader 
                fontSize="lg" 
                fontWeight="semibold"
                mb ="-3"
            >
                {region.name}
            </CardHeader>
            <CardBody mt = "-4">
                <Text 
                    fontSize="xs" 
                    mb="2"
                    fontWeight="semibold"
                    color="gray.500"
                >
                    Regional Director
                </Text>
                <HStack ml="2">
                    <Icon as={MdAccountCircle} mb="1" boxSize={5} color="gray.600"/>
                    <Text mb="2">
                        {regionalDirector ? `${regionalDirector.firstName} ${regionalDirector.lastName}` : "N/A"}
                    </Text>
                </HStack>
                <Text 
                    fontSize="xs"
                    fontWeight="semibold"
                    color="gray.500"
                >
                    Assigned Programs
                </Text>
                <Box 
                    overflowY="auto" 
                    h="200px"
                    sx={{
                        scrollbarWidth: "none",  
                        msOverflowStyle: "none", 
                        "&::-webkit-scrollbar": {
                        display: "none"      
                        }}}
                >
                    {programs.length === 0 ? (
                    <Text>No programs assigned</Text>
                    ) : (
                    programs.map((program) => (
                        <Text key={program.id}>
                        {program.name}
                        </Text>
                    ))
                    )}
                </Box>
            </CardBody>
            <Button
                leftIcon={<GrEdit />}
                position="absolute"
                top="8px"
                right="8px"
                opacity={0}
                _hover={{
                        color: "white",
                        bg: "teal.500"}}
                _groupHover={{ opacity: 1 }}
                onClick={onEdit}
                color="teal.500"
                bg="white"
                border="2px solid"
                borderColor="teal.500" 
            > 
                Edit 
            </Button>
        </Card>
    );
}