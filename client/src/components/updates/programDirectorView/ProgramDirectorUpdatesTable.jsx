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
import { FiStar } from 'react-icons/fi';

import { SortArrows } from '../../tables/SortArrows';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

function formatChangeAmount(value) {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n > 0 ? `+${n}` : String(n);
}

function displayInstrumentName(row) {
  return row.instrumentName || row.title || '—';
}

function EnrollmentChangeDetails({ row }) {
  const hasEnrollment = row.enrollmentChange != null;
  if (!hasEnrollment) {
    return (
      <Text
        fontSize="sm"
        color="gray.700"
      >
        —
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
          {formatChangeAmount(row.enrollmentChange)}
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
                    Flag
                  </Th>
                  <Th
                    onClick={() => handleSort('instrumentName')}
                    cursor="pointer"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    Instrument
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
                    Change amount
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
                    Update note
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
                    Date
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
                    Update note
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
                    Change amount
                  </Th>
                  <Th
                    onClick={() => handleSort('updateDate')}
                    cursor="pointer"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    Date
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
                            {displayInstrumentName(row)}
                          </Badge>
                        </Td>
                        <Td>
                          <Text
                            fontSize="sm"
                            color="gray.700"
                          >
                            {formatChangeAmount(row.instrumentChange)}
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
                            {formatDate(row.updateDate)}
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
                          <EnrollmentChangeDetails row={row} />
                        </Td>
                        <Td>
                          <Text
                            fontSize="sm"
                            color="gray.700"
                          >
                            {formatDate(row.updateDate)}
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
