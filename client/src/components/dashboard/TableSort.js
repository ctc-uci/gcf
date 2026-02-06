import { useState } from "react";

// enum and map for sorting cycles
const sortCycle = Object.freeze({
  ASCENDING: "DESCENDING",
  DESCENDING: "UNSORTED",
  UNSORTED: "ASCENDING",
});

export function useTableSort(setData) {
  const [unorderedData, setUnorderedData] = useState([]);
  const [sortOrder, setSortOrder] = useState({
    currentSortColumn: null,
    prevSortColumn: {},
  });

  function updatePrevSortColumn(sortOrderCopy, column) {
    // toggle between asc and desc when sorting by a specific column
    // prevSortColumn object doesn't have the keys of all headers initially so need to check if it exists
    if (Object.hasOwn(sortOrderCopy["prevSortColumn"], column)) {
      const newSortOrder =
        sortCycle[sortOrderCopy["prevSortColumn"][column]];
      sortOrderCopy["prevSortColumn"][column] = newSortOrder;
      return newSortOrder;
    } else {
      sortOrderCopy["prevSortColumn"][column] = sortCycle.ASCENDING; // default is ASCENDING
      return sortCycle.ASCENDING;
    }
  }

  function handleSort(column) {
    const sortOrderCopy = { ...sortOrder };
    sortOrderCopy["currentSortColumn"] = column;
    const newSortOrder = updatePrevSortColumn(sortOrderCopy, column);
    setSortOrder(sortOrderCopy);

    if (newSortOrder === sortCycle.UNSORTED) {
      setData(unorderedData);
      return;
    }

    // sort data array
    setData((prevData) =>
      [...prevData].sort((a, b) => {
        if (
          sortOrderCopy["prevSortColumn"][column] === sortCycle.ASCENDING
        ) {
          return a[column].localeCompare(b[column]);
        } else {
          return b[column].localeCompare(a[column]);
        }
      })
    );
  }

  return { unorderedData, setUnorderedData, sortOrder, handleSort };
}
