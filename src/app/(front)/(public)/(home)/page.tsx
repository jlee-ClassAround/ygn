import { PaidCourses } from './_components/courses-section/paid-courses';
import { FreeCourses } from './_components/courses-section/free-courses';
import { VodCourses } from './_components/courses-section/vod-courses';
import { HeroSection } from '@/components/common/hero-section/hero-section';

export default function Home() {
    return (
        <main>
            <section>
                <HeroSection />
            </section>
            <section className="py-10 md:py-20 lg:py-24">
                <PaidCourses />
            </section>
            <section className="py-10 md:py-20 lg:py-24">
                <FreeCourses />
            </section>
            <VodCourses />
        </main>
    );
}
