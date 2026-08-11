export interface Flight {
  id: number;
  airline: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  rating: number;
}

const BASE_URL = "http://172.19.192.1:3001";

export const getFlights = async (): Promise<Flight[]> => {
  const response = await fetch(`${BASE_URL}/flights`);

  if (!response.ok) {
    throw new Error("Failed to fetch flights");
  }

  return await response.json();
};