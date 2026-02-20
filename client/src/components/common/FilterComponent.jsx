import {VStack, Text, HStack} from "@chakra-ui/react";

function FilterComponent({columns}) {
    console.log(columns);
    return (
        <VStack alignItems="flex-start">
            <Text>In this view, show records</Text>
            <HStack>
                <Text>Where</Text>
                <Text>Add form inputs here using map prolly</Text>
            </HStack>
        </VStack>
    );
}

export { FilterComponent };