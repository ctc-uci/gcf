import { useState, useEffect, useRef } from "react";

const str = (v) => (v ?? "").toString();

const OPERATION_FUNCTIONS = {
  contains: (dataVal, filterVal) => str(dataVal).toLowerCase().includes(str(filterVal).toLowerCase()),
  does_not_contain: (dataVal, filterVal) => !str(dataVal).toLowerCase().includes(str(filterVal).toLowerCase()),
  equals: (dataVal, filterVal) => dataVal === filterVal,
  is_not: (dataVal, filterVal) => dataVal !== filterVal,
  gt: (dataVal, filterVal) => Number(dataVal) > Number(filterVal),
  lt: (dataVal, filterVal) => Number(dataVal) < Number(filterVal),
  gte: (dataVal, filterVal) => Number(dataVal) >= Number(filterVal),
  lte: (dataVal, filterVal) => Number(dataVal) <= Number(filterVal),
  is: (dataVal, filterVal) => new Date(dataVal).getTime() === new Date(filterVal).getTime(),
  before: (dataVal, filterVal) => new Date(dataVal) < new Date(filterVal),
  after: (dataVal, filterVal) => new Date(dataVal) > new Date(filterVal),
  contains_item: (dataVal, filterVal) => Array.isArray(dataVal) && dataVal.includes(filterVal),
};


export function useTableFilter(filters, originalData) {
    const originalDataRef = useRef(originalData);
    originalDataRef.current = originalData;
    const [filteredData, setFilteredData] = useState(originalData);

    useEffect(() => {
        let resultData = [...originalDataRef.current]
        filters.forEach((filter, index) => {
            const func = OPERATION_FUNCTIONS[filter.operation];
            if (filter.logic === "and" || index === 0) {
                resultData = resultData.filter((row) => {
                    const dataVal = row[filter.column];
                    return func(dataVal, filter.value);
                });
            }
            else {
                const orResultData = originalDataRef.current.filter((row) => {
                    const dataVal = row[filter.column];
                    return func(dataVal, filter.value);
                });
                resultData = [...new Set([...resultData, ...orResultData])]
            }
        });
        setFilteredData(resultData);
    }, [filters, originalData])
    return filteredData;
}