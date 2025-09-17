//Avboka

import { ddbDocClient } from "../../services/db.mjs";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import responses from "../../utils/responses.mjs";

export async function handler(event) {
  try {
    const bookingId = event.pathParameters?.bookingId;
    if (!bookingId) {
      return responses._400({ message: "Missing bookingId in path" });
    }

    const params = {
      TableName: process.env.BOOKINGS_TABLE,
      Key: { bookingId },
      ConditionExpression: "attribute_exists(bookingId)", // ensures we only delete if it exists
      ReturnValues: "ALL_OLD", // return deleted item
    };

    const result = await ddbDocClient.send(new DeleteCommand(params));

    return responses._200({
      message: "Booking cancelled successfully",
      deletedBooking: result.Attributes ?? null,
    });
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return responses._404({ message: "Booking not found" });
    }

    console.error("DeleteBooking error:", err);
    return responses._500({ message: "Internal server error" });
  }
}
