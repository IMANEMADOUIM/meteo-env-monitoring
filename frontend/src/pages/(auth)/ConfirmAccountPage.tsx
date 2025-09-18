"use client";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "../../hooks/use-toast";
import { WeatherProLogo } from "../../components/WeatherProLogo";
import { verifyEmailMutationFn } from "../../lib/api";
import { Button } from "../../components/ui/button";

export default function ConfirmAccountPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const code = params.get("code");

  const { mutate, isPending } = useMutation({
    mutationFn: verifyEmailMutationFn,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      toast({
        title: "Error",
        description: "Confirmation token not found",
        variant: "destructive",
      });
      return;
    }
    mutate(
      { code },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Account confirmed successfully",
          });
          navigate("/login");
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <main className="w-full min-h-[590px] h-full max-w-full flex items-center justify-center">
      <div className="w-full max-w-md p-5 rounded-md">
        <WeatherProLogo />

        <h1 className="text-xl font-bold mt-8 mb-2 text-center sm:text-left dark:text-white">
          Account confirmation
        </h1>
        <p className="mb-6 text-center sm:text-left text-[15px] text-gray-600 dark:text-gray-300">
          To confirm your account, please click the button below.
        </p>

        <form onSubmit={handleSubmit}>
          <Button
            disabled={isPending}
            type="submit"
            className="w-full h-[40px] text-[15px] font-semibold"
          >
            {isPending && <Loader className="animate-spin mr-2" />}
            Confirm account
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">
          If you have any issue confirming your account, please contact{" "}
          <a
            className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
            href="#"
          >
            support@weatherpro.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
