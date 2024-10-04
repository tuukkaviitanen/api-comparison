export const hasAtMostTwoDecimals = (number: number) =>
  (number * 100) % 1 === 0;
