// Custom sorting function that handles nulls properly
const numericSortWithNulls = (rowA, rowB, columnId) => {
  const aVal = rowA.getValue(columnId);
  const bVal = rowB.getValue(columnId);

  // Both null - maintain order
  if (aVal == null && bVal == null) return 0;
  
  // One is null - put it at the end (return positive to push to end)
  if (aVal == null) return 1;
  if (bVal == null) return -1;

  // Both have values - reverse comparison so descending works correctly
  return bVal - aVal;
};

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender
} from "@tanstack/react-table";


// Convert Roman numerals to integers for sorting
const romanToInt = (roman) => {
  const map = {I:1, V:5, X:10, L:50, C:100, D:500, M:1000};
  let total = 0;
  let prev = 0;

  roman.split("").reverse().forEach(char => {
    const value = map[char];
    if (value < prev) total -= value;
    else total += value;
    prev = value;
  });
  return total;
};

export default function SortableResourceTable({ data }) {
    const columns = [
        {
          header: "System / Planet",
          accessorKey: "systemPlanet",
          sortingFn: (a, b) =>
            romanToInt(a.original.planet) - romanToInt(b.original.planet),
        },
        { header: "Type", accessorKey: "type" },
        { header: "Aqueous Liquids", accessorKey: "aqueousLiquids", sortingFn: numericSortWithNulls },
        { header: "Autotrophs", accessorKey: "autotrophs", sortingFn: numericSortWithNulls },
        { header: "Base Metals", accessorKey: "baseMetals", sortingFn: numericSortWithNulls },
        { header: "Carbon Compounds", accessorKey: "carbonCompounds", sortingFn: numericSortWithNulls },
        { header: "Complex Organisms", accessorKey: "complexOrganisms", sortingFn: numericSortWithNulls },
        { header: "Felsic Magma", accessorKey: "felsicMagma", sortingFn: numericSortWithNulls },
        { header: "Heavy Metals", accessorKey: "heavyMetals", sortingFn: numericSortWithNulls },
        { header: "Ionic Solutions", accessorKey: "ionicSolutions", sortingFn: numericSortWithNulls },
        { header: "Micro Organisms", accessorKey: "microOrganisms", sortingFn: numericSortWithNulls },
        { header: "Noble Gas", accessorKey: "nobleGas", sortingFn: numericSortWithNulls },
        { header: "Noble Metals", accessorKey: "nobleMetals", sortingFn: numericSortWithNulls },
        { header: "Non-CS Crystals", accessorKey: "nonCsCrystals", sortingFn: numericSortWithNulls },
        { header: "Planktic Colonies", accessorKey: "plankticColonies", sortingFn: numericSortWithNulls },
        { header: "Reactive Gas", accessorKey: "reactiveGas", sortingFn: numericSortWithNulls },
        { header: "Suspended Plasma", accessorKey: "suspendedPlasma", sortingFn: numericSortWithNulls },
      ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        {table.getHeaderGroups().map(hg => (
          <tr key={hg.id}>
            {hg.headers.map(header => (
              <th
                key={header.id}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid #ccc",
                  padding: "8px 0px",
                  verticalAlign: "bottom", // aligns rotated text nicely
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  height: "165px" // give space for rotation
                }}
                onClick={header.column.getToggleSortingHandler()}
              >
                <div
                  style={{
                    transform: "rotate(-90deg)",
                    width: "40px",
                    margin: "10 auto",
                    padding: "3px",
                    transformOrigin: "bottom middle",
                    display: "inline-block"
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: " ▲",
                    desc: " ▼"
                  }[header.column.getIsSorted()] ?? ""}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id} style={{ padding: "4px 8px", textAlign: "center" }}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
  
}