"use client";

import { Mail, Lock, LogIn } from "lucide-react";
import { redirect } from "next/navigation";
import { FormEvent } from "react";
import Image from "next/image";

export default function Login() {
  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    redirect("/dashboard");
  };
  return (
    // Container Principal: Ocupa toda a tela (min-h-screen)
    // Fundo escuro e layout flex para centralizar o card de login
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6">
      {/* Card de Login (Contém a imagem e o formulário) */}
      <div className="flex flex-col sm:flex-row w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Lado Esquerdo: Imagem/Conteúdo Temático */}
        <div className="hidden sm:flex sm:w-1/2 bg-gray-700 items-center justify-center p-0 relative">
          <div>
            <Image src="./logo.png" alt="" className="w-full h-full" />
          </div>
        </div>

        {/* Lado Direito: Formulário de Login */}
        <div className="w-full sm:w-1/2 p-8 sm:p-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Acessar Sistema
          </h2>
          <p className="text-gray-500 mb-8">
            Insira suas credenciais para continuar.
          </p>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Campo de E-mail */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Campo de Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Esqueceu sua senha?
                </a>
              </div>
            </div>

            {/* Botão de Login */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
