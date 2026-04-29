import { useEffect, useRef, useState } from 'react';

const str = (v) => (v ?? '').toString();

const OPERATION_FUNCTIONS = {
  contains: (dataVal, filterVal) =>
    str(dataVal).toLowerCase().includes(str(filterVal).toLowerCase()),
  does_not_contain: (dataVal, filterVal) =>
    !str(dataVal).toLowerCase().includes(str(filterVal).toLowerCase()),
  equals: (dataVal, filterVal) => dataVal === filterVal,
  is_not: (dataVal, filterVal) => dataVal !== filterVal,
  gt: (dataVal, filterVal) => Number(dataVal) > Number(filterVal),
  lt: (dataVal, filterVal) => Number(dataVal) < Number(filterVal),
  gte: (dataVal, filterVal) => Number(dataVal) >= Number(filterVal),
  lte: (dataVal, filterVal) => Number(dataVal) <= Number(filterVal),
  is: (dataVal, filterVal) =>
    new Date(dataVal).toISOString().slice(0, 10) ===
    new Date(filterVal).toISOString().slice(0, 10),
  before: (dataVal, filterVal) =>
    new Date(dataVal).toISOString().slice(0, 10) <
    new Date(filterVal).toISOString().slice(0, 10),
  after: (dataVal, filterVal) =>
    new Date(dataVal).toISOString().slice(0, 10) >
    new Date(filterVal).toISOString().slice(0, 10),
  contains_item: (dataVal, filterVal) =>
    dataVal.some((item) =>
      str(item).toLowerCase().includes(str(filterVal).toLowerCase())
    ),
};

export function applyFilters(filters, data) {
  if (!filters.length) return data;
  let resultData = [...data];
  filters.forEach((filter, index) => {
    if (!filter.value) return;
    const func = OPERATION_FUNCTIONS[filter.operation];
    if (filter.logic === 'and' || index === 0) {
      resultData = resultData.filter((row) => {
        const dataVal = row[filter.column];
        return func(dataVal, filter.value);
      });
    } else {
      const orResultData = data.filter((row) => {
        const dataVal = row[filter.column];
        return func(dataVal, filter.value);
      });
      resultData = [...new Set([...resultData, ...orResultData])];
    }
  });
  return resultData;
}
