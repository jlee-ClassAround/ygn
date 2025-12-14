import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const referer = req.headers.get("referer");
  const url = referer ? new URL(referer) : null;
  const redirectData = url ? url.searchParams.get("redirect") : null;
  if (redirectData?.startsWith("http")) {
    return Response.redirect("/login");
  }

  const originUrl = req.nextUrl.origin;

  const searchParams = new URLSearchParams({
    client_id: process.env.KAKAO_CLIENT_ID!,
    redirect_uri: originUrl + "/kakao/complete",
    response_type: "code",
  }).toString();

  const redirectPath = redirectData
    ? `&state=${Buffer.from(redirectData).toString("base64")}`
    : "";

  return Response.redirect(
    `https://kauth.kakao.com/oauth/authorize?${searchParams}${redirectPath}`
  );
}
