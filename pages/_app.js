import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";
import Header from "@/components/header";
import { useRouter } from "next/router";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}) {

    const router = useRouter();
    const hideHeader = [
        "/",
        "/authenticate/login",
        "/authenticate/signup",
    ].includes(router.pathname);

    const showHeader = !hideHeader;

    return (
        <SessionProvider session={session}>

            {showHeader && <Header />}

            <Component {...pageProps} />

        </SessionProvider>
    );
}