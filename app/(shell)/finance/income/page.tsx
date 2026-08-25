import type { Metadata } from "next";
import IncomePage from "../../../../components/finance/IncomePage";

export const metadata: Metadata = { title: "Beezips | Income" };

export default function Page() {
  return <IncomePage />;
}
