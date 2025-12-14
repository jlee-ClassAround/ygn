import { getCategories } from '@/actions/categories/get-categories';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { CourseForm } from './_components/course-form';
import { OptionModal } from './_components/option-modal';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { PartialCourseSchema } from '@/validations/schemas';
import PartialCourseForm from './_components/partial-course-form';
import { DownloadButton } from '../../free-courses/[freeCourseId]/apply/_components/download-button';

export default async function CourseIdPage(props: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await props.params;
    const course = await db.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            chapters: {
                include: {
                    lessons: true,
                },
            },
            detailImages: true,
            category: true,
            teachers: true,
            options: {
                orderBy: {
                    createdAt: 'asc',
                },
            },
            productBadge: true,
        },
    });
    if (!course) return redirect('/admin/courses/all');

    const categories = await getCategories({ type: 'COURSE' });

    const teachers = await db.teacher.findMany({
        orderBy: {
            name: 'asc',
        },
    });

    const productBadges = await db.productBadge.findMany();

    const freeCourses = await db.freeCourse.findMany();

    return (
        <>
            <CourseForm
                course={course}
                categories={categories}
                teachers={teachers}
                productBadges={productBadges}
                freeCourses={freeCourses}
            />
            {/* 분할결제 항목 추가 */}
            <PartialCourseForm courseId={courseId} title={course.title} />
            <OptionModal courseId={courseId} />
        </>
    );
}
