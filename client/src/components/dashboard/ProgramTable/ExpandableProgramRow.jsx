import { EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Collapse,
  HStack,
  Link,
  Td,
  Tr,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import 'flag-icons/css/flag-icons.min.css';

import ISO6391 from 'iso-639-1';
import { useTranslation } from 'react-i18next';

import { isoCodeToFlagIconCode } from '../../../utils/isoCodeToFlagIconCode';
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
    <>
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
              ? p.instrumentsMap.map((d, idx) => (
                  <Box
                    key={`${d.name}-${d.quantity}-${idx}`}
                    bg="gray.200"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {d.name} {d.quantity}
                  </Box>
                ))
              : null}
          </VStack>
        </Td>
        <Td>{p.totalInstruments}</Td>
      </Tr>
      <Tr>
        <Td
          colSpan={7}
          borderBottom={isOpen ? '1px solid' : 'none'}
          borderColor="gray.200"
          p={isOpen ? undefined : 0}
        >
          <Collapse in={isOpen}>
            <Box position="relative">
              <HStack align="start">
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
                            <Box
                              key={
                                d.userId ??
                                `${d.firstName}-${d.lastName}-${idx}`
                              }
                              bg="gray.200"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              {d.firstName} {d.lastName}
                            </Box>
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
                            <Box
                              key={
                                d.userId ??
                                `${d.firstName}-${d.lastName}-${idx}`
                              }
                              bg="gray.200"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              {d.firstName} {d.lastName}
                            </Box>
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
              <Button
                size="xs"
                position="absolute"
                bottom="8px"
                right="8px"
                border="1px solid"
                bg="white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(p);
                }}
                leftIcon={<EditIcon />}
              >
                {t('expandableProgramRow.update')}
              </Button>
            </Box>
          </Collapse>
        </Td>
      </Tr>
    </>
  );
}
