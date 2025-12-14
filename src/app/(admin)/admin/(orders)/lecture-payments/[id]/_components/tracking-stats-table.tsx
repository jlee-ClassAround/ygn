import { formatPrice } from '@/utils/formats';

function sortTrackingKeys(keys: string[]) {
    const fixedTop = ['메타', '구글'];
    const fixedBottom = ['기타'];

    const top = keys.filter((k) => fixedTop.includes(k));
    const bottom = keys.filter((k) => fixedBottom.includes(k));
    const middle = keys.filter((k) => !fixedTop.includes(k) && !fixedBottom.includes(k));

    return [
        ...fixedTop.filter((t) => top.includes(t)),
        ...middle.sort(),
        ...bottom.filter((b) => bottom.includes(b)),
    ];
}

export function TrackingStatsTable({
    trackingStats,
    newUserStats,
    trackingSummary,
}: {
    trackingStats: Record<string, number>;
    newUserStats: Record<
        string,
        { newCount: number; newPaymentCount: number; newPaymentRevenue: number }
    >;
    trackingSummary: Record<
        string,
        { visitCount: number; paymentCount: number; totalRevenue: number; conversionRate: string }
    >;
}) {
    const keys = sortTrackingKeys(Object.keys(trackingStats));

    /** 🔥 “기타” 제외한 전체 합계 계산 */
    const summaryWithoutEtc = Object.entries(trackingSummary).filter(([k]) => k !== '기타');

    const totalVisit = summaryWithoutEtc.reduce((s, [, v]) => s + v.visitCount, 0);
    const totalPayment = summaryWithoutEtc.reduce((s, [, v]) => s + v.paymentCount, 0);
    const totalRevenue = summaryWithoutEtc.reduce((s, [, v]) => s + v.totalRevenue, 0);
    const totalConversion = totalVisit > 0 ? ((totalPayment / totalVisit) * 100).toFixed(1) : '0';

    return (
        <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-muted">
                    <tr className="border-b">
                        <th className="px-3 py-2 text-left">유입경로</th>
                        <th className="px-3 py-2 text-center">결제/유입</th>
                        <th className="px-3 py-2 text-center">전환율</th>
                        <th className="px-3 py-2 text-center">결제금액 합계</th>
                        <th className="px-3 py-2 text-right">비중</th>
                    </tr>
                </thead>

                <tbody>
                    {keys.map((medium) => {
                        const s = trackingSummary[medium];
                        const isEtc = medium === '기타';

                        return (
                            <tr key={medium} className="border-b">
                                <td className="px-3 py-2">{medium}</td>

                                {/* 결제/유입 */}
                                <td className="px-3 py-2 text-center">
                                    {isEtc
                                        ? `${s.paymentCount}`
                                        : `${s.paymentCount}/${s.visitCount}`}
                                </td>

                                {/* 전환율 */}
                                <td className="px-3 py-2 text-center">
                                    {isEtc ? '-' : `${s.conversionRate}%`}
                                </td>

                                {/* 결제금액 합계 */}
                                <td className="px-3 py-2 text-center font-semibold">
                                    {formatPrice(s.totalRevenue)}원
                                </td>

                                {/* 비중 */}
                                <td className="px-3 py-2 text-right">
                                    {isEtc
                                        ? '-'
                                        : `${((s.totalRevenue / totalRevenue) * 100).toFixed(1)}%`}
                                </td>
                            </tr>
                        );
                    })}

                    {/* 총합계 — “기타” 제외 */}
                    <tr className="border-t bg-muted/50 font-semibold">
                        <td className="px-3 py-2 text-left">총합계</td>
                        <td className="px-3 py-2 text-center">
                            {totalPayment}/{totalVisit}
                        </td>
                        <td className="px-3 py-2 text-center">{totalConversion}%</td>
                        <td className="px-3 py-2 text-center">{formatPrice(totalRevenue)}원</td>
                        <td className="px-3 py-2 text-right">100%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
