import { useCallback } from 'react';

import { Button, Center, Text, VStack } from '@chakra-ui/react';

import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

export function MediaUpload({ onFileSelect, formOrigin }) {
  const { t } = useTranslation();
  const onDrop = useCallback(
    (acceptedFiles) => {
      onFileSelect(acceptedFiles);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    // allow multiple files only if the form origin isn't "profile"
    multiple: formOrigin === 'profile' ? false : true,
    noClick: true,
  });

  return (
    <Center
      border="3px"
      backgroundColor="#E6FFFA99"
      borderColor="#2C7A7B"
      borderStyle="dashed"
      borderRadius="12px"
      minH="300px"
      height="full"
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <VStack>
        <Text as="b">{t('mediaUpload.dragDrop')}</Text>
        <Text>{t('mediaUpload.or')}</Text>
        <Button
          onClick={open}
          color="#2C7A7B"
          border="2px solid"
          backgroundColor="#E6FFFA99"
          height="50px"
          borderColor="#2C7A7B"
        >
          {t('mediaUpload.browse')}
        </Button>
      </VStack>
    </Center>
  );
}
