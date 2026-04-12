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
} from '@chakra-ui/react';

import { EmptyStateBadge } from '@/components/badges/EmptyStateBadge';
import { useTranslation } from 'react-i18next';
import { FiStar } from 'react-icons/fi';

import { SortArrows } from '../../tables/SortArrows';
import { formatTableDate } from '../config/updatesColumnConfig';

/**
 * TODO(program-update-status): Replace placeholder with real resolved/unresolved UI.
 * Wrong approach (removed): mapping `row.status` from `program.status` (Active/Inactive).
 * Per product: resolved = admin/regional director has reviewed the update and approved it
 * for overall stats — not the same as whether the program is "active".
 * Likely source: `program_update.show_on_table` and/or a dedicated approval field; confirm
 * schema + API (`updatesPermissions` program-updates queries, `programUpdate` routes) expose
 * the right boolean/enum, then map to labels (e.g. common.resolved / common.unresolved).
 */
function formatStatus(_row, dash) {
  return (
    <Text
      fontSize="sm"
      color="gray.500"
    >
      {dash}
    </Text>
  );
}

function displayInstrumentName(row, dash) {
  return row.instrumentName || row.title || dash;
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
  const colSpan = variant === 'student' ? 4 : 5;
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
          <Table
            variant="simple"
            sx={{ tableLayout: 'fixed', width: '100%' }}
          >
            {variant === 'instrument' ? (
              <colgroup>
                <col style={{ width: '52px' }} />
                <col style={{ width: '180px' }} />
                <col />
                <col style={{ width: '112px' }} />
                <col style={{ width: '120px' }} />
              </colgroup>
            ) : (
              <colgroup>
                <col style={{ width: '52px' }} />
                <col />
                <col style={{ width: '112px' }} />
                <col style={{ width: '120px' }} />
              </colgroup>
            )}
            <Thead>
              {variant === 'instrument' ? (
                <Tr>
                  <Th
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
                    isNumeric
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    {t('updates.colStatus')}
                  </Th>
                  <Th
                    isNumeric
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
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    {t('updates.colFlag')}
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
                    isNumeric
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    {t('updates.colStatus')}
                  </Th>
                  <Th
                    isNumeric
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
                        <Td
                          verticalAlign="top"
                          sx={{ maxWidth: 0 }}
                        >
                          <Text
                            fontSize="sm"
                            color="gray.700"
                            noOfLines={3}
                          >
                            {row.note || '—'}
                          </Text>
                        </Td>
                        <Td
                          isNumeric
                          verticalAlign="top"
                        >
                          {formatStatus(row, dash)}
                        </Td>
                        <Td
                          isNumeric
                          verticalAlign="top"
                        >
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
                          <Icon
                            as={FiStar}
                            boxSize={4}
                            color={row.flagged ? 'teal.500' : 'gray.300'}
                            fill={row.flagged ? 'teal.500' : 'none'}
                            aria-hidden
                          />
                        </Td>
                        <Td
                          verticalAlign="top"
                          sx={{ maxWidth: 0 }}
                        >
                          <Text
                            fontSize="sm"
                            color="gray.700"
                            noOfLines={3}
                          >
                            {row.note || '—'}
                          </Text>
                        </Td>
                        <Td
                          isNumeric
                          verticalAlign="top"
                        >
                          {formatStatus(row, dash)}
                        </Td>
                        <Td
                          isNumeric
                          verticalAlign="top"
                        >
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
