interface CheckoutPageProps {
  params: {
    paymentId: string;
  };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Complete Your Payment
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Payment ID: {params.paymentId}
        </p>
        {/* Payment widget will go here */}
      </div>
    </div>
  );
}
