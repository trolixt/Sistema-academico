import { ResourcePage } from "@/features/resources/resource-page";

export default async function SectionRoute({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <ResourcePage section={section} />;
}
