import React, { useState, useEffect } from "react";
import Papa from "papaparse";

export default function SortableResourceTable({ csvPath = '/data/pi-planets.csv' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const loadCSV = async () => {
      try {
        console.log('Attempting to fetch CSV from:', csvPath);
        const response = await fetch(csvPath);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const csvData = await response.text();
        
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
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

            // Convert empty strings to null
            const transformed = results.data.map(row => {
              const newRow = {};
              Object.keys(row).forEach(key => {
                newRow[key] = row[key] === '' ? null : row[key];
              });
              return newRow;
            });
            setData(transformed);
            setLoading(false);
          },
          error: (error) => {
            setError(`CSV parsing error: ${error.message}`);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(`Failed to load CSV: ${err.message}`);
        setLoading(false);
      }
    };

    loadCSV();
  }, [csvPath]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    // Handle nulls - always put at end
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Compare values
    let comparison = 0;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else {
      // Check if this is a planet name column (contains " - " and Roman numerals)
      const aStr = String(aVal);
      const bStr = String(bVal);
      
      if (aStr.includes(' - ') && bStr.includes(' - ')) {
        const aParts = aStr.split(' - ');
        const bParts = bStr.split(' - ');
        
        // Compare system names first
        const systemComp = aParts[0].localeCompare(bParts[0]);
        if (systemComp !== 0) {
          comparison = systemComp;
        } else {
          // Same system, compare by Roman numeral
          const aRoman = aParts[1] || '';
          const bRoman = bParts[1] || '';
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
          comparison = romanToInt(aRoman) - romanToInt(bRoman);
        }
      } else {
        comparison = aStr.localeCompare(bStr);
      }
    }

    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  if (loading) return <div>Loading data...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (data.length === 0) return <div>No data available</div>;

  const columns = Object.keys(data[0]);

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={col}
              onClick={() => handleSort(col)}
              style={{
                cursor: "pointer",
                borderBottom: "1px solid #ccc",
                padding: "8px 0px",
                verticalAlign: "bottom",
                textAlign: "center",
                whiteSpace: "nowrap",
                height: "165px",
                backgroundColor: sortConfig.key === col ? "#127250" : "transparent"
              }}
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
                {col}
                {sortConfig.key === col && (
                  <span>{sortConfig.direction === 'asc' ? ' ▶' : ' ◀'}</span>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, idx) => (
          <tr key={idx}>
            {columns.map(col => (
              <td
                key={`${idx}-${col}`}
                style={{ padding: "4px 8px", textAlign: "center", borderBottom: "1px solid #eee" }}
              >
                {row[col] === null ? '' : row[col]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}