import React,{useCallback} from "react";
import {useDropzone} from "react-dropzone";
import { Text, Center } from "@chakra-ui/react";

export function MediaUpload({ onFileSelect, formOrigin }) {
  console.log(formOrigin === "profile" ? "a" : "other");
  const onDrop = useCallback(acceptedFiles => {
    onFileSelect(acceptedFiles);
  }, [onFileSelect]);

  const {getRootProps, getInputProps} = useDropzone({onDrop}, 
    // allow multiple files only if the form origin isn't "profile"
    {multiple: formOrigin === "profile" ? false : true}
  )

  return (
    <Center border='3px' backgroundColor='#E6FFFA99' borderColor="#2C7A7B" borderStyle="dashed" borderRadius="12px" height="300px" 
    {...getRootProps()}>
        <input {...getInputProps()} />
        <Text as='b'>Drag and drop files here</Text>
      
    </Center>
  );
}
