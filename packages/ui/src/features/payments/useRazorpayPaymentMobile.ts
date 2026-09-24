import { useMutation } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

export interface CreateRazorpayOrderRequest {
  bookingReference: string;
  amount: number;
  currency: string;
  sourceClient: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  bookingReference: string;
}

export interface VerifyRazorpayPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentResponse {
  transactionId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export function useCreateRazorpayOrderMobile() {
  return useMutation({
    mutationFn: async (request: CreateRazorpayOrderRequest): Promise<RazorpayOrderResponse> => {
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/payments/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message || "Failed to start payment.");
      }

      return response.json();
    },
  });
}

export function useVerifyRazorpayPaymentMobile() {
  return useMutation({
    mutationFn: async (request: VerifyRazorpayPaymentRequest): Promise<PaymentResponse> => {
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/payments/razorpay/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message || "Payment verification failed.");
      }

      return response.json();
    },
  });
}
