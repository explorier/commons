import { Station } from "./types";

export default async function getStations(): Promise<Station[]> {
  const data = await fetch("https://api.commonsradio.org/stations", {
    cache: "force-cache",
  });
  const stations = await data.json();
  return stations;
}

// TODO: replace with GET /stations/:id once needed outside build-time context
export async function getStation(id: string): Promise<Station | undefined> {
  const data = await getStations();
  const station = data.find((station: Station): boolean => station.id === id);
  return station;
}
