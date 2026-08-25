import type { Metadata } from "next";
import { FileBarChart } from "lucide-react";
import ComingSoon from "../../../components/ui/ComingSoon";

export const metadata: Metadata = { title: "Beezips | Reports" };

export default function Page() {
  return (
    <ComingSoon
      icon={FileBarChart}
      title="Reports"
      description="Reporting is not built yet. Month-to-date figures are on the dashboard, and Finance → Profit & Loss breaks down the current period."
    />
  );
}
