// src/components/ui/ThemeToggle.tsx
import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
    >
      {dark ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-800" />}
    </button>
  );
};

export default ThemeToggle;
