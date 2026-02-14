import { parse } from "csv-parse";

export function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];

    const parser = parse({
      columns: header => header.map(h => String(h).trim()),
      trim: true,
      skip_empty_lines: true,
      bom: true
    });

    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        // Skip records that are completely empty after trimming
        const hasAnyValue = Object.values(record).some(v => String(v ?? "").trim() !== "");
        if (hasAnyValue) rows.push(record);
      }
    });

    parser.on("error", reject);
    parser.on("end", () => resolve(rows));

    parser.write(buffer);
    parser.end();
  });
}
