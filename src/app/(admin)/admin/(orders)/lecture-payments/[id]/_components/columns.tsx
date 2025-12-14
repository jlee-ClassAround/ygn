'use client';

import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { dateFormat, dateTimeFormat, formatPrice } from '@/utils/formats';
import { getPaymentMethodToKr } from '@/utils/payments/get-enum-to-kr';
import { TossCustomer } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';

import { AdminCopyButton } from '@/app/(admin)/_components/admin-copy-button';
import { ReceiptText, SquarePen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useState } from 'react';
import { DialogTitle } from '@radix-ui/react-dialog';
import Link from 'next/link';
import { DetailDialog } from './detail-action';
import { CashDetailCell } from './data-components/cash-detail-cell';
import { CashRefundAction } from './cash-refund-action';
import { el } from 'date-fns/locale';
import { CompleteAction } from './complete-action';
import { RefundAction } from '../../../toss-customers/_components/refund-action';

interface ExtendedTossCustomer extends TossCustomer {
    course?: { title: string } | null;
    ebook?: { title: string } | null;
    user?: { username: string; phone: string; email: string } | null;
    trackingBy: { mediumName: string } | null;
}

export const columns: ColumnDef<ExtendedTossCustomer>[] = [
    {
        accessorKey: 'user.username',
        meta: {
            label: '구매자',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="구매자" />,
        cell: ({ row }) => {
            const [open, setOpen] = useState(false);
            const data = row.original;
            return (
                <>
                    <button
                        onClick={() => setOpen(true)}
                        className="text-xs hover:text-primary hover:underline cursor-pointer truncate max-w-full"
                    >
                        {data.user?.username || '-'}
                    </button>

                    <DetailDialog open={open} onOpenChange={setOpen} userId={data.userId} />
                </>
            );
        },
    },
    {
        accessorKey: 'trackingBy.mediumName',
        meta: {
            label: '트래킹',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="트래킹" />,
        cell: ({ row }) => {
            // row.original 전체 payment row
            const mediumName = row.original.trackingBy?.mediumName || '-';

            return <div className="max-w-[160px] text-xs truncate">{mediumName}</div>;
        },
    },

    {
        accessorKey: 'user.phone',
        meta: {
            label: '전화번호',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="전화번호" />,
        cell: ({ row }) => {
            const data = row.original;
            return <div className="max-w-[120px] truncate text-xs">{data.user?.phone || '-'}</div>;
        },
    },
    {
        accessorKey: 'user.email',
        meta: {
            label: '이메일',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="이메일" />,
        cell: ({ row }) => {
            const data = row.original;
            return <div className="max-w-[120px] truncate text-xs">{data.user?.email || '-'}</div>;
        },
    },
    {
        accessorKey: 'isTaxFree',
        meta: {
            label: '세금 유형',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="세금 유형" />,
        cell: ({ row }) => {
            const data = row.original;
            return (
                <Badge variant={'secondary'} className="rounded-full">
                    {data.isTaxFree ? '면세' : '과세'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'paymentMethod',
        meta: {
            label: '결제 수단',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="결제 수단" />,
        cell: ({ row }) => {
            const data = row.original;
            const method = String(data.paymentMethod);
            const label = method === 'CASH' ? '현금' : getPaymentMethodToKr(data.paymentMethod);

            return <Badge variant="secondary">{label}</Badge>;
        },
    },
    {
        accessorKey: 'finalPrice',
        meta: {
            label: '결제 금액',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="결제 금액" />,
        cell: ({ row }) => {
            const data = row.original;

            // 환불되었으면 0원 처리
            let price = data.paymentStatus === 'REFUNDED' ? 0 : data.finalPrice;
            // 부분 환불이면 finalPrice - cancelAmount
            if (data.paymentStatus === 'PARTIAL_REFUNDED') {
                const canceled = data.cancelAmount || 0;
                price = data.finalPrice - canceled;
            }
            return (
                <div className="max-w-[120px] text-start text-xs truncate font-medium">
                    {formatPrice(price)}
                </div>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        meta: {
            label: '결제요청일',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="결제요청일" />,
        cell: ({ row }) => (
            <div className="max-w-[120px] text-start text-xs truncate">
                {dateFormat(row.original.createdAt)}
            </div>
        ),
    },
    {
        accessorKey: 'paymentStatus',
        meta: {
            label: '결제 상태',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="결제 상태" />,
        cell: ({ row }) => {
            const data = row.original;
            const status = data.paymentStatus;
            let label = '결제대기';
            let style = 'text-gray-500 bg-gray-500/10';

            switch (status) {
                case 'CANCELLED':
                    label = '취소됨';
                    style = 'text-muted-foreground bg-muted-foreground/10';
                    break;
                case 'REFUNDED':
                    label = '환불됨';
                    style = 'text-red-500 bg-red-500/10';
                    break;
                case 'PARTIAL_REFUNDED':
                    label = '부분환불';
                    style = 'text-red-500 bg-red-500/10';
                    break;
                case 'COMPLETED':
                    label = '결제완료';
                    style = 'text-green-500 bg-green-500/10';
                    break;
            }

            return (
                <Badge variant="secondary" className={cn('rounded-full', style)}>
                    {label}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        meta: {
            label: '처리',
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title="처리" />,
        cell: ({ row }) => {
            const payment = row.original;
            const method = String(payment.paymentMethod || '');
            const status = String(payment.paymentStatus || '');

            if (method === 'CASH') {
                if (status === 'WAIT') {
                    return <CompleteAction payment={payment} />;
                } else if (status === 'COMPLETED' || status === 'PARTIAL_REFUNDED') {
                    return <CashRefundAction row={row} />;
                }
            } else {
                return <RefundAction row={row} />;
            }
        },
    },

    {
        id: 'receiptUrl',
        meta: { label: '상세' },
        header: ({ column }) => <DataTableColumnHeader column={column} title="상세" />,

        cell: ({ row }) => {
            const payment = row.original;
            const method = String(payment.paymentMethod || '');

            // ⭐ 현금 결제
            if (method === 'CASH') {
                return <CashDetailCell payment={payment} />;
            }

            // ⭐ 카드 결제
            if (payment.receiptUrl) {
                return (
                    <a href={payment.receiptUrl} target="_blank" className="p-1 hover:text-primary">
                        <ReceiptText className="w-4 h-4 text-muted-foreground" />
                    </a>
                );
            }

            return null;
        },
    },
];
