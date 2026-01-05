import Link from 'next/link';
import { getCachedSiteSetting } from '@/queries/global/site-setting';

export async function MainFooter() {
    const siteSetting = await getCachedSiteSetting();

    return (
        <footer className="bg-black text-white">
            <div className="mx-auto max-w-[1180px] px-6 py-20">
                {/* 상단 영역 */}
                <div className="flex flex-col md:flex-row justify-between gap-12">
                    {/* 왼쪽: 회사 정보 */}
                    <div className="space-y-6 max-w-[520px]">
                        <div className="text-3xl font-extrabold text-primary">영끌남</div>

                        <div className="text-base font-medium text-white/90">
                            {siteSetting?.businessName ?? '(주)빌딩주스쿨'}
                        </div>

                        <div className="text-sm leading-relaxed text-white/60 whitespace-pre-line">
                            {siteSetting?.businessInfo ??
                                `대표이사 : 이철진 | 개인정보책임관리자 : 이철진
사업자 번호 : 488-87-03659
사업장주소 : 서울특별시 강남구 테헤란로64길 14, 6층
대표 전화번호 : 02-6052-0811
통신판매업 신고번호 : 2025-서울강남-06381호`}
                        </div>
                    </div>
                </div>

                {/* 하단 영역 */}
                <div className="mt-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    {/* 카피라이트 */}
                    <div className="text-sm text-white/40">
                        © 2025 Copyright by 주식회사 빌딩주스쿨
                    </div>

                    {/* 약관 링크 (👉 여기로 내려옴) */}
                    <div className="flex gap-6 text-sm text-white/80">
                        <Link
                            href="/privacy-policy"
                            className="hover:text-primary transition-colors"
                        >
                            개인정보보호방침
                        </Link>
                        <Link href="/terms-of-use" className="hover:text-primary transition-colors">
                            이용약관
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
