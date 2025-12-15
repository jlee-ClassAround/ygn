import { User } from '@prisma/client';

interface Props {
    user: User | null;
}

export function CheckoutForm({ user }: Props) {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-extrabold">청구 상세 내용</h2>

            <div className="space-y-6">
                <Field label="이름" value={user?.nickname ?? ''} />
                <Field label="전화번호" value={user?.phone ?? ''} />
                <Field label="이메일 주소" value={user?.email ?? ''} />
            </div>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold">
                {label} <span className="text-red-500">*</span>
            </label>
            <input
                readOnly
                value={value ?? ''}
                className="w-full h-12 rounded-md border px-4 bg-gray-50 text-base"
            />
        </div>
    );
}
