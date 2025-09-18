import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useTheme } from "../context/theme-provider";


interface Props {
  icon: any;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword?: boolean;
  togglePassword?: () => void;
  error?: boolean;
}

export default function InputField({  }: Props) {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative group">
      {/* Label, Icon, Input Field... (comme dans ton code) */}
    </div>
  );
}
