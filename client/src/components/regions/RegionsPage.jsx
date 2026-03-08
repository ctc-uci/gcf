import RegionsForm from "@/components/regions/RegionsForm";
import { RegionsGrid } from "@/components/regions/RegionsGrid";

import {
    Text,
    Box,
    Button,
    Flex
} from "@chakra-ui/react";

import { useState } from "react";

export const RegionsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    return (
        <Box>
            <Flex
            align="center"
            justify="space-between"
            mb={4}
            mt={4}
            >
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
                onClick={() => setIsDrawerOpen(true)}
            >
                + New Region
            </Button>
            </Flex>

            <RegionsGrid onNewRegion={() => {setIsDrawerOpen(true);}} />
            <RegionsForm 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
                onSave={() => setIsDrawerOpen(false)} 
            />
        </Box>
    );
}

// export default RegionsPage;