'use client';

import { GetUserBillingInfo } from '@/utils/auth/get-user-billing-info';
import { Course } from '@prisma/client';
import { usePaymentsWindow } from '../_hooks/use-payments-window';

interface Props {
    userId: string;
    productType: 'COURSE' | 'EBOOK';
    productId: string;
    productOptionId?: string;
    productPrice: number;
    orderName: string;
    customerEmail: string;
    customerName: string;
    customerMobilePhone: string | null;
    billingInfo: GetUserBillingInfo;
    isTaxFree: boolean;
    productTitle: string;
    productThumbnail: string;
    productCategory: null;
    teachers: null;
    coupons: null;
    optionId: string;
    lecture: Course;
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div className="flex justify-between items-center">
            <span className={bold ? 'font-semibold' : ''}>{label}</span>
            <span className={bold ? 'text-xl font-extrabold' : ''}>{value}</span>
        </div>
    );
}

function Divider() {
    return <div className="h-px bg-gray-200 my-2" />;
}

export function OrderSummary({
    userId,
    productType,
    productId,
    productOptionId,
    productPrice,
    orderName,
    customerEmail,
    customerName,
    customerMobilePhone,
    billingInfo,
    isTaxFree,
    productTitle,
    productThumbnail,
    productCategory,
    teachers,
    coupons,
    lecture,
}: Props) {
    const {
        handlePurchase,
        handlePartialPurchase,
        isLoading,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        amount,
        setAmount,
        couponState,
        setCouponState,
        setIsAgreed,
        form,
        isSubmitting,
    } = usePaymentsWindow({
        productPrice,
        productType,
        productId,
        productOptionId,
        orderName,
        userId,
        customerEmail,
        customerName,
        customerMobilePhone,
        billingInfo,
        isTaxFree,
    });
    return (
        <div className="rounded-2xl bg-gray-50 p-8 space-y-8">
            <h3 className="text-xl font-extrabold">고객님의 주문</h3>

            <div className="space-y-4 text-base">
                <Row
                    label={`${lecture.title} × 1`}
                    value={`₩${(lecture.discountedPrice ?? 0).toLocaleString()}`}
                />
                <Divider />
                <Row label="소계" value={`₩${(lecture.discountedPrice ?? 0).toLocaleString()}`} />
                <Row
                    label="총계"
                    value={`₩${(lecture.discountedPrice ?? 0).toLocaleString()}`}
                    bold
                />
            </div>

            <div className="text-sm text-gray-500 leading-relaxed">
                개인 데이터는 주문을 처리하고, 사이트 전체에서 사용자 환경을 지원하며,{' '}
                <a href="/privacy-policy" className="text-red-500 underline">
                    개인정보 보호정책
                </a>
                에 설명된 목적을 위해 사용됩니다.
            </div>

            <button
                onClick={handlePurchase}
                disabled={isSubmitting || isLoading}
                className="w-full h-14 rounded-lg bg-red-500 text-white text-lg font-extrabold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting || isLoading ? '처리중...' : '주문 확정'}
            </button>
        </div>
    );
}
