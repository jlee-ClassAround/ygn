import { getIsEnrollment } from "@/actions/enrollments/get-is-enrollment";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

interface Props {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}

export default async function LessonsLayout({ children, params }: Props) {
  const { courseId } = await params;
  const session = await getSession();
  const enrollment = await getIsEnrollment(courseId, session.id);
  if (!enrollment) return redirect("/");

  return <>{children}</>;
}
