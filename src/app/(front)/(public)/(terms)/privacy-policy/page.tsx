import { getPrivacyPolicy } from '@/actions/terms/get-privacy-policy';

// metadata 전용
export async function generateMetadata() {
    const privacyPolicy = await getPrivacyPolicy();
    return {
        title: privacyPolicy?.title || '개인정보처리방침',
    };
}

export default async function PrivacyPolicyPage() {
    const privacyPolicy = await getPrivacyPolicy();

    return (
        <div className="fit-container max-w-[960px] py-14 md:pt-[100px] md:pb-[140px] space-y-10 md:space-y-[72px]">
            <div className="space-y-3 md:space-y-6">
                <h1 className="text-3xl md:text-4xl lg:text-[56px] font-nexonWarhaven !leading-tight text-center">
                    {privacyPolicy?.title}
                </h1>
            </div>
            <div
                dangerouslySetInnerHTML={{ __html: privacyPolicy?.content || '' }}
                className="py-8 [&_p]:min-h-6 border-t border-b border-foreground/20"
            />
        </div>
    );
}
