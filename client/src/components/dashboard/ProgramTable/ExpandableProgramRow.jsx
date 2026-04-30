import {
  Box,
  Button,
  Collapse,
  HStack,
  Link,
  Tbody,
  Td,
  Text,
  Tr,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { FiEdit2 } from 'react-icons/fi';

import 'flag-icons/css/flag-icons.min.css';

import ISO6391 from 'iso-639-1';
import { useTranslation } from 'react-i18next';

import { isoCodeToFlagIconCode } from '../../../utils/isoCodeToFlagIconCode';
import { DirectorAvatar } from '../ProgramForm/DirectorAvatar';
import { formatLaunchDate } from './programTableMappers';
import { getInstrumentTagStyle } from './programTableTagConstants';
import { StatusTag } from './StatusTag';

export function ExpandableProgramRow({ p, onEdit }) {
  const { t } = useTranslation();
  const { isOpen, onToggle } = useDisclosure();
  const languageCodes = Array.isArray(p.languages) ? p.languages : [];

  const languageLabel = languageCodes.length
    ? languageCodes
        .map((code) => ISO6391.getName(String(code).toLowerCase()) || code)
        .join(', ')
    : '';
  const flagCode = isoCodeToFlagIconCode(p.isoCode);

  return (
    <Tbody
      sx={{
        '& > tr > td': {
          transition: 'background-color 0.2s ease',
        },
      }}
      _hover={{
        '& > tr > td': { bg: 'gray.100' },
        '& .action-group': { opacity: 1, visibility: 'visible' },
      }}
    >
      <Tr
        onClick={onToggle}
        cursor="pointer"
        sx={{
          '& td': {
            borderBottom: isOpen ? 'none' : '1px solid',
            borderColor: 'gray.200',
          },
        }}
      >
        <Td>{p.title}</Td>
        <Td>
          <StatusTag status={p.status} />
        </Td>
        <Td>{formatLaunchDate(p.launchDate)}</Td>
        <Td>
          {flagCode ? (
            <>
              <span
                className={`fi fi-${flagCode}`}
                aria-hidden="true"
              />
              {'  '}
            </>
          ) : null}
          {p.location}
        </Td>
        <Td>{p.students}</Td>
        <Td>
          <VStack
            align="start"
            spacing={2}
          >
            {Array.isArray(p.instrumentsMap)
              ? p.instrumentsMap.map((d, idx) => {
                  const tagStyle = getInstrumentTagStyle(d.name);
                  return (
                    <Box
                      key={`${d.name}-${d.quantity}-${idx}`}
                      bg={tagStyle.bg}
                      color={tagStyle.color}
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {d.name} {d.quantity}
                    </Box>
                  );
                })
              : null}
          </VStack>
        </Td>
        <Td>
          <HStack
            justify="space-between"
            minW="100px"
          >
            <Text>{p.totalInstruments}</Text>
          </HStack>
        </Td>
        <Td
          p={0}
          w="0"
          minW="0"
          textAlign="right"
          position="sticky"
          right={0}
          overflow="visible"
        >
          <Box
            className="action-group"
            position="absolute"
            top="50%"
            right={1}
            transform="translateY(-50%)"
            opacity={{ base: 1, md: 0 }}
            visibility={{ base: 'visible', md: 'hidden' }}
            transition="all 0.2s"
          >
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiEdit2 />}
              colorScheme="teal"
              bg="white"
              m={0}
              _hover={{ bg: 'teal.500', color: 'white' }}
              _active={{ bg: 'teal.100', color: 'teal.600' }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(p);
              }}
            >
              {t('common.edit')}
            </Button>
          </Box>
        </Td>
      </Tr>

      <Tr>
        <Td
          colSpan={8}
          borderBottom={isOpen ? '1px solid' : 'none'}
          borderColor="gray.200"
          p={isOpen ? undefined : 0}
        >
          <Collapse in={isOpen}>
            <HStack
              align="start"
              py={4}
            >
              <Box
                flex="1"
                display="grid"
              >
                <Box
                  fontSize="sm"
                  fontWeight="semibold"
                  pb="2"
                >
                  {t('expandableProgramRow.language')}
                </Box>
                <Box>{languageLabel}</Box>
              </Box>
              <Box
                flex="1"
                display="grid"
              >
                <Box
                  fontSize="sm"
                  fontWeight="semibold"
                  pb="2"
                >
                  {t('expandableProgramRow.regionalDirectors')}
                </Box>
                <Box>
                  <VStack
                    align="start"
                    spacing={2}
                  >
                    {Array.isArray(p.regionalDirectors)
                      ? p.regionalDirectors.map((d, idx) => (
                          <HStack
                            key={
                              d.userId ?? `${d.firstName}-${d.lastName}-${idx}`
                            }
                            spacing={2}
                          >
                            <DirectorAvatar
                              picture={d.picture}
                              name={`${d.firstName} ${d.lastName}`}
                              boxSize="28px"
                            />
                            <Text fontSize="sm">
                              {d.firstName} {d.lastName}
                            </Text>
                          </HStack>
                        ))
                      : null}
                  </VStack>
                </Box>
              </Box>
              <Box
                flex="1"
                display="grid"
              >
                <Box
                  fontSize="sm"
                  fontWeight="semibold"
                  pb="2"
                >
                  {t('expandableProgramRow.programDirectors')}
                </Box>
                <Box>
                  <VStack
                    align="start"
                    spacing={2}
                  >
                    {Array.isArray(p.programDirectors)
                      ? p.programDirectors.map((d, idx) => (
                          <HStack
                            key={
                              d.userId ?? `${d.firstName}-${d.lastName}-${idx}`
                            }
                            spacing={2}
                          >
                            <DirectorAvatar
                              picture={d.picture}
                              name={`${d.firstName} ${d.lastName}`}
                              boxSize="28px"
                            />
                            <Text fontSize="sm">
                              {d.firstName} {d.lastName}
                            </Text>
                          </HStack>
                        ))
                      : null}
                  </VStack>
                </Box>
              </Box>
              <Box
                flex="1"
                display="grid"
              >
                <Box
                  fontSize="sm"
                  fontWeight="semibold"
                  pb="2"
                >
                  {t('expandableProgramRow.curriculumLinks')}
                </Box>
                <Box>
                  {Array.isArray(p.playlists)
                    ? p.playlists.map((l) => (
                        <Box key={l.link}>
                          <Link
                            href={l.link}
                            color="blue"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {l.name}
                          </Link>
                        </Box>
                      ))
                    : null}
                </Box>
              </Box>
            </HStack>
          </Collapse>
        </Td>
      </Tr>
    </Tbody>
  );
}
