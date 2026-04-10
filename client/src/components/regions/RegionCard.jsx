import { useEffect, useState } from 'react';

import 'flag-icons/css/flag-icons.min.css';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Text,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';
import { GrEdit } from 'react-icons/gr';

import { isoCodeToFlagIconCode } from '../../utils/isoCodeToFlagIconCode';
import { DirectorAvatar } from '../dashboard/ProgramForm/DirectorAvatar';

export const RegionCard = ({ region, onEdit, countries }) => {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const [regionalDirector, setRegionalDirector] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await backend.get(
          `/regional-directors/region/${region.id}/`
        );
        const regionalDirector = res.data ? res.data : null;
        setRegionalDirector(regionalDirector);
      } catch (err) {
        console.error('Error fetching regional director:', err);
      }
    };

    fetchData();
  }, [region.id, backend]);

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
        <HStack ml="2">
          <DirectorAvatar
            picture={regionalDirector?.picture}
            name={
              regionalDirector
                ? `${regionalDirector.firstName} ${regionalDirector.lastName}`
                : ''
            }
            boxSize="24px"
          />
          <Text mb="2">
            {regionalDirector
              ? `${regionalDirector.firstName} ${regionalDirector.lastName}`
              : t('common.na')}
          </Text>
        </HStack>
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
        leftIcon={<GrEdit />}
        position="absolute"
        top="8px"
        right="8px"
        opacity={0}
        _hover={{
          color: 'white',
          bg: 'teal.500',
        }}
        _groupHover={{ opacity: 1 }}
        onClick={() => onEdit(region, regionalDirector)}
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
