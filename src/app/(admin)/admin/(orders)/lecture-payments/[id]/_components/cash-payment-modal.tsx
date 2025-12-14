'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@radix-ui/react-label';
import { useDebounce } from '@/hooks/use-debounce';
import { getAllUsers } from '../_actions/get-all-users';
import { createCashPaymentAction } from '../_actions/create-cash-payment';

interface CashPaymentModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    courseOptions: any[];
}

export function CashPaymentModal({ open, onOpenChange, courseOptions }: CashPaymentModalProps) {
    const [productType, setProductType] = useState<'COURSE' | 'EBOOK'>('COURSE');

    const [keyword, setKeyword] = useState('');
    const debouncedKeyword = useDebounce(keyword, 200);

    const [users, setUsers] = useState<any[]>([]);
    const [searchResult, setSearchResult] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    const [price, setPrice] = useState('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courseOptions[0]?.id);

    const [loading, setLoading] = useState(false);

    /** 🔥 1) 모달 열릴 때 전체 사용자를 1번만 로드 */
    useEffect(() => {
        if (open) {
            getAllUsers().then((res) => {
                if (res.success) setUsers(res.data);
            });
        }
    }, [open]);

    /** 🔥 2) 클라이언트 필터링 (메모리 검색) — 초고속 검색 */
    useEffect(() => {
        if (!debouncedKeyword.trim()) {
            setSearchResult([]);
            return;
        }

        const normalized = debouncedKeyword.replace(/[^0-9a-zA-Z가-힣]/g, '').toLowerCase();

        const result = users.filter((u) => {
            return (
                u.username?.toLowerCase().includes(normalized) ||
                u.phone?.replace(/[^0-9]/g, '').includes(normalized) ||
                u.email?.toLowerCase().includes(normalized)
            );
        });

        setSearchResult(result);
    }, [debouncedKeyword, users]);

    // 서버 전송 날짜 변환
    function toKST(date: Date) {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    }

    /** 🔥 3) 저장 처리 */
    const handleSubmit = async () => {
        if (!selectedUser) return alert('회원 선택이 필요합니다.');
        if (!price || isNaN(Number(price))) return alert('금액을 입력하세요.');

        setLoading(true);

        const kstDate = date ? toKST(date) : null;

        const res = await createCashPaymentAction({
            userId: selectedUser.id,
            courseId: selectedCourseId ?? '',
            ebookId: undefined,
            productType,
            productTitle: courseOptions?.[0]?.title ?? '미정',
            price: Number(price),
            cancelAmount: 0,
            cancelReason: null,
            createdAt: kstDate,
        });

        setLoading(false);

        if (!res.success) {
            alert('등록 실패');
            return;
        }

        alert('현금 결제가 등록되었습니다.');
        onOpenChange(false);
        window.location.reload();
    };

    /** 모달 닫히면 초기화 */
    useEffect(() => {
        if (!open) {
            setProductType('COURSE');
            setKeyword('');
            setSearchResult([]);
            setSelectedUser(null);
            setPrice('');
            setDate(new Date());
            setSelectedCourseId(courseOptions[0]?.id ?? null);
        }
    }, [open, courseOptions]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>현금 결제 등록</DialogTitle>
                </DialogHeader>

                {/* 🔍 검색 */}
                <div className="space-y-3">
                    <Input
                        placeholder="회원명 / 전화번호 / 이메일 검색"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />

                    {/* 검색결과 */}
                    {searchResult.length > 0 && (
                        <div className="border rounded-md bg-white shadow max-h-56 overflow-auto">
                            {searchResult.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => {
                                        setSelectedUser(u);
                                        setSearchResult([]);
                                    }}
                                    className="
                                        block w-full text-left px-3 py-2 text-sm 
                                        hover:bg-yellow-50 transition
                                    "
                                >
                                    <div className="font-medium">{u.username}</div>
                                    <div className="text-xs text-muted-foreground">{u.phone}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 선택된 회원 */}
                {selectedUser && (
                    <div className="p-3 bg-muted rounded text-sm">
                        선택된 회원: <b>{selectedUser.username}</b> / {selectedUser.phone}
                    </div>
                )}

                {/* 금액 */}
                <div className="space-y-1">
                    <label className="text-sm font-medium">결제 금액</label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>

                {/* 타입 */}
                <RadioGroup
                    value={productType}
                    onValueChange={(v) => setProductType(v as any)}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="COURSE" id="course" />
                        <Label htmlFor="course">강의</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="EBOOK" id="ebook" />
                        <Label htmlFor="ebook">전자책</Label>
                    </div>
                </RadioGroup>

                {/* 강의 선택 */}
                <div>
                    <label className="text-sm font-medium">상품 선택</label>
                    <select
                        className="w-full border rounded p-2"
                        value={selectedCourseId ?? ''}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                    >
                        {courseOptions.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 날짜 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">결제 날짜</label>
                    <Calendar mode="single" selected={date} onSelect={setDate} locale={ko} />

                    <div className="text-sm text-muted-foreground">
                        선택된 날짜: {date ? format(date, 'yyyy-MM-dd') : ''}
                    </div>
                </div>

                {/* 저장 */}
                <Button onClick={handleSubmit} disabled={loading} className="w-full">
                    {loading ? '등록 중…' : '등록하기'}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
