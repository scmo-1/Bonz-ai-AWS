export const isRoomCapEnough = (
  guests,
  { single = 0, double = 0, suite = 0 }
) => {
  const cap = single + double * 2 + suite * 3;
  return parseInt(guests) <= cap;
};
