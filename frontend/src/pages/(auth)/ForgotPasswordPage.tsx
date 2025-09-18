// src/pages/auth/ForgotPasswordPage.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, type MutationFunctionContext } from "@tanstack/react-query";
import { MailCheckIcon, Loader, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "../../hooks/use-toast";
import { WeatherProLogo } from "../../components/WeatherProLogo";
import ThemeToggle from "../../components/ThemeToggle";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const formSchema = z.object({
  email: z.string().trim().email("Adresse email invalide").min(1, {
    message: "L'email est requis",
  }),
});

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPasswordMutationFn,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values, {
      onSuccess: () => setIsSubmitted(true),
      onError: (error: any) => {
        console.error(error);
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <WeatherProLogo />
          <ThemeToggle />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {!isSubmitted ? (
            <>
              {/* Titre */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  Réinitialiser le mot de passe
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Entrez l'adresse email associée à votre compte. Nous vous
                  enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                              placeholder="exemple@email.com"
                              {...field}
                              className="pl-12"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full text-[15px] h-[45px] text-white font-semibold bg-emerald-500 hover:bg-emerald-600"
                  >
                    {isPending && <Loader className="animate-spin mr-2" />}
                    Envoyer les instructions
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center text-center">
              <MailCheckIcon size={48} className="text-emerald-500 animate-bounce" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Vérifiez votre boîte mail
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Nous avons envoyé un lien de réinitialisation à{" "}
                <span className="font-medium">{form.getValues().email}</span>.
              </p>
              <Link to="/">
                <Button className="h-[40px] flex items-center gap-2">
                  Retour à la connexion
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
function forgotPasswordMutationFn(variables: void, context: MutationFunctionContext): Promise<unknown> {
  throw new Error("Function not implemented.");
}

