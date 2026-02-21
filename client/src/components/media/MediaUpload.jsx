import React,{useCallback} from "react";
import {useDropzone} from "react-dropzone";
import { Text, Center, VStack, Button } from "@chakra-ui/react";

export function MediaUpload({ onFileSelect, formOrigin }) {
  // console.log(formOrigin === "profile" ? "a" : "other");
  const onDrop = useCallback(acceptedFiles => {
    onFileSelect(acceptedFiles);
  }, [onFileSelect]);

  const {getRootProps, getInputProps, open } = useDropzone({
      onDrop,
      // allow multiple files only if the form origin isn't "profile"
      multiple: formOrigin === "profile" ? false : true,
      noClick: true,
    });

  return (
    <Center border='3px' backgroundColor='#E6FFFA99' borderColor="#2C7A7B" borderStyle="dashed" borderRadius="12px" minH="300px" height="full" 
    {...getRootProps()}>
        <input {...getInputProps()} />
        <VStack>
          <Text as='b'>Drag and drop files here</Text>
          <Text>OR</Text>
          <Button onClick={open} color="#2C7A7B" border="2px solid" backgroundColor='#E6FFFA99' height="50px" borderColor="#2C7A7B">Browse Files</Button>
        </VStack>
    </Center>
  );
}
