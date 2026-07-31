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
import { FiEdit2 } from 'react-icons/fi';

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

    return (
      <Text
        fontSize="sm"
        color="black"
        noOfLines={2}
      >
        {region}
      </Text>
    );
  };

  return (
    <>
      <Grid
        templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
        gap={4}
        px={1}
        alignItems="start"
      >
        {data.map((a) => (
          <GridItem key={a.id}>
            <Card
              role="group"
              w="100%"
              maxW="600px"
              h="350px"
              borderRadius="20px"
              bg="#EDF2F7"
              overflow="hidden"
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
                    icon={<FiEdit2 />}
                    size="sm"
                    variant="ghost"
                    bg="white"
                    color="teal.500"
                    borderWidth="2px"
                    borderColor="teal.500"
                    borderRadius="full"
                    _hover={{ bg: 'teal.500', color: 'white' }}
                    _active={{ bg: 'teal.100', color: 'teal.500' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(a);
                    }}
                  />
                </Box>
              </CardHeader>
              <CardBody
                position="relative"
                pt={1}
                px="24px"
                pb="10px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flex="1"
                minH="140px"
                overflow="hidden"
              >
                <Image
                  src={GcfGlobe}
                  objectFit="contain"
                  objectPosition="center"
                  draggable="false"
                  alt={t('programCard.gcfGlobeAlt')}
                  maxH="100%"
                />
              </CardBody>
              <CardFooter
                bg="white"
                minH="120px"
                py="14px"
                px="24px"
                alignItems="flex-start"
                overflow="hidden"
              >
                <VStack
                  align="stretch"
                  spacing={2}
                  w="100%"
                >
                  <Text
                    fontSize="lg"
                    color="black"
                    noOfLines={1}
                  >
                    {a.firstName} {a.lastName}
                  </Text>
                  <Flex
                    gap={3}
                    flexWrap="wrap"
                    align="flex-start"
                    maxH="52px"
                    overflowY="auto"
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
                          noOfLines={1}
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
