import type { Metadata } from "next";
import DistributorsPage from "../../../components/distributors/DistributorsPage";

export const metadata: Metadata = { title: "Beezips | Distributors" };

export default function Page() {
  return <DistributorsPage />;
}
