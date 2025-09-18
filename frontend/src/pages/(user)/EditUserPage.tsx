import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";


const editUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["user", "admin", "instructor"]),
});

type EditUserForm = z.infer<typeof editUserSchema>;

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await axios.get(`/api/users/${id}`, { withCredentials: true });
      return res.data;
    },
  });

  const { register, handleSubmit, reset } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: EditUserForm) => {
      const res = await axios.put(`/api/users/${id}`, data, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      navigate("/users");
    },
  });

  if (isLoading) return <p>Chargement...</p>;

  const onSubmit = (data: EditUserForm) => {
    mutation.mutate(data);
  };

  // Remplir le formulaire après récupération
  React.useEffect(() => {
    if (user) reset(user);
  }, [user, reset]);

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Modifier l’utilisateur</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Nom</label>
          <input
            type="text"
            {...register("name")}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Rôle</label>
          <select {...register("role")} className="w-full p-2 border rounded-lg">
            <option value="user">Utilisateur</option>
            <option value="instructor">Instructeur</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending }
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          {mutation.isPending  ? "Mise à jour..." : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
}
