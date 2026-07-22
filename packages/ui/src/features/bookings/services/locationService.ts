import { da } from "date-fns/locale";

export const getLocations = async (): Promise<string[]> => {
  const response = await fetch("http://localhost:3001/locations");

  if (!response.ok) {
    throw new Error("Failed to fetch locations");
  }

  const data = await response.json();

  return data.map((item: { id: number; name: string }) => item.name);
};