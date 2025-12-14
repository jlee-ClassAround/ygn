import { Card } from '@/components/ui/card';
import { getDailyStats } from '@/actions/payments/get-daily-stats';
import { LecturePaymentDetailDataTable } from './_components/lecture-payment-data-table';
import { PaymentStats } from './_components/payment-stats';
import { getTrackingMergedPayments } from './_actions/get-matched-tracking-free-course-id';
import { getAdminDetailCourses } from './_actions/get-admin-detail-courses';
import { getLecturePaymentStats } from './_actions/get-lecture-payment-stats';
import { getLecturePayments } from './_actions/get-lecture-payments';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        from?: string;
        to?: string;
        status?: string;
        type?: string;
        search?: string;
    }>;
}
export default async function AdminLecturePaymentsPageDetail({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { from, to, status, type, search } = await searchParams;

    const courseId = id;

    const dateRange =
        from && to
            ? {
                  from: new Date(from),
                  to: new Date(to),
              }
            : undefined;

    const [stats, payments, dailyStats, courses] = await Promise.all([
        getLecturePaymentStats({ courseId }),
        getLecturePayments({ dateRange, status, type, courseId, search }),
        getDailyStats({ dateRange, status, type, courseId, search }),
        getAdminDetailCourses({ courseId }),
    ]);

    const courseOptions = courses.map((course) => ({
        id: course.id,
        title: course.title,
        freeCourseId: course.freeCourseId || null,
    }));

    const {
        payments: mergedPayments,
        trackingStats,
        newUserStats,
        trackingSummary,
    } = await getTrackingMergedPayments({
        freeCourseId: courseOptions[0].freeCourseId,
        courseId,
        payments,
    });

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">{courseOptions[0].title}</h1>
            <PaymentStats
                stats={stats}
                trackingStats={trackingStats}
                newUserStats={newUserStats}
                trackingSummary={trackingSummary}
            />

            <Card className="p-6">
                <LecturePaymentDetailDataTable
                    data={mergedPayments}
                    courseOptions={courseOptions}
                />
            </Card>
        </div>
    );
}
