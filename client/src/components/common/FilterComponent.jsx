import React, { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { HiOutlineTrash } from 'react-icons/hi2';

function FilterComponent({ columns = [], onFilterChange }) {
  const { t } = useTranslation();

  const operations = useMemo(
    () => ({
      text: [
        { label: t('filter.ops.contains'), value: 'contains' },
        { label: t('filter.ops.equals'), value: 'equals' },
        { label: t('filter.ops.doesNotContain'), value: 'does_not_contain' },
      ],
      number: [
        { label: t('filter.ops.equals'), value: 'equals' },
        { label: t('filter.ops.gt'), value: 'gt' },
        { label: t('filter.ops.lt'), value: 'lt' },
        { label: t('filter.ops.gte'), value: 'gte' },
        { label: t('filter.ops.lte'), value: 'lte' },
      ],
      date: [
        { label: t('filter.ops.is'), value: 'is' },
        { label: t('filter.ops.before'), value: 'before' },
        { label: t('filter.ops.after'), value: 'after' },
      ],
      select: [
        { label: t('filter.ops.is'), value: 'equals' },
        { label: t('filter.ops.isNot'), value: 'is_not' },
      ],
      list: [{ label: t('filter.ops.containsItem'), value: 'contains_item' }],
    }),
    [t]
  );

  const createDefaultFilter = () => {
    const defaultCol = columns[0];
    const defaultOps = defaultCol
      ? operations[defaultCol.type] || operations.text
      : operations.text;

    return {
      id: crypto.randomUUID(),
      logic: 'and', // Used for rows > 0
      column: defaultCol?.key || '',
      operation: defaultOps[0]?.value || '',
      value: '',
    };
  };

  const [filters, setFilters] = useState([]);
  const lastFilter = filters[filters.length - 1];
  const isLastFilterIncomplete = lastFilter && lastFilter.value === '';

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

        if (field === 'column') {
          const selectedCol = columns.find((c) => c.key === newValue);
          const availableOps = selectedCol
            ? operations[selectedCol.type] || operations.text
            : operations.text;

          updatedFilter.operation = availableOps[0]?.value || '';
          updatedFilter.value = '';
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
      case 'select':
        return (
          <Select
            flex="1"
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
          >
            <option value="">{t('common.selectOption')}</option>
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
      case 'date':
        return (
          <Input
            flex="1"
            type="date"
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            flex="1"
            type="number"
            placeholder={t('filter.numberPlaceholder')}
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
          />
        );
      case 'text':
      default:
        return (
          <Input
            flex="1"
            type="text"
            placeholder={t('common.enterValue')}
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
          />
        );
      case 'list':
        return (
          <Input
            flex="1"
            type="text"
            placeholder={t('common.enterValue')}
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
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
          {t('common.recordsHint')}
        </Text>

        <VStack
          alignItems="stretch"
          spacing={3}
        >
          {filters.map((filter, index) => {
            const selectedCol = columns.find((c) => c.key === filter.column);
            const availableOps = selectedCol
              ? operations[selectedCol.type] || operations.text
              : operations.text;

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
                      {t('common.where')}
                    </Text>
                  ) : (
                    <Select
                      size="md"
                      value={filter.logic}
                      onChange={(e) =>
                        updateFilter(filter.id, 'logic', e.target.value)
                      }
                    >
                      <option value="and">{t('common.and')}</option>
                      <option value="or">{t('common.or')}</option>
                    </Select>
                  )}
                </Box>

                <Select
                  flex="1"
                  value={filter.column}
                  onChange={(e) =>
                    updateFilter(filter.id, 'column', e.target.value)
                  }
                >
                  {columns.map((col) => (
                    <option
                      key={col.key}
                      value={col.key}
                    >
                      {col.key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())}
                    </option>
                  ))}
                </Select>

                <Select
                  flex="1"
                  value={filter.operation}
                  onChange={(e) =>
                    updateFilter(filter.id, 'operation', e.target.value)
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
                  aria-label={t('common.filterRemove')}
                  icon={<HiOutlineTrash size={20} />}
                  variant="ghost"
                  colorScheme="gray"
                  color="gray.400"
                  _hover={{ color: 'red.500', bg: 'red.50' }}
                  onClick={() => removeFilter(filter.id)}
                  title={t('common.filterRemove')}
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
            isDisabled={isLastFilterIncomplete}
          >
            {t('common.addFilter')}
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}

export { FilterComponent };
