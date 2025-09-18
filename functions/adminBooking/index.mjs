import { fetchBookings } from "../../services/fetchAllBookings.mjs";
import { response } from "../../utils/responses.mjs";

export const handler = async (event) => {
  try {
    const bookings = await fetchBookings();
    return response(200, bookings);
  } catch (error) {
    console.error("adminBooking error:", error);
    return response(500, "Internal Server Error");
  }
};
