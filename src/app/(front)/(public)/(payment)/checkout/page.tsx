import { redirect } from 'next/navigation';

import { CheckoutLayout } from './_components/checkout-layout';
import { OrderSummary } from './_components/order-summary';
import { getCheckoutData } from './actions';

import CheckoutClient from './_components/checkout-client';
import { getUserBillingInfo } from '@/utils/auth/get-user-billing-info';

interface Props {
    searchParams: Promise<{
        lectureId?: string;
    }>;
}

export default async function CheckoutPage({ searchParams }: Props) {
    const params = await searchParams;

    if (!params.lectureId) {
        redirect('/');
    }

    const { user, lecture } = await getCheckoutData(params.lectureId);

    if (!user) {
        redirect('/login');
    }
    const courseId = lecture.id;
    const billingInfo = await getUserBillingInfo({ userId: user.id });

    return (
        <CheckoutLayout
            left={<CheckoutClient user={user} />}
            right={
                <OrderSummary
                    productType={'COURSE'}
                    productId={courseId}
                    productOptionId={''}
                    productPrice={lecture.discountedPrice ?? 0}
                    productTitle={lecture.title}
                    productThumbnail={lecture.thumbnail ?? ''}
                    productCategory={null}
                    billingInfo={billingInfo}
                    isTaxFree={false}
                    teachers={null}
                    optionId={''}
                    userId={user.id}
                    coupons={null}
                    orderName={lecture.title}
                    customerEmail={user.email ?? ''}
                    customerName={user.username ?? ''}
                    customerMobilePhone={user.phone || null}
                    lecture={lecture}
                />
            }
        />
    );
}
