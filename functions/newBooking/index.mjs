import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { response } from "../../utils/responses.mjs";
import { v4 as uuid } from "uuid";

export const handler = async (event) => {
  if (!event.body) {
    return response(400, "No body in request.");
  }

  try {
    const { name, email, guests, rooms, checkIn, checkOut } = JSON.parse(
      event.body
    );
    const { single = 0, double = 0, suite = 0 } = rooms;

    if (!name || !email || !guests || !rooms || !checkIn || !checkOut) {
      return response(
        400,
        "Body must contain 'name', 'email', 'guests' (number of guests), 'rooms', 'checkin' (date) and 'checkout' (date)"
      );
    }
    if (
      Number.parseInt(single) < 1 &&
      Number.parseInt(double) < 1 &&
      Number.parseInt(suite) < 1
    )
      return response(400, "At least one room must be > 0.");

    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response(400, "Invalid email.");
    }
    /* TODO: Kolla att checkut är senare än checkin + formatet på datumet YYYY-MM-DD */

    /* TODO: Skriv en funktion som kollar att gästerna får plats i rummet och att det finns rum på hotellet */

    const bookingId = uuid().substring(0, 8);

    const nights =
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24);
    const totalPrice =
      (rooms.single * 500 + rooms.double * 1000 + rooms.suite * 1500) * nights;

    console.log("rooms:", rooms);

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
            single: { N: rooms.single.toString() },
            double: { N: rooms.double.toString() },
            suite: { N: rooms.suite.toString() },
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
