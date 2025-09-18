// src/components/auth/PasswordStrength.tsx
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  password: string;
}

const PasswordStrength: React.FC<Props> = ({ password }) => {
  const criteria = [
    { label: "Au moins 8 caractères", valid: password.length >= 8 },
    { label: "Une lettre majuscule", valid: /[A-Z]/.test(password) },
    { label: "Une lettre minuscule", valid: /[a-z]/.test(password) },
    { label: "Un chiffre", valid: /[0-9]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1">
      {criteria.map((c, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          {c.valid ? (
            <CheckCircle className="text-green-500" size={16} />
          ) : (
            <XCircle className="text-gray-400" size={16} />
          )}
          <span className={c.valid ? "text-green-600" : "text-gray-500"}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordStrength;
