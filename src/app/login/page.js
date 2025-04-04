'use client';

import { Moon, Sun } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { useTheme } from "next-themes";
import { CompanyName, darkThemeLogo, lightThemeLogo, loginBackground } from "@/constants/main";
import Image from "next/image";

export default function LoginPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="relative">
      {/* Theme Toggle Button at Top Left */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-6 lg:top-4 right-1 lg:right-1/2 p-2 mr-4 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      >
        {theme === "light" ?
          <div>
            <Sun size={20} />
          </div>
          :
          <div>
            <Moon size={20} />
          </div>}
      </button>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="/login" className="flex items-center gap-4 font-medium">
              <Image
                src={theme === 'light' ? lightThemeLogo : darkThemeLogo}
                width={50}
                height={50}
                alt="Logo"
              />
              <h1 className="text-xl font-semibold">
                {CompanyName}
              </h1>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <img
            src={loginBackground}
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8] dark:grayscale" />
        </div>
      </div>
    </div>
  );
}
