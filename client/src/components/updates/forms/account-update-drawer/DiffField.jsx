import { Box, HStack, Text } from '@chakra-ui/react';

export const DiffField = ({
  label,
  oldValue,
  newValue,
  changeType,
  hasChangeOverride,
}) => {
  const oldStr = oldValue ?? '';
  const newStr = newValue ?? '';
  const isCreation = changeType === 'Creation';

  if (isCreation) {
    if (!newStr) return null;
    return (
      <Box>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          {label}
        </Text>
        <Text>{newStr}</Text>
      </Box>
    );
  }

  if (!oldStr && !newStr && hasChangeOverride !== true) return null;

  const hasChange =
    typeof hasChangeOverride === 'boolean'
      ? hasChangeOverride
      : String(oldStr) !== String(newStr);

  return (
    <Box>
      <Text
        color="teal.500"
        fontSize="sm"
        fontWeight="500"
        mb={1}
      >
        {label}
      </Text>
      {hasChange ? (
        <HStack
          spacing={2}
          align="baseline"
          flexWrap="wrap"
        >
          {oldStr ? (
            <Text
              as="span"
              textDecoration="line-through"
              color="gray.500"
            >
              {oldStr}
            </Text>
          ) : null}
          {newStr ? <Text as="span">{newStr}</Text> : null}
        </HStack>
      ) : (
        <Text>{newStr || oldStr}</Text>
      )}
    </Box>
  );
};
