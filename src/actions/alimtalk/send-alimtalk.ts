'use server';

interface Props {
    phone: string;
    templateCode?: string;
    username: string;
    courseName: string;
    courseDate?: string;
    location?: string;
    roomLink?: string;
    roomCode?: string;
}

export const sendAlimtalk = async ({ phone, username, courseName, roomLink, roomCode }: Props) => {
    try {
        const bodyData = JSON.stringify({
            '#{profile}': 'c138ce38037a619567b8b0b380355ea6b9f0edc7',
            '#{lecture}': courseName,
            '#{강좌명}': courseName,
            '#{고객명}': username,
            '#{phone}': phone,
            '#{templateCode}': 'buy',
            '#{링크명}': roomLink,
            '#{입장코드}': roomCode,
        });

        const response = await fetch('https://crm-back.coredev.co.kr/external/kakaoSend/instant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: bodyData,
        });

        if (!response.ok) {
            console.log(response);
            return {
                success: false,
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
        };
    }
};
