import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { client } from "../../services/db.mjs";
import { response } from "../../utils/responses.mjs";

export async function handler(event) {
  try {
    const bookingId = event.pathParameters?.bookingId;
    if (!bookingId) {
      return response(400, { message: "Missing bookingId in path" });
    }

    const params = {
      TableName: "bonzAiTable",
      Key: {
        pk: { S: "BOOKING" },
        sk: { S: `ID#${bookingId}` },
      },
      ConditionExpression: "attribute_exists(sk)",
      ReturnValues: "ALL_OLD",
    };

    const result = await client.send(new DeleteItemCommand(params));

    return response(200, {
      message: "Booking cancelled successfully",
      deletedBooking: result.Attributes ? unmarshall(result.Attributes) : null,
    });
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return response(404, { message: "Booking not found" });
    }

    console.error("DeleteBooking error:", err);
    return response(500, { message: "Internal server error" });
  }
}
