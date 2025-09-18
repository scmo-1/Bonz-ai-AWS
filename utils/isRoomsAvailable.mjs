export const isRoomsAvailable = async (
  { single = 0, double = 0, suite = 0 },
  allBookings,
  bookingId
) => {
  const bookingTotalRooms = single + double + suite;

  const roomsAlreadyBooked = bookingId
    ? allBookings.filter((booking) => booking.sk !== `ID#${bookingId}`)
    : allBookings;

  const bookedRooms = roomsAlreadyBooked.reduce((sum, booked) => {
    const { single = 0, double = 0, suite = 0 } = booked.rooms || {};
    return sum + single + double + suite;
  }, 0);

  return bookingTotalRooms + bookedRooms <= 20;
};
