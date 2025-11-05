import { ExamDetailsView } from "@/components/exam-details-view"

export default async function TeacherExamDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return <ExamDetailsView examId={id} userRole="teacher" backUrl="/teacher/exams" />
}