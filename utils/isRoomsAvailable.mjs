import { fetchBookings } from "../services/fetchAllBookings.mjs";

export const isRoomsAvailable = async ({
  single = 0,
  double = 0,
  suite = 0,
}) => {
  const bookingTotalRooms = single + double + suite;

  const roomsAlreadyBooked = await fetchBookings();

  const bookedRooms = roomsAlreadyBooked.reduce((sum, booked) => {
    const { single = 0, double = 0, suite = 0 } = booked.rooms || {};
    return sum + single + double + suite;
  }, 0);

  return bookingTotalRooms + bookedRooms <= 20;
};
