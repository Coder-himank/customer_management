import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";
import Header from "@/components/header";
import { useRouter } from "next/router";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}) {

    const router = useRouter();

    const showHeader = router.pathname !== "/";

    return (
        <SessionProvider session={session}>

            {showHeader && <Header />}

            <Component {...pageProps} />

        </SessionProvider>
    );
}