import { useCallback, useMemo } from 'react';

import { Button, Center, Text, VStack } from '@chakra-ui/react';

import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

const MIME_LABELS = {
  'application/pdf': 'PDF',
  'image/*': 'Images',
  'video/*': 'Video',
  'audio/*': 'Audio',
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPEG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WebP',
  'image/svg+xml': 'SVG',
  'image/bmp': 'BMP',
  'image/tiff': 'TIFF',
  'video/mp4': 'MP4',
  'video/webm': 'WebM',
  'video/quicktime': 'MOV',
  'audio/mpeg': 'MP3',
  'audio/wav': 'WAV',
};

function formatAcceptTypesList(accept) {
  const parts = [];
  for (const [mime, exts] of Object.entries(accept)) {
    const extList = Array.isArray(exts)
      ? exts.map((e) => e.replace(/^\./, '').toLowerCase()).filter(Boolean)
      : [];
    const uniqueExts = [...new Set(extList)];
    const label =
      MIME_LABELS[mime] ??
      (mime.endsWith('/*')
        ? `${mime.split('/')[0].charAt(0).toUpperCase()}${mime.split('/')[0].slice(1)}`
        : (mime.split('/').pop()?.toUpperCase() ?? mime));
    if (uniqueExts.length > 0) {
      parts.push(`${label} (.${uniqueExts.join(', .')})`);
    } else {
      parts.push(label);
    }
  }
  return parts.join(' · ');
}

export function MediaUpload({ onFileSelect, formOrigin, accept }) {
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
    ...(accept ? { accept } : {}),
  });

  const acceptSummary = useMemo(() => {
    if (
      !accept ||
      typeof accept !== 'object' ||
      Object.keys(accept).length === 0
    ) {
      return null;
    }
    return formatAcceptTypesList(accept);
  }, [accept]);

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
      <VStack
        spacing={3}
        w="full"
        px={4}
        pb={1}
      >
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
        {acceptSummary && (
          <Text
            fontSize="xs"
            color="gray.600"
            textAlign="center"
            lineHeight="short"
          >
            {t('mediaUpload.acceptedTypes', {
              fileTypes: acceptSummary,
              defaultValue: 'Accepted file types: {{fileTypes}}',
            })}
          </Text>
        )}
      </VStack>
    </Center>
  );
}
