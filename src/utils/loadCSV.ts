import csvParse from 'csv-parse';
import fs from 'fs';

interface TransactionDTO {
  title: string;

  value: number;

  type: 'income' | 'outcome';

  category: string;
}

async function loadCSV(filePath: string): Promise<TransactionDTO[]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines:
    | PromiseLike<TransactionDTO[]>
    | { title: any; type: any; value: any; category: any }[] = [];

  parseCSV.on('data', line => {
    lines.push({
      title: line[0],
      type: line[1],
      value: line[2],
      category: line[3],
    });
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

export default loadCSV;
