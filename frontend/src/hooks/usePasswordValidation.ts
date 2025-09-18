import { useEffect, useState } from "react";

// Hook de validation du mot de passe amélioré
export const usePasswordValidation = (password: string) => {
  const [validation, setValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    setValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const isValid = Object.values(validation).every(Boolean);
  const strength = Object.values(validation).filter(Boolean).length;

  return { validation, isValid, strength };
};
