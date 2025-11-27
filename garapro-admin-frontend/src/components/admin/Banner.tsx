import { useEffect, useState } from "react";

export default function Banner({
  banner,
  onClose,
}: {
  banner: { type: string; message: string } | null;
  onClose?: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (banner) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [banner, onClose]);

  if (!banner || !visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`${
          banner.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        } border rounded p-3 shadow-lg`}
      >
        {banner.message}
      </div>
    </div>
  );
}
