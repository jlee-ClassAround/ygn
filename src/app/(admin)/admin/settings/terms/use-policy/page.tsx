import { Card } from '@/components/ui/card';
import { UseForm } from './_components/use-form';
import { db } from '@/lib/db';

export default async function UsePolicyPage() {
    const usePolicy = await db.terms.findUnique({
        where: {
            id: 4,
        },
    });
    console.log(usePolicy);
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">이용 안내</h1>
            </div>
            <Card className="p-8">
                <UseForm initialData={usePolicy} />
            </Card>
        </div>
    );
}
