import { SystemShell } from "@/components/layout/system-shell";
export default function ProtectedLayout({ children }: { children: React.ReactNode }) { return <SystemShell>{children}</SystemShell>; }
