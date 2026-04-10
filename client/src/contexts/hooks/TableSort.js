import { useRef, useState } from 'react';

// enum and map for sorting cycles
const sortCycle = Object.freeze({
  ASCENDING: 'DESCENDING',
  DESCENDING: 'UNSORTED',
  UNSORTED: 'ASCENDING',
});

function sortableString(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.join(' ');
  return String(value);
}

export function useTableSort(filteredData, setData) {
  const filteredDataRef = useRef(filteredData);
  filteredDataRef.current = filteredData;

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
      setData([...filteredDataRef.current]);
      return;
    }

    setData((prevData) =>
      [...(prevData ?? filteredDataRef.current)].sort((a, b) => {
        const first = sortableString(a[column]);
        const second = sortableString(b[column]);

        if (sortOrderCopy['prevSortColumn'][column] === sortCycle.ASCENDING) {
          return first.localeCompare(second);
        }
        return second.localeCompare(first);
      })
    );
  }
  return { sortOrder, handleSort };
}
