import { TiptapViewer } from '@/components/tiptap/tiptap-viewer';

interface Props {
    policy: string;
}

export function RefundPolicySection({ policy }: Props) {
    return (
        <section id="refund-policy" className="py-20">
            <div className="mx-auto max-w-[960px] px-6">
                <h2 className="text-xl lg:text-2xl font-semibold pb-6">환불 정책</h2>
                <TiptapViewer content={policy} className="text-foreground/60 leading-[1.8]" />
            </div>
        </section>
    );
}
