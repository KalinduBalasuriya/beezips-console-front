import { redirect } from "next/navigation";
import { ROUTES } from "../lib/routes";

/** The app's landing route is the dashboard; `/` only forwards to it. */
export default function RootPage() {
  redirect(ROUTES.dashboard);
}
