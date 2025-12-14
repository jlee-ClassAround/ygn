export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex flex-col items-center justify-center py-10 md:py-20 min-h-[60vh]">
      <div className="px-5 sm:max-w-[500px] w-full">{children}</div>
    </div>
  );
}
