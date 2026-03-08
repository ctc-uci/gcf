import { useEffect, useState } from "react";
import { RegionCard } from "@/components/regions/RegionCard";

import { 
    Box, 
    SimpleGrid,
} from '@chakra-ui/react'

import { useBackendContext } from "@/contexts/hooks/useBackendContext";

export const RegionsGrid = ({ onEditRegion }) => {
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

    return (
        <Box>
            <SimpleGrid 
                columns={{ base: 1, md: 2, lg: 4 }}
                spacing={10}
            >
                {regions.map((region) => (
                    <RegionCard
                        key={region.id}
                        region={region}
                        onEdit={(region, regionalDirector) => onEditRegion(region, regionalDirector)}
                    />
                ))}
            </SimpleGrid>
        </Box>
    );
}