import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { response } from "../../utils/responses.mjs";
import { isRoomCapEnough } from "../../utils/isRoomCapEnough.mjs";
import { v4 as uuid } from "uuid";

export const handler = async (event) => {
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
    const single = rooms.single || 0;
    const double = rooms.double || 0;
    const suite = rooms.suite || 0;

    if (
      Number.parseInt(single) < 1 &&
      Number.parseInt(double) < 1 &&
      Number.parseInt(suite) < 1
    ) {
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

    /* TODO: Skapa/implementera kolla-hotellkapacitets-funktion */

    /* Create booking */
    const bookingId = uuid().substring(0, 8);

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

    return response(200, command);
  } catch (error) {
    console.error("Error:", error);

    const awsStatus = error.$metadata?.httpStatusCode;
    if (awsStatus) {
      return response(awsStatus, error.message);
    }

    return response(500, "Internal Server Error");
  }
};
