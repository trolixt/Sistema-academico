import { ResourcePage } from "@/features/resources/resource-page";
import { StudentCoursesPage } from "@/features/students/student-courses-page";

export default async function SectionRoute({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section === "mis-cursos") return <StudentCoursesPage />;
  return <ResourcePage section={section} />;
}
