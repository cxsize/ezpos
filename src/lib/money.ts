export const fmtTHB = (n: number) =>
  '฿' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const fmtTHB2 = (n: number) =>
  '฿' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
