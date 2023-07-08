import { type DocumentClient } from 'aws-sdk/clients/dynamodb'

/**
 * Saves the chat history to DynamoDB.
 */
export async function saveObjectDynamoDB<T> (
  client: DocumentClient,
  tableName: string,
  id: string,
  object: T
): Promise<void> {
  try {
    await client.put({ TableName: tableName, Item: { id, object } }).promise()
    console.log(`Item ${id} saved to DynamoDB.`)
  } catch (error) {
    console.error(`Error saving item ${id} to DynamoDB.`, error)
  }
}
