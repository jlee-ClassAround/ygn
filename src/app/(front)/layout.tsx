import { KakaoFloatingButton } from '@/components/common/kakao-floating-button';
import { ToastProvider } from '@/providers/toast-provider';

export default function FrontLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="light bg-background text-foreground">
            {children}
            <ToastProvider />
            {/* <KakaoFloatingButton /> */}
        </div>
    );
}
