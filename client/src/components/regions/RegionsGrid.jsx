import { useEffect, useState } from "react";
import { RegionCard } from "@/components/regions/RegionCard";
import RegionsForm from "@/components/regions/RegionsForm";

import { 
    Box, 
    SimpleGrid,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerCloseButton,
    DrawerBody,
    Button,
} from '@chakra-ui/react'

import { useBackendContext } from "@/contexts/hooks/useBackendContext";

export const RegionsGrid = ({ onNewRegion }) => {
    const { backend } = useBackendContext();
    const [regions, setRegions] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

    const handleSave = () => {
        // TODO: save logic
        setIsDrawerOpen(false);
    };

    const handleDelete = () => {
        // TODO: delete logic
        setIsDrawerOpen(false);
    };

    return (
        <Box>
            <Button colorScheme="teal" mb={4} onClick={() => setIsDrawerOpen(true)}>
                New Region
            </Button>

            <SimpleGrid 
                columns={{ base: 1, md: 2, lg: 4 }}
                spacing={10}
            >
                {regions.map((region) => (
                    <RegionCard
                        key={region.id}
                        region={region}
                        onEdit={onNewRegion}
                    />
                ))}
            </SimpleGrid>

            <Drawer
                isOpen={isDrawerOpen}
                placement="right"
                onClose={() => setIsDrawerOpen(false)}
                size="md"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>New Region</DrawerHeader>
                    <DrawerBody>
                        <RegionsForm
                            onClose={() => setIsDrawerOpen(false)}
                            onSave={handleSave}
                            onDelete={handleDelete}
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
}