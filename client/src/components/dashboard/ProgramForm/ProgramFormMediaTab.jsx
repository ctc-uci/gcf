import { Button, Heading, HStack, VStack } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

import { MediaPreviewTag } from './MediaPreviewTag';
import { removeFormItemByIdOrKey } from './programFormHelpers';

export function ProgramFormMediaTab({
  formState,
  setFormState,
  onOpenMediaUpload,
}) {
  const { t } = useTranslation();

  return (
    <VStack
      align="stretch"
      spacing={4}
    >
      <Heading
        size="md"
        fontWeight="semibold"
      >
        {t('programForm.mediaHeading')}
      </Heading>
      <Button
        size="sm"
        variant="outline"
        onClick={onOpenMediaUpload}
      >
        {t('common.add')}
      </Button>
      <HStack
        wrap="wrap"
        spacing={3}
      >
        {(formState.media ?? []).map((item, index) => (
          <MediaPreviewTag
            key={item.id || item.s3_key || `media-${index}`}
            item={item}
            onRemove={() => {
              setFormState((prev) => ({
                ...prev,
                media: removeFormItemByIdOrKey(prev.media, item),
              }));
            }}
            isMedia={true}
          />
        ))}
      </HStack>
    </VStack>
  );
}
