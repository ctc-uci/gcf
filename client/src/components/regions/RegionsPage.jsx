import { RegionsGrid } from "@/components/regions/RegionsGrid";
import RegionsForm from "@/components/regions/RegionsForm";

import {
    Text,
    Box,
    Button,
    Flex,
} from "@chakra-ui/react";

import { useState } from "react";

export const RegionsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null);

    const handleEditRegion = (region) => {
        setSelectedRegion(region);
        setIsDrawerOpen(true);
    };

    const handleNewRegion = () => {
        setSelectedRegion(null);
        setIsDrawerOpen(true);
    };

    return (
        <Box>
            <Flex align="center" justify="space-between" mb={4} mt={4}>
                <Text fontSize="2xl" fontWeight="semibold">
                    Regions
                </Text>
                <Button 
                    size="sm"
                    color="white"
                    bg="teal.500"
                    _hover={{
                        color: "teal.500",
                        bg: "white",
                        border: "2px solid",
                        borderColor: "teal.500"
                    }}
                    onClick={handleNewRegion}
                >
                    + New Region
                </Button>

            </Flex>

            <RegionsGrid onEditRegion={handleEditRegion} />

            <RegionsForm
                isOpen={isDrawerOpen}
                region={selectedRegion}
                onClose={() => setIsDrawerOpen(false)}
                onSave={() => setIsDrawerOpen(false)}
                onDelete={() => setIsDrawerOpen(false)}
            />
        </Box>
    );
}