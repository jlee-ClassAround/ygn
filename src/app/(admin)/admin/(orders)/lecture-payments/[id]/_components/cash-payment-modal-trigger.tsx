'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CourseOption } from '../../../toss-customers/_components/course-filter';
import { CashPaymentModal } from './cash-payment-modal';

export function CashPaymentModalTrigger({ courseOptions }: { courseOptions: CourseOption[] }) {
    
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant="default" onClick={() => setOpen(true)}>
                현금결제 등록
            </Button>

            <CashPaymentModal open={open} onOpenChange={setOpen} courseOptions={courseOptions} />
        </>
    );
}
