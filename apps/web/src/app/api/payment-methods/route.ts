import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-config";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fixed payment method options - no need for database storage
  const paymentMethods = [
    {
      id: "credit-card",
      name: "Credit/Debit Card",
      icon: "credit-card",
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: "paypal",
    },
    {
      id: "afterpay",
      name: "AfterPay",
      icon: "afterpay",
    },
    {
      id: "zip",
      name: "Zip",
      icon: "zip",
    },
  ];

  return NextResponse.json({ paymentMethods });
}
