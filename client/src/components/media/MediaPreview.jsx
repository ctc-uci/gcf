import {
  FormControl,
  Input,
  VStack,
} from "@chakra-ui/react";

export function MediaPreview({ title, onTitleChange }) {

  return (
    <VStack
        align="stretch"
        mb={2}
      >
        <FormControl>
          <Input
            border="2px solid"
            borderRadius="md"
            borderColor="gray.100"
            value={title}
            placeholder="Add Title"
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </FormControl>
      </VStack>
  );
}