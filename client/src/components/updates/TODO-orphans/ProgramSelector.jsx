import { FormControl, FormLabel, Select, Text } from '@chakra-ui/react';

export const ProgramSelector = ({ availablePrograms, programId, onChange }) => {
  if (availablePrograms.length <= 1) return null;

  return (
    <FormControl>
      <FormLabel fontWeight="semibold">
        Program{' '}
        <Text
          as="span"
          color="red.500"
        >
          *
        </Text>
      </FormLabel>
      <Select
        placeholder="Select Program"
        value={programId}
        onChange={(e) => onChange(e.target.value)}
        borderColor="gray.100"
      >
        {availablePrograms.map((program) => (
          <option
            key={program.id}
            value={program.id}
          >
            {program.name}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};
