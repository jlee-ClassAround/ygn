import { getCachedTermsOfUse } from "@/actions/terms/get-terms-of-use";

export async function generateMetadata() {
  const termsOfUse = await getCachedTermsOfUse();
  return {
    title: termsOfUse?.title || "이용약관",
  };
}

export default async function TermsOfUsePage() {
  const termsOfUse = await getCachedTermsOfUse();

  return (
    <div className="fit-container max-w-[960px] py-14 md:pt-[100px] md:pb-[140px] space-y-10 md:space-y-[72px]">
      <div className="space-y-3 md:space-y-6">
        <h1 className="text-3xl md:text-4xl lg:text-[56px] font-nexonWarhaven !leading-tight text-center">
          {termsOfUse?.title}
        </h1>
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: termsOfUse?.content || "" }}
        className="py-8 [&_p]:min-h-6 border-t border-b border-foreground/20"
      />
    </div>
  );
}
