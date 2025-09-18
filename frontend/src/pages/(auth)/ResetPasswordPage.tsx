"use client";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";


import { ArrowLeft, Frown, Loader } from "lucide-react";
import { resetPasswordMutationFn } from "../../lib/api";
import { toast } from "../../hooks/use-toast";
import { WeatherProLogo } from "../../components/WeatherProLogo";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";


export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const code = params.get("code");
  const exp = Number(params.get("exp"));
  const now = Date.now();

  const isValid = code && exp && exp > now;

  const { mutate, isPending } = useMutation({
    mutationFn: resetPasswordMutationFn,
  });

  const formSchema = z
    .object({
      password: z
        .string()
        .trim()
        .min(8, { message: "Password must be at least 8 characters long" }),
      confirmPassword: z.string().trim().min(1, {
        message: "Confirm password is required",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!code) {
      navigate("/forgot-password?email=");
      return;
    }
    mutate(
      { password: values.password, verificationCode: code },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Password reset successfully",
          });
          navigate("/");
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
      {isValid ? (
        <div className="w-full max-w-md p-5 rounded-md">
          <WeatherProLogo />
          <h1 className="text-xl font-bold mt-8 mb-1.5 text-center sm:text-left dark:text-white">
            Set up a new password
          </h1>
          <p className="mb-6 text-center sm:text-left text-[15px] text-gray-600 dark:text-gray-300">
            Your password must be different from your previous one.
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm dark:text-gray-300">
                      New password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm dark:text-gray-300">
                      Confirm new password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-[40px] text-[15px] font-semibold"
              >
                {isPending && <Loader className="animate-spin mr-2" />}
                Reset password
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <div className="w-full max-w-md h-[80vh] flex flex-col gap-2 items-center justify-center">
          <Frown size={48} className="text-red-500 animate-bounce" />
          <h2 className="text-xl font-bold dark:text-white">
            Invalid or expired reset link
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            You can request a new password reset link.
          </p>
          <Link to="/forgot-password?email=">
            <Button className="h-[40px] mt-2">
              <ArrowLeft className="mr-1" /> Go to forgot password
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
