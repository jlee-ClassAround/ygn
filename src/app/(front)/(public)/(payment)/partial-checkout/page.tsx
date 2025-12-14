import { getUserCoupons } from '@/actions/coupons/get-user-coupons';
import { getCachedSingleCourse } from '@/actions/courses/get-single-course';
import { getIsEnrollment } from '@/actions/enrollments/get-is-enrollment';
import { getUser } from '@/actions/users/get-user';
import Container from '@/components/layout/container';
import Section from '@/components/layout/section';
import { getSession } from '@/lib/session';
import { calculatePrice } from '@/utils/course-price-by-type';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { TossPaymentsWindow } from './_components/toss-payments-window';
import { getUserBillingInfo } from '@/utils/auth/get-user-billing-info';
import StartCheckoutTracker from '@/track-events/start-checkout-tracker';
import {
    getCachedSinglePartialCourse,
    getSinglePartialCourse,
} from '../../(course)/partial-courses/[courseId]/actions/get-single-partial-course';
import { getMainIdByPartialCourseId } from './_actions/get-main-course-id';

export const metadata: Metadata = {
    title: '결제하기',
};

export default async function CheckOut({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const { courseId } = await searchParams;
    if (!courseId) return notFound();

    const { optId } = await searchParams;

    const session = await getSession();
    const user = await getUser(session.id);
    if (!user) return notFound();

    const billingInfo = await getUserBillingInfo({ userId: user.id });

    const data = await getSinglePartialCourse(courseId);

    const course = data?.viewData;
    if (!course) return notFound();
    if (course.productType === 'OPTION' && !optId) return notFound();
    const selectedOption = course.options.find((opt: any) => opt.id === optId);

    const { originalPrice, discountedPrice } = calculatePrice({
        productType: course.productType,
        originalPrice: course.originalPrice,
        discountedPrice: course.discountedPrice,
        selectedOption,
    });
    const coursePrice = discountedPrice ?? originalPrice ?? 0;
    const courseTitle = course.title + (selectedOption ? ` - ${selectedOption?.name}` : '');

    let isTaxFree = course.isTaxFree;
    if (selectedOption) {
        isTaxFree = selectedOption.isTaxFree;
    }

    const isEnrolled = await getIsEnrollment(course.id, user.id);
    if (isEnrolled) return redirect('/mypage');

    const userCoupons = await getUserCoupons(user.id, course.id);
    const mainId = await getMainIdByPartialCourseId(courseId);

    return (
        <main>
            <Section>
                <Container>
                    <TossPaymentsWindow
                        productType={'COURSE'}
                        productId={mainId ?? ''}
                        productOptionId={optId}
                        productPrice={coursePrice}
                        productTitle={courseTitle}
                        productThumbnail={course.thumbnail ?? ''}
                        productCategory={course.category ?? null}
                        billingInfo={billingInfo}
                        isTaxFree={isTaxFree}
                        teachers={course.teachers}
                        optionId={optId ?? ''}
                        userId={user.id}
                        coupons={userCoupons}
                        orderName={courseTitle}
                        customerEmail={user.email ?? ''}
                        customerName={user.username ?? ''}
                        customerMobilePhone={user.phone || null}
                    />
                </Container>
            </Section>
            <StartCheckoutTracker contentId={courseId} contentType="course" value={coursePrice} />
        </main>
    );
}
