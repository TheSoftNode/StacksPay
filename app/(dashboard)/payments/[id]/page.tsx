interface PaymentDetailsProps {
  params: {
    id: string;
  };
}

export default function PaymentDetailsPage({ params }: PaymentDetailsProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Payment Details - {params.id}
      </h1>
      {/* Payment details will go here */}
    </div>
  );
}
