import getStations from "@/lib/api";
import HistoryView from "./HistoryView";

export default async function HistoryPage() {
  const stations = await getStations();
  return <HistoryView stations={stations} />;
}
