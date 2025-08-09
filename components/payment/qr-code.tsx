interface QRCodeProps {
  value: string;
  size?: number;
}

export default function QRCode({ value, size = 200 }: QRCodeProps) {
  return (
    <div className="flex justify-center">
      <div 
        className="bg-gray-200 rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-gray-500">QR Code: {value}</span>
      </div>
    </div>
  );
}
