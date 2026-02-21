import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Select,
  Text,
  VStack
} from "@chakra-ui/react";

import { HiOutlineTrash } from "react-icons/hi2";

const OPERATIONS = {
  text: [
    { label: "contains", value: "contains" },
    { label: "equal to", value: "equals" },
    { label: "does not contain", value: "does_not_contain" },
  ],
  number: [
    { label: "equal to", value: "equals" },
    { label: "greater than", value: "gt" },
    { label: "less than", value: "lt" },
    { label: "greater than or equal", value: "gte" },
    { label: "less than or equal", value: "lte" },
  ],
  date: [
    { label: "is", value: "is" },
    { label: "before", value: "before" },
    { label: "after", value: "after" },
  ],
  select: [
    { label: "is", value: "equals" },
    { label: "is not", value: "is_not" },
  ],
  list: [
  { label: "contains", value: "contains_item" },
],
};

  function FilterComponent({ columns = [], onFilterChange }) {
    const createDefaultFilter = () => {
      const defaultCol = columns[0];
      const defaultOps = defaultCol
        ? OPERATIONS[defaultCol.type] || OPERATIONS.text
        : OPERATIONS.text;

      return {
        id: crypto.randomUUID(),
        logic: "and", // Used for rows > 0
        column: defaultCol?.key || "",
        operation: defaultOps[0]?.value || "",
        value: "",
      };
    };

    const [filters, setFilters] = useState([]);

    useEffect(() => {
      if (onFilterChange) {
        onFilterChange(filters);
      }
    }, [filters, onFilterChange]);

    const addFilter = () => {
      setFilters([...filters, createDefaultFilter()]);
    };

  const removeFilter = (id) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id, field, newValue) => {
    setFilters(
      filters.map((filter) => {
        if (filter.id !== id) return filter;

        const updatedFilter = { ...filter, [field]: newValue };

        if (field === "column") {
          const selectedCol = columns.find((c) => c.key === newValue);
          const availableOps = selectedCol
            ? OPERATIONS[selectedCol.type] || OPERATIONS.text
            : OPERATIONS.text;

          updatedFilter.operation = availableOps[0]?.value || "";
          updatedFilter.value = "";
        }

        return updatedFilter;
      })
    );
  };

  const renderInput = (filter) => {
    const columnConfig = columns.find((c) => c.key === filter.column);
    if (!columnConfig)
      return (
        <Input
          flex="1"
          disabled
        />
      );

    switch (columnConfig.type) {
      case "select":
        return (
          <Select
            flex="1"
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
          >
            <option value="">Select option...</option>
            {columnConfig.options?.map((opt) => (
              <option
                key={opt}
                value={opt}
              >
                {opt}
              </option>
            ))}
          </Select>
        );
      case "date":
        return (
          <Input
            flex="1"
            type="date"
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
          />
        );
      case "number":
        return (
          <Input
            flex="1"
            type="number"
            placeholder="0"
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
          />
        );
      case "text":
      default:
        return (
          <Input
            flex="1"
            type="text"
            placeholder="Enter value..."
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
          />
        );
    }
  };

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      bg="white"
      shadow="sm"
    >
      <VStack
        alignItems="stretch"
        spacing={4}
      >
        <Text
          color="gray.600"
          fontSize="sm"
        >
          In this view, show records
        </Text>

        <VStack
          alignItems="stretch"
          spacing={3}
        >
          {filters.map((filter, index) => {
            const selectedCol = columns.find((c) => c.key === filter.column);
            const availableOps = selectedCol
              ? OPERATIONS[selectedCol.type] || OPERATIONS.text
              : OPERATIONS.text;

            return (
              <HStack
                key={filter.id}
                spacing={3}
              >
                <Box
                  w="100px"
                  flexShrink={0}
                >
                  {index === 0 ? (
                    <Text
                      fontWeight="medium"
                      pl={2}
                    >
                      Where
                    </Text>
                  ) : (
                    <Select
                      size="md"
                      value={filter.logic}
                      onChange={(e) =>
                        updateFilter(filter.id, "logic", e.target.value)
                      }
                    >
                      <option value="and">And</option>
                      <option value="or">Or</option>
                    </Select>
                  )}
                </Box>

                <Select
                  flex="1"
                  value={filter.column}
                  onChange={(e) =>
                    updateFilter(filter.id, "column", e.target.value)
                  }
                >
                  {columns.map((col) => (
                    <option
                      key={col.key}
                      value={col.key}
                    >
                      {col.key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </option>
                  ))}
                </Select>

                <Select
                  flex="1"
                  value={filter.operation}
                  onChange={(e) =>
                    updateFilter(filter.id, "operation", e.target.value)
                  }
                >
                  {availableOps.map((op) => (
                    <option
                      key={op.value}
                      value={op.value}
                    >
                      {op.label}
                    </option>
                  ))}
                </Select>

                {renderInput(filter)}

                <IconButton
                  aria-label="Remove filter"
                  icon={<HiOutlineTrash size={20} />}
                  variant="ghost"
                  colorScheme="gray"
                  color="gray.400"
                  _hover={{ color: "red.500", bg: "red.50" }}
                  onClick={() => removeFilter(filter.id)}
                  title="Remove filter"
                />
              </HStack>
            );
          })}
        </VStack>

        <Box pt={2}>
          <Button
            variant="ghost"
            size="sm"
            colorScheme="blue"
            onClick={addFilter}
          >
            + Add Filter
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}

export { FilterComponent };
