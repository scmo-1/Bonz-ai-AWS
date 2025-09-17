import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
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
    /* Check if any rooms are chosen*/
    let single = parseInt(rooms.single);
    let double = parseInt(rooms.double);
    let suite = parseInt(rooms.suite);

    // If parseInt failed (NaN) → default to 0
    single = Number.isNaN(single) ? 0 : single;
    double = Number.isNaN(double) ? 0 : double;
    suite = Number.isNaN(suite) ? 0 : suite;

    if (single < 1 && double < 1 && suite < 1) {
      return response(400, "At least one room must be > 0.");
    }

    /* Compare guests with room capacity */
    if (!isRoomCapEnough(guests, { single, double, suite })) {
      return response(
        400,
        "The amount of guests doesn't fit in the chosen room constellation."
      );
    }

    /* Check valid email format */
    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response(400, "Invalid email.");
    }

    /* Check checkout times and price */
    const nights =
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24);
    const totalPrice = (single * 500 + double * 1000 + suite * 1500) * nights;

    if (nights < 1) {
      return response(
        400,
        "Checkout date must be set later than check in date."
      );
    }
    /* Check availability  */
    const roomsAvailable = await isRoomsAvailable({ single, double, suite });
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
        guests: { N: guests.toString() },
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
      guests,
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
