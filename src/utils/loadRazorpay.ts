let razorpayPromise: Promise<boolean> | null = null;

export const loadRazorpayScript = (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayPromise) {
    return razorpayPromise;
  }

  razorpayPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      razorpayPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayPromise;
};
