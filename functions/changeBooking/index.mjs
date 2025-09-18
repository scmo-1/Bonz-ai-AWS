import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { fetchBookings } from "../../services/fetchAllBookings.mjs";
import { response } from "../../utils/responses.mjs";
import { isRoomCapEnough } from "../../utils/isRoomCapEnough.mjs";
import { isRoomsAvailable } from "../../utils/isRoomsAvailable.mjs";

export const handler = async (event) => {
  const bookingId = event.pathParameters.bookingId;
  if (!bookingId) {
    return response(400, "ID must be provided");
  }

  if (!event.body) {
    return response(400, "No body in request.");
  }

  try {
    /* Check that body has all fieldss */
    const { name, email, guests, rooms, checkIn, checkOut } = JSON.parse(
      event.body
    );

    if (!name || !email || !guests || !rooms || !checkIn || !checkOut) {
      return response(
        400,
        "Body must contain 'name', 'email', 'guests' (number of guests), 'rooms', 'checkin' (date) and 'checkout' (date)"
      );
    }

    /* Check name lenght */
    if (name.trim().length < 2) {
      return response(400, "'Name' not provided");
    }

    /* Check if any rooms are chosen and if they are integers*/

    let single = rooms.single ? Number(rooms.single) : 0;
    let double = rooms.double ? Number(rooms.double) : 0;
    let suite = rooms.suite ? Number(rooms.suite) : 0;

    if (
      isNaN(single) ||
      isNaN(double) ||
      isNaN(suite) ||
      !Number.isInteger(single) ||
      !Number.isInteger(double) ||
      !Number.isInteger(suite)
    ) {
      return response(400, "All room inputs must be positive integers.");
    }

    if (single < 1 && double < 1 && suite < 1) {
      return response(400, "At least one room must be > 0.");
    }

    if (single < 0 || double < 0 || suite < 0) {
      return response(400, "No rooms may be a negative number");
    }

    /* Check if 'guests' is a valid number */
    let guestsNumber = Number(guests);
    if (
      isNaN(guestsNumber) ||
      !Number.isInteger(guestsNumber) ||
      guestsNumber < 1
    ) {
      return response(400, "'Guests' must be a positive integer");
    }

    /* Compare guests with room capacity */
    if (!isRoomCapEnough(guestsNumber, { single, double, suite })) {
      return response(
        400,
        "The amount of guests doesn't fit in the chosen room constellation."
      );
    }

    /* Check valid email format */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return response(400, "Invalid email.");
    }

    /* Check checkout times and price */
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return response(400, "Invalid check-in or check-out date.");
    }

    const nights =
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24);

    if (nights < 1) {
      return response(
        400,
        "Checkout date must be set later than check-in date."
      );
    }

    const totalPrice = (single * 500 + double * 1000 + suite * 1500) * nights;

    /* Fetch previous bookings */
    const allBookings = await fetchBookings();

    /* See if booking exists in database */
    if (!allBookings.some((booking) => booking.sk === `ID#${bookingId}`)) {
      return response(404, "No booking with that id found.");
    }

    /* Check availability  */
    const roomsAvailable = await isRoomsAvailable(
      { single, double, suite },
      allBookings,
      bookingId
    );
    if (!roomsAvailable) {
      return response(409, "The requested amount of rooms is not available.");
    }

    const command = new PutItemCommand({
      TableName: "bonzAiTable",
      Item: {
        pk: { S: "BOOKING" },
        sk: { S: `ID#${bookingId}` },
        name: { S: name },
        email: { S: email },
        guests: { N: guestsNumber.toString() },
        checkIn: { S: checkIn },
        checkOut: { S: checkOut },
        rooms: {
          M: {
            single: { N: single.toString() },
            double: { N: double.toString() },
            suite: { N: suite.toString() },
          },
        },
        price: { N: totalPrice.toString() },
      },
    });

    await client.send(command);

    /* Skicka svar */
    let roomsBooked = {};
    [single, double, suite].forEach((room, idx) => {
      if (room > 0) {
        const type = ["single", "double", "suite"][idx];
        roomsBooked[type] = Number(room);
      }
    });

    const bookingResponse = {
      message: `Booking ${bookingId} updated successfully`,
      bookingId,
      name,
      guests: guestsNumber,
      roomsBooked,
      checkIn,
      checkOut,
      totalPrice: totalPrice + " :-",
    };

    return response(200, bookingResponse);
  } catch (error) {
    console.error("Error:", error);

    const awsStatus = error.$metadata?.httpStatusCode;
    if (awsStatus) {
      return response(awsStatus, error.message);
    }

    return response(500, "Internal Server Error");
  }
};
