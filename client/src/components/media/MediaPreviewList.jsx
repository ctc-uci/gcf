import { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Center,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

import { MediaPreview } from './MediaPreview';

export function MediaPreviewList({ files, onComplete, formOrigin }) {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const toast = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const [titles, setTitles] = useState([]);
  const [description, setDescription] = useState('');

  const previewUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );

  // keep titles array in sync with files prop
  useEffect(() => {
    setTitles((prev) => {
      return files.map((file, idx) => {
        if (prev && prev[idx]) {
          return prev[idx];
        }
        return file.name.replace(/\.[^/.]+$/, '');
      });
    });
  }, [files]);

  const updateTitle = (index, value) => {
    setTitles((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleFullUploadProcess = async () => {
    setIsUploading(true);
    const results = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const extension = file.name.includes('.')
          ? file.name.slice(file.name.lastIndexOf('.'))
          : '';

        const keyFileName = `${titles[i].trim()}${extension}`;

        const { data: s3Data } = await backend.post('/images/upload-url', {
          fileName: keyFileName,
          contentType: file.type,
        });

        if (!s3Data.uploadUrl || !s3Data.key) {
          throw new Error('Failed to get upload URL');
        }

        await backend.put(s3Data.uploadUrl, file, {
          baseURL: '',
          headers: { 'Content-Type': file.type },
        });

        results.push({
          s3_key: s3Data.key,
          file_name: keyFileName.replace(/\s+/g, '_'),
          file_type: file.type,
          title: titles[i],
          description: description,
          previewUrl: previewUrls[i],
        });
      }

      onComplete(results, description);

      toast({
        title: t('mediaPreviewList.toastSuccessTitle'),
        description: t('mediaPreviewList.toastSuccessDesc'),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Upload failed:', error);

      toast({
        title: t('mediaPreviewList.toastErrorTitle'),
        description: t('mediaPreviewList.toastErrorDesc'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <VStack
      spacing={6}
      align="stretch"
    >
      <VStack
        spacing={0}
        align="stretch"
      >
        <FormLabel
          color="gray.500"
          fontWeight="bold"
        >
          {t('mediaPreviewList.uploadedFiles')}
        </FormLabel>
        {files.map((file, i) => (
          <MediaPreview
            key={file.name + i}
            file={file}
            previewUrl={previewUrls[i]}
            title={titles[i]}
            onTitleChange={(val) => updateTitle(i, val)}
          />
        ))}
      </VStack>
      {formOrigin !== 'profile' && (
        <FormControl>
          <FormLabel
            color="gray.500"
            fontWeight="normal"
            mb={1}
          >
            {t('mediaPreviewList.notesLabel')}
          </FormLabel>
          <Textarea
            border="2px solid"
            borderRadius="md"
            borderColor="gray.100"
            rows={3}
            value={description}
            placeholder={t('mediaPreviewList.notesPlaceholder')}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormControl>
      )}
      <Center pt={4}>
        <Button
          variant="outline"
          borderColor="black"
          borderRadius="xl"
          px={16}
          bg="gray.50"
          fontWeight="normal"
          isLoading={isUploading}
          loadingText={t('common.uploading')}
          onClick={handleFullUploadProcess}
        >
          {t('common.upload')}
        </Button>
      </Center>
    </VStack>
  );
}
