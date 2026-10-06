// Razorpay Checkout.js for the web app — the browser counterpart of
// react-native-razorpay. Loads the script once, opens the hosted checkout for a
// server-created order, and resolves with the ids /payments/razorpay/verify
// needs. Card details never touch GoVoylo's code (PCI scope stays with Razorpay).

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export interface RazorpayCheckoutOptions {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface RazorpayCheckoutResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Rejected when the customer closes the checkout without paying (after a
// failed attempt or not), so the caller can release the held booking.
export class RazorpayCheckoutError extends Error {
  constructor(message: string, readonly dismissed: boolean) {
    super(message);
  }
}

type RazorpayInstance = { open: () => void; on: (event: string, handler: (response: any) => void) => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

let scriptPromise: Promise<RazorpayConstructor> | null = null;

function loadCheckoutScript(): Promise<RazorpayConstructor> {
  const existing = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
  if (existing) return Promise.resolve(existing);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CHECKOUT_SRC;
      script.async = true;
      script.onload = () => {
        const loaded = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
        if (loaded) resolve(loaded);
        else reject(new Error('Payment page did not load.'));
      };
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Couldn't reach the payment page. Check your connection and try again."));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<RazorpayCheckoutResult> {
  const Razorpay = await loadCheckoutScript();
  return new Promise((resolve, reject) => {
    let settled = false;
    // A failed attempt keeps the checkout open for a retry; it only ends the
    // flow if the customer then closes the checkout.
    let lastFailure: string | null = null;
    const checkout = new Razorpay({
      key: options.key,
      order_id: options.orderId,
      amount: options.amount,
      currency: options.currency,
      name: 'GoVoylo',
      description: options.description,
      prefill: options.prefill,
      theme: { color: '#7C1AEE' },
      handler: (response: RazorpayCheckoutResult) => {
        settled = true;
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          if (settled) return;
          settled = true;
          reject(new RazorpayCheckoutError(lastFailure ?? 'Payment was cancelled.', lastFailure === null));
        },
      },
    });
    checkout.on('payment.failed', (response: { error?: { description?: string } }) => {
      lastFailure = response?.error?.description || 'Payment failed.';
    });
    checkout.open();
  });
}
