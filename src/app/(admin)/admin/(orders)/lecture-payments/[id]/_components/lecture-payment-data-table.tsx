'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Link from 'next/link';

import { CourseOption } from '../../../toss-customers/_components/course-filter';

import { DetailDataTable } from '.';

import { columns } from './columns';
import { SearchInput } from './data-components/search-input';
import { StatusFilter } from './data-components/status-filter';
import { TypeFilter } from './data-components/type-filter';
import { CourseFilter } from './data-components/course-filter';
import { CashPaymentModalTrigger } from './cash-payment-modal-trigger';
import { downloadCSV } from '../_actions/download-csv';

interface LecturePaymentDetailDataTableProps {
    data: any[];
    courseOptions: CourseOption[];
}

export function LecturePaymentDetailDataTable({
    data,
    courseOptions,
}: LecturePaymentDetailDataTableProps) {
    /** -------------------------------
     * 🔥 1) 로컬 전용 필터 state
     -------------------------------- */
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    const [type, setType] = useState('ALL');
    const [course, setCourse] = useState<string | null>(null);

    /** -------------------------------
     * 🔥 2) 필터링된 data 계산
     -------------------------------- */
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const searchLower = search.toLowerCase();

            const matchesSearch =
                search === '' ||
                item.productName?.toLowerCase().includes(searchLower) ||
                item.user?.username?.toLowerCase().includes(searchLower) ||
                item.user?.phone?.includes(searchLower);

            const matchesStatus = status === 'ALL' || item.paymentStatus === status;

            const paymentMethod = type === 'ALL' || item.paymentMethod === type;

            const matchesCourse = course === null || item.courseId === course;

            return matchesSearch && matchesStatus && paymentMethod && matchesCourse;
        });
    }, [data, search, status, type, course]);

    /** -------------------------------
     * 🔥 3) CSV 다운로드
     -------------------------------- */
    const handleDownloadCSV = () => {
        const filename = `payment-history-${new Date().toISOString().split('T')[0]}`;
        downloadCSV(filteredData, filename);
    };

    /** -------------------------------
     * 🔥 4) 필터 초기화
     -------------------------------- */
    const resetFilters = () => {
        setSearch('');
        setStatus('ALL');
        setType('ALL');
        setCourse(null);
    };

    return (
        <div className="space-y-4">
            {/* 상단 버튼 그룹 */}
            <div className="flex justify-between gap-4 flex-wrap">
                <Button asChild>
                    <Link href="/admin/lecture-payments">목록으로</Link>
                </Button>
                <div className="flex items-center gap-4 flex-wrap">
                    <CashPaymentModalTrigger courseOptions={courseOptions} />
                </div>
            </div>

            {/* 필터 area */}
            <div className="flex items-center gap-4 flex-wrap">
                <SearchInput onChange={setSearch} value={search} />
                <TypeFilter value={type} onChange={setType} />
                <StatusFilter value={status} onChange={setStatus} />

                {/* COURSE 타입일 때만 course 필터 동작 */}
                {type === 'COURSE' && (
                    <CourseFilter
                        courseOptions={courseOptions}
                        value={course}
                        onChange={setCourse}
                    />
                )}

                <Button variant="outline" onClick={resetFilters}>
                    필터 삭제
                </Button>

                <Button onClick={handleDownloadCSV} variant="outline" size="sm" className="ml-auto">
                    <Download className="h-4 w-4 mr-2" />
                    CSV 내보내기
                </Button>
            </div>

            {/* 데이터 테이블 */}
            <DetailDataTable columns={columns} data={filteredData} noSearch defaultPageSize={100} />
        </div>
    );
}
