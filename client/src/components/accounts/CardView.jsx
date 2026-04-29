import { useEffect, useState } from 'react';

import {
  Badge,
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';
import { BsPencil } from 'react-icons/bs';

import { getRoleBadgeProps } from './AccountForm/constants';
import GcfGlobe from '/gcf_globe.png';

const CardView = ({ data, onUpdate = () => {} }) => {
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
              role="group"
              w="auto"
              borderRadius="12px"
              bg="#EDF2F7"
              transition="background-color 0.2s ease"
              _hover={{ bg: 'teal.fph50' }}
            >
              <CardHeader
                position="relative"
                py={3}
                px={4}
              >
                <Badge
                  borderRadius="6px"
                  py="6px"
                  px="12px"
                  {...getRoleBadgeProps(a.role)}
                  display="inline-flex"
                  alignItems="center"
                >
                  {a.role}
                </Badge>
                <Box
                  position="absolute"
                  top={2}
                  right={2}
                  opacity={0}
                  pointerEvents="none"
                  transition="opacity 0.2s ease"
                  _groupHover={{ opacity: 1, pointerEvents: 'auto' }}
                >
                  <IconButton
                    aria-label={t('common.edit')}
                    icon={<BsPencil />}
                    size="sm"
                    variant="ghost"
                    bg="white"
                    color="teal.500"
                    borderWidth="2px"
                    borderColor="teal.500"
                    borderRadius="full"
                    _hover={{ bg: 'teal.500', color: 'white' }}
                    _active={{ bg: 'teal.100', color: 'teal.500' }}
                    onClick={() => onUpdate(a)}
                  />
                </Box>
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
