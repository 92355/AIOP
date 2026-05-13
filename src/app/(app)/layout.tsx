import { AppShell } from "@/components/layout/AppShell";
import { getDashboardLayout } from "@/app/settings/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLayout = await getDashboardLayout();

  return <AppShell initialLayout={initialLayout}>{children}</AppShell>;
}
