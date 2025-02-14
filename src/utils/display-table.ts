import Table from 'cli-table3';
import { consola } from 'consola';

export function displayTable(headers: string[], data: any[]) {
  const table = new Table({
    head: headers,
    style: { head: ['cyan'] },
  });

  data.forEach(row => table.push(row));

  consola.log(table.toString());
}
