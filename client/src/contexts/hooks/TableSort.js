import { useRef, useState } from 'react';

// enum and map for sorting cycles
const sortCycle = Object.freeze({
  ASCENDING: 'DESCENDING',
  DESCENDING: 'UNSORTED',
  UNSORTED: 'ASCENDING',
});

export function useTableSort(originalData, setData) {
  const originalDataRef = useRef(originalData);
  originalDataRef.current = originalData;

  const [sortOrder, setSortOrder] = useState({
    currentSortColumn: null,
    prevSortColumn: {},
  });

  function updatePrevSortColumn(sortOrderCopy, column) {
    if (Object.hasOwn(sortOrderCopy['prevSortColumn'], column)) {
      const newSortOrder = sortCycle[sortOrderCopy['prevSortColumn'][column]];
      sortOrderCopy['prevSortColumn'][column] = newSortOrder;
      return newSortOrder;
    } else {
      sortOrderCopy['prevSortColumn'][column] = sortCycle.ASCENDING;
      return sortCycle.ASCENDING;
    }
  }

  function handleSort(column) {
    const sortOrderCopy = { ...sortOrder };
    sortOrderCopy['currentSortColumn'] = column;
    const newSortOrder = updatePrevSortColumn(sortOrderCopy, column);
    setSortOrder(sortOrderCopy);

    if (newSortOrder === sortCycle.UNSORTED) {
      setData([...originalDataRef.current]);
      return;
    }

    setData((prevData) =>
      [...prevData].sort((a, b) => {
        let first = a[column];
        let second = b[column];

        if (Array.isArray(first) && Array.isArray(second)) {
          first = first.join(' ');
          second = second.join(' ');
        }

        if (sortOrderCopy['prevSortColumn'][column] === sortCycle.ASCENDING) {
          return first.localeCompare(second);
        } else {
          return second.localeCompare(first);
        }
      })
    );
  }
  return { sortOrder, handleSort };
}
