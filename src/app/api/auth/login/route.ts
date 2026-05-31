import { type NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body as { email: string; password: string };

  try {
    await signIn("credentials", { email, password, redirect: false });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      const causeMessage =
        error.cause && typeof error.cause === "object" && "err" in error.cause
          ? (error.cause.err as Error)?.message
          : "";

      if (causeMessage === "EMAIL_NOT_VERIFIED") {
        return NextResponse.json(
          {
            error: {
              code: "EMAIL_NOT_VERIFIED",
              message:
                "Verifikasi email Anda sebelum masuk. Cek kotak masuk untuk tautan verifikasi.",
            },
          },
          { status: 401 },
        );
      }

      if (error.type === "CredentialsSignin") {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Email atau kata sandi tidak valid.",
            },
          },
          { status: 401 },
        );
      }

      return NextResponse.json(
        {
          error: {
            code: "AUTH_ERROR",
            message: "Terjadi kesalahan. Silakan coba lagi.",
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "UNKNOWN",
          message: "Terjadi kesalahan yang tidak diketahui.",
        },
      },
      { status: 500 },
    );
  }
}
