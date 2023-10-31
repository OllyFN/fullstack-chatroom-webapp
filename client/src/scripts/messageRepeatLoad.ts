import { messageType } from "../../types";

const maxMessageLoadTimeout = 5000;
// This function checks if the messages are loaded
// and if not, it doubles the message load timeout until it reaches max
// and calls a timeout to try and load the messages again
export default async function messageRepeatLoad(messageLoadTimeout: number): Promise<messageType[]> {
  try {
    // Fetch messages from the server
    const response = await fetch(`http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_HOST_PORT}/messages`);
    const data = await response.json();
    return data; // Return the data
  } catch (error) {
    // If there's an error, wait for the specified timeout
    await new Promise<void>((resolve) => setTimeout(() => resolve(), messageLoadTimeout));
    // After the timeout is reached, retry loading the messages with an increased timeout
    return messageRepeatLoad(Math.min(messageLoadTimeout * 2, maxMessageLoadTimeout));
  }
}