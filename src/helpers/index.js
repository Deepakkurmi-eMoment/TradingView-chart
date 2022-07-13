export const CalcFiveDigit = (num) => {
  if (num !== undefined) {
    num = num.toString();
    num = num.slice(0, num.indexOf(".") + 6);
    return Number(num);
  } else {
    return 0;
  }
};
