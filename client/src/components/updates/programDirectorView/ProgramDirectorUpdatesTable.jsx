import {
  Badge,
  Box,
  Center,
  Icon,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';

import { EmptyStateBadge } from '@/components/badges/EmptyStateBadge';
import { useTranslation } from 'react-i18next';
import { FiStar } from 'react-icons/fi';

import { SortArrows } from '../../tables/SortArrows';
import { formatTableDate } from '../config/updatesColumnConfig';

function formatChangeAmount(value, dash) {
  if (value === null || value === undefined || value === '') return dash;
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n > 0 ? `+${n}` : String(n);
}

function displayInstrumentName(row, dash) {
  return row.instrumentName || row.title || dash;
}

function EnrollmentChangeDetails({ row, dash }) {
  const hasEnrollment = row.enrollmentChange !== null;
  if (!hasEnrollment) {
    return (
      <Text
        fontSize="sm"
        color="gray.700"
      >
        {dash}
      </Text>
    );
  }
  return (
    <VStack
      align="start"
      spacing={0.5}
    >
      {hasEnrollment && (
        <Text
          fontSize="sm"
          color="gray.700"
        >
          {formatChangeAmount(row.enrollmentChange, dash)}
        </Text>
      )}
    </VStack>
  );
}

export const ProgramDirectorUpdatesTable = ({
  tableData,
  isLoading,
  handleSort,
  sortOrder,
  variant = 'instrument',
  onRowClick,
}) => {
  const { t } = useTranslation();
  const dash = t('common.emDash');
  const colSpan = variant === 'student' ? 3 : 5;
  return (
    <Box
      position="relative"
      bg="white"
      borderRadius="xl"
      overflow="hidden"
    >
      {tableData.length === 0 && !isLoading ? (
        <EmptyStateBadge variant="no-updates" />
      ) : (
        <TableContainer
          overflowX="auto"
          maxW="100%"
        >
          <Table variant="simple">
            <Thead>
              {variant === 'instrument' ? (
                <Tr>
                  <Th
                    w="60px"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    {t('updates.colFlag')}
                  </Th>
                  <Th
                    onClick={() => handleSort('instrumentName')}
                    cursor="pointer"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    {t('updates.pdColInstrument')}
                    <SortArrows
                      columnKey="instrumentName"
                      sortOrder={sortOrder}
                    />
                  </Th>
                  <Th
                    onClick={() => handleSort('instrumentName')}
                    cursor="pointer"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    {t('updates.pdColChangeAmount')}
                    <SortArrows
                      columnKey="instrumentChange"
                      sortOrder={sortOrder}
                    />
                  </Th>
                  <Th
                    onClick={() => handleSort('note')}
                    cursor="pointer"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    {t('updates.pdColUpdateNote')}
                    <SortArrows
                      columnKey="note"
                      sortOrder={sortOrder}
                    />
                  </Th>
                  <Th
                    onClick={() => handleSort('updateDate')}
                    cursor="pointer"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    {t('updates.pdColDate')}
                    <SortArrows
                      columnKey="updateDate"
                      sortOrder={sortOrder}
                    />
                  </Th>
                </Tr>
              ) : (
                <Tr>
                  <Th
                    onClick={() => handleSort('note')}
                    cursor="pointer"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    {t('updates.pdColUpdateNote')}
                    <SortArrows
                      columnKey="note"
                      sortOrder={sortOrder}
                    />
                  </Th>
                  <Th
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    {t('updates.pdColChangeAmount')}
                  </Th>
                  <Th
                    onClick={() => handleSort('updateDate')}
                    cursor="pointer"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    {t('updates.pdColDate')}
                    <SortArrows
                      columnKey="updateDate"
                      sortOrder={sortOrder}
                    />
                  </Th>
                </Tr>
              )}
            </Thead>
            <Tbody>
              {isLoading && tableData.length === 0 ? (
                <Tr>
                  <Td colSpan={colSpan}>
                    <Center py={8}>
                      <Spinner size="lg" />
                    </Center>
                  </Td>
                </Tr>
              ) : (
                tableData.map((row) => (
                  <Tr
                    key={row.id}
                    _hover={{ bg: 'gray.50' }}
                    cursor={onRowClick ? 'pointer' : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {variant === 'instrument' ? (
                      <>
                        <Td>
                          <Icon
                            as={FiStar}
                            boxSize={4}
                            color={row.flagged ? 'teal.500' : 'gray.300'}
                            fill={row.flagged ? 'teal.500' : 'none'}
                            aria-hidden
                          />
                        </Td>
                        <Td>
                          <Badge
                            bg="gray.100"
                            color="gray.700"
                            borderRadius="full"
                            px={3}
                            py={1}
                            fontSize="xs"
                            fontWeight="500"
                          >
                            {displayInstrumentName(row, dash)}
                          </Badge>
                        </Td>
                        <Td>
                          <Text
                            fontSize="sm"
                            color="gray.700"
                          >
                            {formatChangeAmount(row.instrumentChange, dash)}
                          </Text>
                        </Td>
                        <Td>
                          <Text
                            fontSize="sm"
                            color="gray.700"
                            noOfLines={3}
                          >
                            {row.note || '—'}
                          </Text>
                        </Td>
                        <Td>
                          <Text
                            fontSize="sm"
                            color="gray.700"
                          >
                            {formatTableDate(row.updatedAt)}
                          </Text>
                        </Td>
                      </>
                    ) : (
                      <>
                        <Td>
                          <Text
                            fontSize="sm"
                            color="gray.700"
                            noOfLines={3}
                          >
                            {row.note || '—'}
                          </Text>
                        </Td>
                        <Td>
                          <EnrollmentChangeDetails
                            row={row}
                            dash={dash}
                          />
                        </Td>
                        <Td>
                          <Text
                            fontSize="sm"
                            color="gray.700"
                          >
                            {formatTableDate(row.updatedAt)}
                          </Text>
                        </Td>
                      </>
                    )}
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      {isLoading && tableData.length > 0 && (
        <Box
          position="absolute"
          inset={0}
          bg="whiteAlpha.800"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1}
        >
          <Spinner size="lg" />
        </Box>
      )}
    </Box>
  );
};
