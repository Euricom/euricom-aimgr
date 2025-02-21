import Table from 'cli-table3';
import { consola } from 'consola';
import invariant from 'tiny-invariant';

interface TableRow {
  [key: string]: string | number;
}

export function displayTable(data: TableRow[]) {
  invariant(Array.isArray(data), 'Input must be an array');

  // Get headers from first item
  const headers = Object.keys(data[0] || {});

  const table = new Table({
    head: headers,
    style: { head: ['cyan'] },
  });

  // For each row, extract values in the same order as headers
  data.forEach(row => {
    table.push(headers.map(header => row[header]));
  });

  consola.log(table.toString());
}
