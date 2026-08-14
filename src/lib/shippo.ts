import { Shippo } from "shippo";

let client: Shippo | null = null;

export function getShippoClient() {
  const token = process.env.API_KEY;
  if (!token) throw new Error("Shippo is not configured");
  client ??= new Shippo({ apiKeyHeader: token });
  return client;
}
