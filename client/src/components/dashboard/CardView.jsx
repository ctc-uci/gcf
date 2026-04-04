import { useState } from 'react';

import { EditIcon } from '@chakra-ui/icons';
import {
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Badge,
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Divider,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Image,
  Stack,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';

import ReactCardFlip from 'react-card-flip';

import GcfGlobe from '/gcf_globe.png';

const BackCardView = ({ data }) => {
  return (
    <Grid
      templateColumns="repeat(5, 1fr)"
      gap={6}
    >
      {data.map((p) => (
        <GridItem key={p.id}>
          <Card
            minW={324}
            minH={340}
            h="auto"
            br={20}
            w="100%"
            maxW="300px"
          >
            <CardHeader position="relative">
              <Tag
                size="md"
                borderRadius="md"
                color="#488181"
                bg="#d8f2f2"
              >
                {p.status}
              </Tag>
              <Text
                fontSize="sm"
                color="gray.500"
                fontWeight="semibold"
                mt="4"
              >
                PARTNER ORGANIZATION
              </Text>
              <Text
                mt="2"
                fontSize="lg"
                fontWeight="semibold"
                color="#1d2026"
              >
                {p.partnerOrgName}
              </Text>

              <HStack
                height="25px"
                maxWidth="100%"
                wrap="nowrap"
                spacing={2}
                overflowX="auto"
                overflowY="hidden"
                sx={{
                  '& > *': { flexShrink: 0 },
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <Divider orientation="vertical" />
                {Array.isArray(p.languages)
                  ? p.languages.map((l) => (
                      <Box
                        key={`${l}`}
                        bg="#E9D8FD"
                        px={3}
                        py={1}
                        borderRadius="lg"
                      >
                        {l}
                      </Box>
                    ))
                  : null}
              </HStack>
            </CardHeader>

            <Divider orientation="horizontal" />

            <CardBody position="relative">
              <HStack>
                <VStack>
                  <Text
                    fontSize="sm"
                    color="gray.500"
                    fontWeight="semibold"
                    pb="2px"
                  >
                    REGIONAL DIRECTOR
                  </Text>

                  <HStack height="55x">
                    <Avatar
                      ml="15px"
                      size="sm"
                      name="Regional Director"
                    />
                    <Text textAlign="left">Regional Director</Text>
                  </HStack>
                </VStack>

                <VStack>
                  <Text
                    fontSize="sm"
                    color="gray.500"
                    fontWeight="semibold"
                    pb="2px"
                  >
                    PROGRAM DIRECTOR
                  </Text>

                  <HStack height="55x">
                    <Avatar
                      ml="15px"
                      size="sm"
                      name="Program Director"
                    />
                    <Text textAlign="left">Program Director</Text>
                  </HStack>
                </VStack>
              </HStack>

              <Text
                fontSize="sm"
                color="gray.500"
                fontWeight="semibold"
                mt="4"
                pb="9px"
              >
                CURRICULUM LINKS
              </Text>

              <HStack
                height="25px"
                maxWidth="100%"
                wrap="nowrap"
                spacing={2}
                overflowX="auto"
                overflowY="hidden"
              >
                <Divider orientation="vertical" />
                {Array.isArray(p.instrumentsMap)
                  ? p.instrumentsMap.map((d, idx) => (
                      <Box
                        key={`${d.name}-${d.quantity}-${idx}`}
                        bg="#E9D8FD"
                        px={3}
                        py={1}
                        borderRadius="lg"
                      >
                        {d.name} {d.quantity}
                      </Box>
                    ))
                  : null}
              </HStack>

              <HStack>
                <Text
                  fontSize="sm"
                  color="gray.500"
                  fontWeight="semibold"
                  mt="4"
                  pb="9px"
                >
                  FILES
                </Text>
                <Tag
                  size="md"
                  mt="7px"
                  borderRadius="md"
                  color="gray"
                  bg="#edf2f7"
                >
                  {'#'}
                </Tag>

                <Text
                  fontSize="sm"
                  color="gray.500"
                  fontWeight="semibold"
                  mt="4"
                  pb="9px"
                >
                  MAP MEDIA
                </Text>
                <Tag
                  size="md"
                  mt="7px"
                  borderRadius="md"
                  color="gray"
                  bg="#edf2f7"
                >
                  {'#'}
                </Tag>
              </HStack>
            </CardBody>
          </Card>
        </GridItem>
      ))}
    </Grid>
  );
};

const FrontCardView = ({ data, openEditForm }) => {
  return (
    <Grid
      templateColumns="repeat(5, 1fr)"
      gap={6}
    >
      {data.map((p) => (
        <GridItem key={p.id}>
          <Card
            minW={324}
            minH={340}
            h="auto"
            br={20}
            w="100%"
            maxW="300px"
          >
            <CardHeader position="relative">
              <Tag
                size="md"
                borderRadius="md"
                color="#488181"
                bg="#d8f2f2"
              >
                {p.status}
              </Tag>
              <Text
                fontSize="sm"
                color="gray.500"
                fontWeight="semibold"
                mt="4"
              >
                LAUNCH DATE
              </Text>
              <Text size="md">
                {new Date(p.launchDate).toLocaleDateString('en-US', {})}
              </Text>
              <Text
                mt="2"
                fontSize="lg"
                fontWeight="semibold"
                color="#1d2026"
              >
                {p.title}
              </Text>
              <Text mb="0">{p.location}</Text>

              <Box
                position="absolute"
                top={2}
                right={2}
              >
                <IconButton
                  aria-label="edit"
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => openEditForm(p)}
                  bg="#808080"
                  borderRadius="full"
                  color="white"
                />
              </Box>
            </CardHeader>

            <Divider orientation="horizontal" />

            <CardBody position="relative">
              <Text
                fontSize="sm"
                color="gray.500"
                fontWeight="semibold"
                pb="2px"
              >
                STUDENTS
              </Text>

              <HStack height="25px">
                <Text>{p.students} Total</Text>
                <Divider orientation="vertical" />
                <Text>{p.students} Graduated</Text>
              </HStack>

              <Text
                fontSize="sm"
                color="gray.500"
                fontWeight="semibold"
                mt="4"
                pb="9px"
              >
                INSTRUMENTS
              </Text>

              <HStack
                height="25px"
                maxWidth="100%"
                wrap="nowrap"
                spacing={2}
                overflowX="auto"
                overflowY="hidden"
                sx={{
                  '& > *': { flexShrink: 0 },
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <Text>{p.totalInstruments} Total</Text>
                <Divider orientation="vertical" />
                {Array.isArray(p.instrumentsMap)
                  ? p.instrumentsMap.map((d, idx) => (
                      <Box
                        key={`${d.name}-${d.quantity}-${idx}`}
                        bg="#E9D8FD"
                        px={3}
                        py={1}
                        borderRadius="lg"
                      >
                        <Text fontSize="sm">
                          {d.name} {d.quantity}
                        </Text>
                      </Box>
                    ))
                  : null}
              </HStack>
            </CardBody>
          </Card>
        </GridItem>
      ))}
    </Grid>
  );
};

const CardView = ({ data, openEditForm }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setIsFlipped((prev) => !prev);
  };

  return (
    <Box onClick={handleClick}>
      {isFlipped ? (
        <BackCardView data={data} />
      ) : (
        <FrontCardView
          data={data}
          openEditForm={openEditForm}
        />
      )}
    </Box>
  );
};

export default CardView;
