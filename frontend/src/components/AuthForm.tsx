import { useState } from "react";

interface Props {
  type: "login" | "register";
  onSubmit: (form: any) => void;
}

export default function AuthForm({ type, onSubmit }: Props) {
  const [form, setForm] = useState({ email: "", password: "", username: "" });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">
        {type === "login" ? "Login" : "Create Account"}
      </h2>

      {type === "register" && (
        <input
          type="text"
          placeholder="Full Name"
          className="mb-3 input w-full border p-2 rounded"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
      )}

      <input
        type="email"
        placeholder="Email Address"
        className="mb-3 input w-full border p-2 rounded"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        className="mb-4 input w-full border p-2 rounded"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700">
        {type === "login" ? "Login" : "Sign Up"}
      </button>
    </form>
  );
}
