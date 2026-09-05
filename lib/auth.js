import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function requireAuth(req, res) {
    const session = await getServerSession(
        req,
        res,
        authOptions
    );

    if (!session?.user?.id) {
        return {
            authenticated: false,
            session: null,
        };
    }

    return {
        authenticated: true,
        session,
    };
}