import 'flag-icons/css/flag-icons.min.css';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';
import { FiEdit2 } from 'react-icons/fi';
import { MdAccountCircle } from 'react-icons/md';
import useSWR from 'swr';

import { isoCodeToFlagIconCode } from '../../utils/isoCodeToFlagIconCode';
import { DirectorAvatar } from '../dashboard/ProgramForm/DirectorAvatar';

export const RegionCard = ({ region, onEdit, countries, refreshTrigger }) => {
  const { t } = useTranslation();
  const { backend } = useBackendContext();

  const { data, error } = useSWR(
    [`/regional-directors/region/${region.id}/`, refreshTrigger],
    async ([url]) => {
      const res = await backend.get(url);
      return Array.isArray(res.data) ? res.data : [];
    }
  );

  if (error) {
    console.error('Error fetching regional directors:', error);
  }

  const regionalDirectors = data || [];

  return (
    <Card
      h="100%"
      display="flex"
      flexDirection="column"
      role="group"
      position="relative"
      _hover={{ shadow: 'md' }}
    >
      <CardHeader
        fontSize="lg"
        fontWeight="semibold"
        mb="-3"
      >
        {region.name}
      </CardHeader>
      <CardBody mt="-4">
        <Text
          fontSize="xs"
          mb="2"
          fontWeight="semibold"
          color="gray.500"
        >
          {t('regions.cardRegionalDirector')}
        </Text>
        {regionalDirectors.length === 0 ? (
          <HStack ml="2">
            <Icon
              as={MdAccountCircle}
              mb="1"
              boxSize={5}
              color="gray.600"
            />
            <Text mb="2">{t('common.na')}</Text>
          </HStack>
        ) : (
          regionalDirectors.map((director) => (
            <HStack
              key={director.userId}
              ml="2"
            >
              <DirectorAvatar
                picture={director?.picture}
                name={
                  director ? `${director.firstName} ${director.lastName}` : ''
                }
                boxSize="24px"
              />
              <Text mb="2">
                {director.firstName} {director.lastName}
              </Text>
            </HStack>
          ))
        )}
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="gray.500"
        >
          {t('regions.cardAssignedCountries')}
        </Text>
        <Box
          overflowY="auto"
          h="200px"
          sx={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {countries.length === 0 ? (
            <Text>{t('regions.noCountries')}</Text>
          ) : (
            countries.map((country) => {
              const flagCode = isoCodeToFlagIconCode(country.isoCode);
              return (
                <Text key={country.id}>
                  {flagCode ? (
                    <>
                      <span
                        className={`fi fi-${flagCode}`}
                        aria-hidden="true"
                      />
                      {'  '}
                    </>
                  ) : null}
                  {country.name}
                </Text>
              );
            })
          )}
        </Box>
      </CardBody>
      <Button
        leftIcon={<FiEdit2 />}
        position="absolute"
        top="8px"
        right="8px"
        opacity={0}
        _hover={{
          color: 'white',
          bg: 'teal.500',
        }}
        _groupHover={{ opacity: 1 }}
        onClick={() => onEdit(region, regionalDirectors)}
        color="teal.500"
        bg="white"
        border="2px solid"
        borderColor="teal.500"
      >
        {t('common.edit')}
      </Button>
    </Card>
  );
};
