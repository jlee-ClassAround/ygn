import { Metadata } from 'next';
import LoginForm from './_components/login-form';
import ConfirmLoginPage from './_components/confirm-login-form';

export const metadata: Metadata = {
    title: '로그인',
};

export default async function LoginPage() {
    return (
        <>
            <LoginForm />
            {/* <ConfirmLoginPage /> */}
        </>
    );
}
