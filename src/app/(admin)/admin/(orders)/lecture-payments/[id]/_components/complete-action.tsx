'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CompleteAction({ payment }: { payment: any }) {
    const [loading, setLoading] = useState(false);

    // CASH + WAIT 상태일 때만 버튼 보여줌
    const showButton = payment.paymentMethod === 'CASH' && payment.paymentStatus === 'WAIT';

    if (!showButton) return null;

    const handleComplete = async () => {
        if (!confirm('현금 결제를 "결제완료"로 처리하시겠습니까?')) return;

        setLoading(true);

        const res = await fetch(`/api/admin/cash-payments/${payment.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                price: payment.price,
                paymentStatus: 'COMPLETED',
                completedAt: new Date(),
            }),
        });

        const result = await res.json();

        if (!result.success) {
            alert(result.message);
            setLoading(false);
            return;
        }

        alert(result.message);
        setLoading(false);

        window.location.reload();
    };

    return (
        <Button
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={handleComplete}
            disabled={loading}
        >
            {loading ? '처리 중…' : '결제'}
        </Button>
    );
}
