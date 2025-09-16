export const isRoomCapEnough = (
  guests,
  { single = 0, double = 0, suite = 0 }
) => {
  const cap = parseInt(single) + parseInt(double) * 2 + parseInt(suite) * 3;
  return parseInt(guests) <= cap;
};
