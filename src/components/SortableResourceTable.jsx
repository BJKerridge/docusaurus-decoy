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
        { header: "Aqueous Liquids", accessorKey: "aqueousLiquids" },
        { header: "Autotrophs", accessorKey: "autotrophs" },
        { header: "Base Metals", accessorKey: "baseMetals" },
        { header: "Carbon Compounds", accessorKey: "carbonCompounds" },
        { header: "Complex Organisms", accessorKey: "complexOrganisms" },
        { header: "Felsic Magma", accessorKey: "felsicMagma" },
        { header: "Heavy Metals", accessorKey: "heavyMetals" },
        { header: "Ionic Solutions", accessorKey: "ionicSolutions" },
        { header: "Micro Organisms", accessorKey: "microOrganisms" },
        { header: "Noble Gas", accessorKey: "nobleGas" },
        { header: "Noble Metals", accessorKey: "nobleMetals" },
        { header: "Non-CS Crystals", accessorKey: "nonCsCrystals" },
        { header: "Planktic Colonies", accessorKey: "plankticColonies" },
        { header: "Reactive Gas", accessorKey: "reactiveGas" },
        { header: "Suspended Plasma", accessorKey: "suspendedPlasma" },
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
                  height: "100px" // give space for rotation
                }}
                onClick={header.column.getToggleSortingHandler()}
              >
                <div
                  style={{
                    transform: "rotate(-75deg)",
                    width: "40px",
                    margin: "10 auto",
                    transformOrigin: "bottom left",
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
