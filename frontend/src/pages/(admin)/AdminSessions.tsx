
import { Loader2, LogOut } from "lucide-react";
import { useForceLogout, useUserSessions } from "../../hooks/use-sessions";
import type { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import { Button } from "../../components/ui/button";

export default function AdminSessions() {
  const { data, isLoading } = useUserSessions();
  const { mutate, isPending } = useForceLogout();

  if (isLoading) return <p>Chargement des sessions...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sessions Utilisateurs</h2>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Nom</th>
            <th className="p-2">Email</th>
            <th className="p-2">Statut</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((user: { _id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; email: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; isOnline: any; }) => (
            <tr key={user._id} className="border-t">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">
                {user.isOnline ? (
                  <span className="text-green-500 font-semibold">En ligne</span>
                ) : (
                  <span className="text-gray-400">Hors ligne</span>
                )}
              </td>
              <td className="p-2">
                <Button
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => mutate(user._id)}
                >
                  {isPending ? <Loader2 className="animate-spin mr-2" /> : <LogOut className="mr-2" />}
                  Déconnecter
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
