import { SimpleGrid, Text, VStack } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

import { MediaCard } from './MediaCard';

export const MediaGrid = ({
  mediaItems,
  programName,
  onUpdate,
  onCardClick,
}) => {
  const { t } = useTranslation();
  let content;
  if (mediaItems.length === 0 && !programName) {
    content = <Text>{t('mediaPage.noProgram')}</Text>;
  } else if (mediaItems.length === 0) {
    content = (
      <Text>{t('mediaPage.noMediaForProgram', { name: programName })}</Text>
    );
  } else {
    content = (
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
        spacing={6}
        w="full"
      >
        {mediaItems.map((item, index) => (
          <MediaCard
            key={item.id}
            {...item}
            onUpdate={onUpdate}
            onClick={() => onCardClick?.(index)}
          />
        ))}
      </SimpleGrid>
    );
  }

  return (
    <VStack
      align="start"
      spacing={4}
      w="full"
    >
      {content}
    </VStack>
  );
};
