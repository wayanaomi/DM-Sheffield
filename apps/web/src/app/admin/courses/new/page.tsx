import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { CourseForm } from "../course-form";
import { createCourse } from "../actions";

export const metadata = { title: "New course" };

export default function NewCoursePage() {
  return (
    <Container className="max-w-2xl py-10">
      <SectionHeading eyebrow="Course management" title="Create a new course" />
      <div className="mt-8">
        <CourseForm onSubmit={createCourse} />
      </div>
    </Container>
  );
}
