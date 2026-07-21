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

// export const getFlights = async (): Promise<Flight[]> => {
//   const response = await fetch("http://localhost:3001/flights");

//   if (!response.ok) {
//     throw new Error("Failed to fetch flights");
//   }

//   return await response.json();
// };

const BASE_URL = "http://192.168.43.53:3001";

export const getFlights = async (): Promise<Flight[]> => {
  const response = await fetch(`${BASE_URL}/flights`);

  if (!response.ok) {
    throw new Error("Failed to fetch flights");
  }

  return await response.json();
};