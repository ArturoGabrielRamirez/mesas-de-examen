import { ExamDetailsView } from "@/components/exam-details-view"

// Cambia la función a async y await params
export default async function AdminExamDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await params en Next.js 15+
  const { id } = await params
  
  return <ExamDetailsView examId={id} userRole="admin" backUrl="/admin/exams" />
}