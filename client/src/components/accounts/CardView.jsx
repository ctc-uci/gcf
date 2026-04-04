import { useEffect, useState } from 'react';

import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

import GcfGlobe from '/gcf_globe.png';

const CardView = ({ data, onSave: _onSave }) => {
  const { t } = useTranslation();
  const { backend } = useBackendContext();

  const RegionText = ({ id }) => {
    const [region, setRegion] = useState('');

    useEffect(() => {
      let cancelled = false;
      backend
        .get(`/regional-directors/regional-director-region/${id}`)
        .then((res) => {
          if (!cancelled) setRegion(res.data[0]?.name ?? '');
        })
        .catch(() => {
          if (!cancelled) setRegion('');
        });
      return () => {
        cancelled = true;
      };
    }, [id, backend]);

    return <Text fontSize="sm">{region}</Text>;
  };

  return (
    <>
      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={6}
      >
        {data.map((a) => (
          <GridItem key={a.id}>
            <Card
              w="auto"
              borderRadius="12px"
              bg="#EDF2F7"
            >
              <CardHeader
                py={3}
                px={4}
              >
                <Badge
                  borderRadius="6px"
                  py="6px"
                  px="12px"
                  bg="#D6F1EF"
                  color="gray.800"
                  display="inline-flex"
                  alignItems="center"
                >
                  {a.role}
                </Badge>
              </CardHeader>
              <CardBody
                position="relative"
                pt={2}
                px="24px"
                pb="18px"
                display="flex"
                alignItems="flex-start"
                justifyContent="center"
              >
                <Image
                  src={GcfGlobe}
                  objectFit="contain"
                  objectPosition="top"
                  draggable="false"
                  alt={t('programCard.gcfGlobeAlt')}
                />
              </CardBody>
              <CardFooter
                bg="white"
                h="88px"
                py="18px"
                px="24px"
              >
                <VStack
                  align="stretch"
                  spacing={3}
                >
                  <Text
                    fontSize="lg"
                    color="black"
                  >
                    {a.firstName} {a.lastName}
                  </Text>
                  <Flex
                    gap={3}
                    flexWrap="wrap"
                    align="center"
                  >
                    {a.role === 'Regional Director' ? (
                      <RegionText id={a.id} />
                    ) : (
                      (a.programs?.length
                        ? a.programs
                        : [t('assignedProgramFallback')]
                      ).map((p) => (
                        <Text
                          key={p}
                          fontSize="sm"
                          fontWeight="normal"
                          color="black"
                        >
                          {p}
                        </Text>
                      ))
                    )}
                  </Flex>
                </VStack>
              </CardFooter>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </>
  );
};

export default CardView;
