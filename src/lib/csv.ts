/**
 * CSV 다운로드 유틸리티
 * - BOM(\uFEFF) 추가: 한글 깨짐 없이 Excel에서 열리도록
 * - 셀 값에 쉼표·따옴표 포함 시 자동 이스케이프
 */
export function downloadCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const escape = (val: string | number) =>
    `"${String(val).replace(/"/g, '""')}"`;

  const content = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
