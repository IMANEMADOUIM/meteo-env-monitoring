import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  isEmailVerified: boolean;
}

const fetchUsers = async (): Promise<User[]> => {
  const res = await axios.get("/api/admin/users");
  return res.data;
};

const deleteUser = async (id: string) => {
  await axios.delete(`/api/admin/users/${id}`);
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "admin" | "user">("all");

  const { data: users, isLoading, isError } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  if (isLoading) return <p className="text-center mt-10">Chargement...</p>;
  if (isError) return <p className="text-center mt-10 text-red-500">Erreur lors du chargement.</p>;

  const filteredUsers =
    filter === "all" ? users : users?.filter((u) => u.role === filter);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
          Gestion des Utilisateurs
        </h1>
        <button
          onClick={() => navigate("/users/add")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
        >
          ➕ Ajouter utilisateur
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-slate-600 dark:text-slate-300">Filtrer :</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "admin" | "user")}
          className="px-3 py-2 border rounded-lg shadow-sm bg-white dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">Tous</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full border-collapse bg-white dark:bg-slate-900">
          <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rôle</th>
              <th className="px-4 py-2">Email vérifié</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map((user) => (
              <tr key={user._id} className="border-t dark:border-slate-700">
                <td className="px-4 py-2">{user._id}</td>
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      user.role === "admin"
                        ? "bg-green-500"
                        : "bg-sky-500"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {user.isEmailVerified ? "✅" : "❌"}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => navigate(`/users/edit/${user._id}`)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => mutation.mutate(user._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers?.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-slate-500">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
