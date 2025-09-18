"use client";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, type MutationFunctionContext } from "@tanstack/react-query";
import { Loader, ShieldCheck, Frown } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { WeatherProLogo } from "../../components/WeatherProLogo";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";


export default function VerifyMfaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const userId = params.get("userId"); // récupéré depuis query (optionnel)

  const [attempts, setAttempts] = useState(0);

  const { mutate, isPending } = useMutation({
    mutationFn: verifyMfaMutationFn,
  });

  const formSchema = z.object({
    code: z
      .string()
      .trim()
      .length(6, { message: "The MFA code must be 6 digits" })
      .regex(/^\d+$/, { message: "The MFA code must only contain numbers" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not found for MFA verification",
        variant: "destructive",
      });
      return;
    }

    mutate(
      { userId, code: values.code },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "MFA verification successful",
          });
          navigate("/home");
        },
        onError: (error) => {
          setAttempts((prev) => prev + 1);
          toast({
            title: "Error",
            description: error.message || "Invalid MFA code",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <main className="w-full min-h-[590px] h-full flex items-center justify-center">
      <div className="w-full max-w-md p-5 rounded-md">
        <WeatherProLogo />

        <h1 className="text-xl font-bold mt-8 mb-2 text-center sm:text-left dark:text-white">
          Multi-Factor Authentication
        </h1>
        <p className="mb-6 text-center sm:text-left text-[15px] text-gray-600 dark:text-gray-300">
          Please enter the 6-digit code from your authenticator app or SMS.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm dark:text-gray-300">
                    Verification code
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      className="tracking-[6px] text-center font-mono text-lg"
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
              Verify code
            </Button>
          </form>
        </Form>

        {attempts > 0 && (
          <p className="mt-4 text-sm text-red-500 flex items-center gap-2">
            <Frown size={16} />
            Attempt {attempts} failed
          </p>
        )}

        <div className="mt-6 flex flex-col items-center text-sm text-gray-600 dark:text-gray-300">
          <ShieldCheck className="text-emerald-500 mb-2" size={28} />
          <p>
            Didn’t receive the code?{" "}
            <button
              onClick={() =>
                toast({
                  title: "Resent",
                  description: "A new MFA code has been sent",
                })
              }
              className="text-primary hover:underline ml-1"
            >
              Resend code
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
function verifyMfaMutationFn(variables: void, context: MutationFunctionContext): Promise<unknown> {
  throw new Error("Function not implemented.");
}

