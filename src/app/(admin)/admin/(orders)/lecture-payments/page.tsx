import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { columns } from './columns';
import { getCoursesWithCustomer } from './course-with-customer';
import { getAdminCourses } from '@/actions/courses/get-admin-courses';
import { getDailyStats } from '@/actions/payments/get-daily-stats';

import { PaymentStats } from '../toss-customers/_components/payment-stats';
import { PaymentDataTable } from './_components';
import { stat } from 'fs';
import { getPaymentStats } from './_actions/get-payments-stats';
import { getPayments } from './_actions/get-payments';

// import { db } from '@/lib/db';
interface PageProps {
    searchParams: Promise<{
        from?: string;
        to?: string;
        status?: string;
        type?: string;
        courseId?: string;
        search?: string;
    }>;
}
export default async function AdminLecturePaymentsPage({ searchParams }: PageProps) {
    const { from, to, status, type, courseId, search } = await searchParams;

    const dateRange =
        from && to
            ? {
                  from: new Date(from),
                  to: new Date(to),
              }
            : undefined;

    const [stats, payments, dailyStats, courses] = await Promise.all([
        getPaymentStats({ dateRange, status, type, courseId, search }),
        getPayments({ dateRange, status, type, courseId, search }),
        getDailyStats({ dateRange, status, type, courseId, search }),
        getAdminCourses(),
    ]);

    const data = await getCoursesWithCustomer();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">결제 내역</h1>
            <PaymentStats stats={stats} />

            <Card className="p-6">
                <PaymentDataTable
                    columns={columns}
                    data={data}
                    searchKey="title"
                    searchPlaceholder="강의명을 검색해보세요."
                />
            </Card>
        </div>
    );
}
