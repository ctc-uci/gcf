import {
  FormControl,
  Input,
  VStack,
  Flex,
  Center,
  Image,
  Box
} from "@chakra-ui/react";

import gcf_globe from "/gcf_globe.png";

import { useMemo } from "react";

export function MediaPreview({ file, title, onTitleChange }) {
  const previewUrl = useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  return (
    <VStack
        align="stretch"
        mb={2}
      >
        <Flex>
          <Box h={"2rem"}>
            {file.type.startsWith("video") ? (
              <video
                src={previewUrl}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Image
                src={previewUrl}
                alt="Preview"
                w="100%"
                h="100%"
                objectFit="contain"
                fallback={
                  <Center h="100%">
                    <Image
                      src={gcf_globe}
                      alt="Loading..."
                      w="40px"
                    />
                  </Center>
                }
              />
            )}
          </Box>
          <FormControl>
            <Input
              h={"2rem"}
              border="2px solid"
              borderRadius="md"
              borderColor="gray.100"
              value={title ?? ""}
              placeholder="Add Title"
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </FormControl>
        </Flex>
      </VStack>
  );
}