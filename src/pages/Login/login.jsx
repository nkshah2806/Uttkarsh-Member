import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import login from "../../assets/login.jpg";
import logo from "../../assets/logo.png"

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-15 w-15 items-center justify-center">
              <img src={logo} alt="" />
            </div>
            Uttkarsh Corporation.
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
          src={login}
          alt="login banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
