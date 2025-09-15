import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { response } from "../../utils/responses.mjs";

export const handler = async (event) => {
  if (!event.body) {
    return response(400, "No body in request.");
  }

  try {
    const { name, email, guests, rooms, checkIn, checkOut } = JSON.parse(
      event.body
    );
    const { single, double, suite } = rooms;

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
    /* TODO: Kolla att checkut är senare än checkin */

    /* TODO: Skriv en funktion som kollar att gästerna får plats i rummet och att det finns rum på hotellet */

    const command = new PutItemCommand {
      sk: 
    }
  } catch (error) {
    console.error("Error adding note:", error);

    // AWS errors (if available)
    const awsStatus = error.$metadata?.httpStatusCode;
    if (awsStatus) {
      return sendResponse(awsStatus, error.message);
    }

    // Eventual errors in code or unexpected errors
    return sendResponse(500, "Internal Server Error");
  }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
    }),
  };
};
