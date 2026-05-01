import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  HStack,
  IconButton,
  Link,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';

import ReactCardFlip from 'react-card-flip';
import { useTranslation } from 'react-i18next';
import { FiEdit2 } from 'react-icons/fi';

import { DirectorAvatar } from './ProgramForm/DirectorAvatar';

const BackCardView = ({ p, onClick, t, openEditForm }) => {
  return (
    <Card
      role="group"
      h="100%"
      br={20}
      w="100%"
      maxW="600px"
      maxH="500px"
      onClick={onClick}
      transition="background-color 0.2s ease"
      _hover={{ bg: 'teal.50' }}
    >
      <CardHeader position="relative">
        <Box
          position="absolute"
          top={2}
          right={2}
          opacity={0}
          pointerEvents="none"
          transition="opacity 0.2s ease"
          _groupHover={{ opacity: 1, pointerEvents: 'auto' }}
          _groupFocusWithin={{ opacity: 1, pointerEvents: 'auto' }}
          zIndex={1}
        >
          <IconButton
            aria-label={t('programCard.editAria')}
            icon={<FiEdit2 />}
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              openEditForm(p);
            }}
            bg="white"
            borderRadius="full"
            color="teal.500"
            borderWidth="2px"
            borderColor="teal.500"
            _hover={{ bg: 'teal.500', color: 'white' }}
            _active={{ bg: 'teal.100', color: 'teal.600' }}
          />
        </Box>
        <Tag
          size="md"
          borderRadius="md"
          color="#282828"
          bg="#efeff0"
        >
          <Text fontWeight="normal">{p.regionName}</Text>
        </Tag>
        <Text
          fontSize="sm"
          color="gray.500"
          fontWeight="semibold"
          mt="4"
        >
          {t('programCard.partnerOrganization', {
            defaultValue: 'PARTNER ORGANIZATION',
          })}
        </Text>
        <Text
          mt="2"
          fontSize="lg"
          fontWeight="semibold"
          color="#1d2026"
          mb="1"
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
          <VStack alignItems="flex-start">
            <Text
              fontSize="sm"
              color="gray.500"
              fontWeight="semibold"
              pb="2px"
            >
              {t('expandableProgramRow.regionalDirectors')}
            </Text>

            <VStack
              align="start"
              spacing={1}
              minH="55px"
              justify="center"
            >
              {Array.isArray(p.regionalDirectors) &&
              p.regionalDirectors.length > 0 ? (
                p.regionalDirectors.map((d, idx) => (
                  <HStack
                    key={d.userId ?? idx}
                    spacing={2}
                  >
                    <DirectorAvatar
                      picture={d.picture}
                      name={`${d.firstName} ${d.lastName}`}
                      boxSize="28px"
                    />
                    <Text
                      textAlign="left"
                      fontSize="sm"
                    >
                      {d.firstName} {d.lastName}
                    </Text>
                  </HStack>
                ))
              ) : (
                <Text
                  fontSize="sm"
                  color="gray.400"
                >
                  —
                </Text>
              )}
            </VStack>
          </VStack>

          <VStack alignItems="flex-start">
            <Text
              fontSize="sm"
              color="gray.500"
              fontWeight="semibold"
              pb="2px"
            >
              {t('expandableProgramRow.programDirectors')}
            </Text>

            <VStack
              align="start"
              spacing={1}
              minH="55px"
              justify="center"
            >
              {Array.isArray(p.programDirectors) &&
              p.programDirectors.length > 0 ? (
                p.programDirectors.map((d, idx) => (
                  <HStack
                    key={d.userId ?? idx}
                    spacing={2}
                  >
                    <DirectorAvatar
                      picture={d.picture}
                      name={`${d.firstName} ${d.lastName}`}
                      boxSize="28px"
                    />
                    <Text
                      textAlign="left"
                      fontSize="sm"
                    >
                      {d.firstName} {d.lastName}
                    </Text>
                  </HStack>
                ))
              ) : (
                <Text
                  fontSize="sm"
                  color="gray.400"
                >
                  —
                </Text>
              )}
            </VStack>
          </VStack>
        </HStack>

        <Text
          fontSize="sm"
          color="gray.500"
          fontWeight="semibold"
          mt="4"
          pb="9px"
        >
          {t('expandableProgramRow.curriculumLinks')}
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
          {Array.isArray(p.playlists)
            ? p.playlists.map((d, idx) => (
                <span key={`${d.name}-${idx}`}>
                  {d.link ? (
                    <Link
                      onClick={(e) => e.stopPropagation()}
                      href={d.link}
                      isExternal
                      color="teal.500"
                      textDecoration="underline"
                      _hover={{ textDecoration: 'none' }}
                    >
                      {d.name}
                    </Link>
                  ) : (
                    d.name
                  )}
                  {idx < p.playlists.length - 1 && ', '}
                </span>
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
            {t('programCard.filesLabel', { defaultValue: 'FILES' })}
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
            {t('programCard.mapMediaLabel', { defaultValue: 'MAP MEDIA' })}
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
  );
};

const FrontCardView = ({ p, openEditForm, onClick, t }) => {
  return (
    <Card
      role="group"
      br={20}
      w="100%"
      maxW="600px"
      h="350px"
      onClick={onClick}
      transition="background-color 0.2s ease"
      _hover={{ bg: 'teal.50' }}
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
          {t('programsTable.colLaunchDate')}
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
          opacity={0}
          pointerEvents="none"
          transition="opacity 0.2s ease"
          _groupHover={{ opacity: 1, pointerEvents: 'auto' }}
        >
          <IconButton
            aria-label={t('programCard.editAria')}
            icon={<FiEdit2 />}
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              openEditForm(p);
            }}
            bg="white"
            borderRadius="full"
            color="teal.500"
            borderWidth="2px"
            borderColor="teal.500"
            _hover={{ bg: 'teal.500', color: 'white' }}
            _active={{ bg: 'teal.100', color: 'teal.600' }}
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
          {t('common.students')}
        </Text>

        <HStack height="25px">
          <Text>
            {p.students}{' '}
            {t('programCard.totalSuffix', { defaultValue: 'Total' })}
          </Text>
          <Divider orientation="vertical" />
          <Text>
            {p.students}{' '}
            {t('programCard.graduatedSuffix', { defaultValue: 'Graduated' })}
          </Text>
        </HStack>

        <Text
          fontSize="sm"
          color="gray.500"
          fontWeight="semibold"
          mt="4"
          pb="9px"
        >
          {t('common.instruments')}
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
          <Text>
            {p.totalInstruments}{' '}
            {t('programCard.totalSuffix', { defaultValue: 'Total' })}
          </Text>
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
  );
};

const CardView = ({ data, flippedId, setFlippedId, openEditForm }) => {
  const { t } = useTranslation();

  const handleFlip = (id) => {
    setFlippedId((prev) => (prev === id ? null : id));
  };

  return (
    <Grid
      templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      gap={4}
      px={1}
      alignItems="start"
    >
      {data.map((item) => (
        <ReactCardFlip
          key={item.id}
          width="300px"
          isFlipped={flippedId === item.id}
          flipDirection="horizontal"
          containerStyle={{ width: '100%' }}
        >
          <FrontCardView
            p={item}
            openEditForm={openEditForm}
            onClick={() => handleFlip(item.id)}
            t={t}
          />
          <BackCardView
            p={item}
            onClick={() => handleFlip(item.id)}
            t={t}
            openEditForm={openEditForm}
          />
        </ReactCardFlip>
      ))}
    </Grid>
  );
};

export default CardView;
