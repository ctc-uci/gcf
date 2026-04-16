import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Tag,
  TagCloseButton,
  TagLabel,
  VStack,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

import { CurriculumLinkForm } from './CurriculumLinkForm';
import { MediaPreviewTag } from './MediaPreviewTag';

/**
 * Resources: curriculum links (toggle), file/media uploads (modal opened by parent), link to Media tab.
 */
export function ResourcesSection({
  formState,
  setFormData,
  programId,
  backend,
  onOpenMediaModal,
  onSeeAllMedia,
}) {
  const { t } = useTranslation();
  const [showCurriculumAdd, setShowCurriculumAdd] = useState(false);
  const curriculumAddRef = useRef(null);

  useEffect(() => {
    if (!showCurriculumAdd) return undefined;
    function handlePointerDown(event) {
      const el = curriculumAddRef.current;
      if (!el || el.contains(event.target)) return;
      setShowCurriculumAdd(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [showCurriculumAdd]);

  return (
    <Box mt={2}>
      <Heading
        size="md"
        fontWeight="semibold"
        mb={3}
      >
        {t('programForm.resourcesSectionTitle')}
      </Heading>
      <VStack
        align="stretch"
        spacing={4}
      >
        <FormControl>
          <FormLabel
            size="sm"
            fontWeight="normal"
            color="gray"
          >
            {t('programForm.curriculumLinkLabel')}
          </FormLabel>
          {!showCurriculumAdd && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCurriculumAdd(true)}
            >
              {t('common.add')}
            </Button>
          )}
          {showCurriculumAdd && (
            <Box
              ref={curriculumAddRef}
              mt={1}
            >
              <CurriculumLinkForm
                formState={formState}
                setFormData={setFormData}
                programId={programId}
                backend={backend}
              />
            </Box>
          )}
          {(formState.curriculumLinks ?? []).length > 0 && (
            <HStack
              wrap="wrap"
              spacing={2}
              mt={3}
            >
              {(formState.curriculumLinks ?? []).map((playlist) => (
                <Tag
                  key={`${playlist.link}-${playlist.instrumentId}`}
                  size="lg"
                >
                  <TagLabel
                    cursor="pointer"
                    onClick={() => {
                      window.open(
                        playlist.link,
                        '_blank',
                        'noopener,noreferrer'
                      );
                    }}
                  >
                    {playlist.instrumentName
                      ? `${playlist.instrumentName}: `
                      : ''}
                    {playlist.name}
                  </TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        curriculumLinks: prev.curriculumLinks.filter(
                          (p) =>
                            !(
                              p.link === playlist.link &&
                              p.instrumentId === playlist.instrumentId
                            )
                        ),
                      }));
                    }}
                  />
                </Tag>
              ))}
            </HStack>
          )}
        </FormControl>

        <FormControl>
          <FormLabel
            size="sm"
            fontWeight="normal"
            color="gray"
          >
            {t('programForm.files')}
          </FormLabel>
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenMediaModal}
          >
            {t('common.add')}
          </Button>
          {(formState.media ?? []).length > 0 && (
            <HStack
              wrap="wrap"
              spacing={3}
              mt={3}
            >
              {(formState.media ?? []).map((item, i) => (
                <MediaPreviewTag
                  key={item.id || item.s3_key || `media-${i}`}
                  item={item}
                  onRemove={() => {
                    setFormData((prev) => ({
                      ...prev,
                      media: (prev.media ?? []).filter((m) => {
                        if (
                          item.id !== null &&
                          item.id !== undefined &&
                          m.id !== null &&
                          m.id !== undefined
                        ) {
                          return Number(m.id) !== Number(item.id);
                        }
                        if (item.s3_key && m.s3_key) {
                          return m.s3_key !== item.s3_key;
                        }
                        return m !== item;
                      }),
                    }));
                  }}
                  isMedia={false}
                />
              ))}
            </HStack>
          )}
        </FormControl>

        <FormControl>
          <FormLabel
            size="sm"
            fontWeight="normal"
            color="gray"
          >
            {t('programForm.mediaHeading')}
          </FormLabel>
          <Button
            size="sm"
            variant="outline"
            onClick={onSeeAllMedia}
          >
            {t('programForm.seeAllMedia')}
          </Button>
        </FormControl>
      </VStack>
    </Box>
  );
}
