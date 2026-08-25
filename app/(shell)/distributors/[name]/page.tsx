import type { Metadata } from "next";
import DistributorSalesPage from "../../../../components/sales/DistributorSalesPage";

interface PageProps {
  /** dynamic segments arrive as a promise in this version of Next */
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  return { title: `Beezips | ${decodeURIComponent(name)}` };
}

export default async function Page({ params }: PageProps) {
  const { name } = await params;
  return <DistributorSalesPage distributorName={decodeURIComponent(name)} />;
}
