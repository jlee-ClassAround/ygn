import { LectureContent } from './lecture-content';
import { LectureSidebar } from './lecture-sidebar';

interface Props {
    detailImages: DetailImage[];
    lectureInfo: Course | null;
    refundPolicy: string | null;
    usePolicy: string | null;
}

export default function LecturePage(props) {
    return (
        <LectureLayout
            left={
                <LectureContent
                    detailImages={props.detailImages}
                    lectureInfo={props.lecture}
                    siteSetting={props.siteSetting}
                />
            }
            right={<LectureSidebar lecture={props.lecture} />}
        />
    );
}
