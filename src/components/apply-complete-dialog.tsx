'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useApplyCourseDialog } from '@/store/use-apply-course-dialog';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    kakaoRoomLink?: string;
    kakaoRoomPassword?: string;
}

export const ApplyCompleteDialog = ({ kakaoRoomLink, kakaoRoomPassword }: Props) => {
    const { isOpen, onClose } = useApplyCourseDialog();

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="space-y-8 md:p-8 dark bg-background text-foreground">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-center">무료강의 신청 완료!</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        무료강의 신청이 정상적으로 완료되었습니다. 아래 링크로 입장하실 수 있습니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex flex-col gap-2">
                    <div className="flex gap-x-2">
                        <span className="font-medium text-foreground/50">
                            카카오톡 채팅방 링크 :
                        </span>
                        <p className="text-primary font-medium">{kakaoRoomLink}</p>
                    </div>
                    <div className="flex gap-x-2 items-center justify-between">
                        <div className="flex gap-x-2 items-center">
                            <span className="font-medium text-foreground/50">
                                카카오톡 채팅방 비밀번호 :
                            </span>
                            <p className="text-primary font-medium">{kakaoRoomPassword}</p>
                        </div>
                        <Button
                            variant="ghost"
                            className="text-primary bg-foreground/10"
                            onClick={() => {
                                navigator.clipboard.writeText(kakaoRoomPassword ?? '');
                                toast.success('비밀번호가 복사되었습니다.');
                            }}
                        >
                            <Copy />
                            <span>비밀번호 복사</span>
                        </Button>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel className="h-12 text-base">닫기</AlertDialogCancel>
                    <AlertDialogAction className="h-12 text-base" asChild>
                        <a href={kakaoRoomLink} target="_blank" rel="noopener noreferrer">
                            채팅방 바로 입장하러 가기
                        </a>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
