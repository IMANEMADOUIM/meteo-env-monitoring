import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const addUserSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  role: z.enum(["user", "admin", "instructor"]),
  password: z.string().min(6, "Mot de passe trop court"),
});

type AddUserForm = z.infer<typeof addUserSchema>;

export default function AddUserPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddUserForm>({
    resolver: zodResolver(addUserSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: AddUserForm) => {
      const res = await axios.post("/api/users", data, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      navigate("/users");
    },
  });

  const onSubmit = (data: AddUserForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Ajouter un utilisateur</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Nom</label>
          <input
            type="text"
            {...register("name")}
            className="w-full p-2 border rounded-lg"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full p-2 border rounded-lg"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Rôle</label>
          <select {...register("role")} className="w-full p-2 border rounded-lg">
            <option value="user">Utilisateur</option>
            <option value="instructor">Instructeur</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Mot de passe</label>
          <input
            type="password"
            {...register("password")}
            className="w-full p-2 border rounded-lg"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending }
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {mutation.isPending  ? "Envoi..." : "Ajouter"}
        </button>
      </form>
    </div>
  );
}
