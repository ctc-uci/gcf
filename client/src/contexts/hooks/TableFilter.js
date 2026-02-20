import { useState, useEffect, useRef } from "react";

const OPERATION_FUNCTIONS = {
    contains: (dataVal, filterVal) => dataVal.toLowerCase().includes(filterVal.toLowerCase()),
    equals: (dataVal, filterVal) => dataVal === filterVal,
    does_not_contain: (dataVal, filterVal) => !dataVal.toLowerCase().includes(filterVal.toLowerCase()),
    gt: (dataVal, filterVal) => Number(dataVal) > Number(filterVal),
    lt: (dataVal, filterVal) => Number(dataVal) < Number(filterVal),
    gte: (dataVal, filterVal) => Number(dataVal) >= Number(filterVal),
    lte: (dataVal, filterVal) => Number(dataVal) <= Number(filterVal),
    is: (dataVal, filterVal) => new Date(dataVal).getTime() === new Date(filterVal).getTime(),
    before: (dataVal, filterVal) => new Date(dataVal) < new Date(filterVal),
    after: (dataVal, filterVal) => new Date(dataVal) > new Date(filterVal),
    is_not: (dataVal, filterVal) => dataVal !== filterVal,
}


export function useTableFilter(filters, originalData) {
    const originalDataRef = useRef(originalData);
    originalDataRef.current = originalData;
    const [filteredData, setFilteredData] = useState(originalData);

    useEffect(() => {
        let resultData = [...originalDataRef.current]
        filters.forEach((filter) => {
            const func = OPERATION_FUNCTIONS[filter.operation];
            if (filter.logic === "and") {
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