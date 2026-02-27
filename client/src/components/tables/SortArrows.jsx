import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, VStack } from '@chakra-ui/react';

const SORT_ARROW_OPACITY_FADED = 0.35;

export function SortArrows({ columnKey, sortOrder }) {
  const { currentSortColumn, prevSortColumn } = sortOrder;
  const isActive = currentSortColumn === columnKey;
  const stored = prevSortColumn[columnKey];
  const upHighlight = isActive && stored === 'DESCENDING';
  const downHighlight = isActive && stored === 'UNSORTED';
  return (
    <VStack
      as="span"
      spacing={0}
      ml={1}
      display="inline-flex"
      verticalAlign="middle"
    >
      <Box
        as={ChevronUpIcon}
        boxSize={3}
        opacity={upHighlight ? 1 : SORT_ARROW_OPACITY_FADED}
        aria-hidden
      />
      <Box
        as={ChevronDownIcon}
        boxSize={3}
        mt={-1}
        opacity={downHighlight ? 1 : SORT_ARROW_OPACITY_FADED}
        aria-hidden
      />
    </VStack>
  );
}
