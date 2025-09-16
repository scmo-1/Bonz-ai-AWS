import { client } from "./db.mjs";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export const fetchBookings = async () => {
  try {
    const params = new QueryCommand({
      TableName: "bonzAiTable",
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": { S: "BOOKING" },
      },
    });

    const result = await client.send(params);
    return result.Items.map(unmarshall);
  } catch (error) {
    console.error("Fetch Error:", error.message);
    throw error;
  }
};
