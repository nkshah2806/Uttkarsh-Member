import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "./ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function LoginForm({ className, ...props }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [passVisible, setPassVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordVisible = () => {
    setPassVisible((prev) => !prev);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("user/login", {
        emailOrPhone: data.email,
        password: data.password,
      });
      const userData = response.data.data;

      localStorage.setItem("token", response.data.data.jwtToken);
      localStorage.setItem("UserDetails", JSON.stringify(response.data.data));
      localStorage.setItem("isAuthenticated", "true");
      // Keep profile/approval/account status fresh for a returning member so
      // the route guard can immediately decide which pages are reachable.
      localStorage.setItem("memberApprovalStatus", userData?.approval_status || "pending");
      localStorage.setItem("memberIsActive", userData?.isActive !== false ? "true" : "false");
      toast.success(t("demo.loginForm.loginSuccess"));
      // The PrivateRoute guard redirects incomplete / not-yet-approved
      // members to the Personal Details page automatically.
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || t("demo.loginForm.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center mb-5">
        <h1 className="text-3xl font-bold">{t("demo.loginForm.title")}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t("demo.loginForm.subtitle")}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">{t("demo.loginForm.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("demo.loginForm.emailPlaceholder")}
            {...register("email", { required: t("demo.loginForm.emailRequired") })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">{t("demo.loginForm.password")}</Label>
          <div className="flex items-center justify-between relative">
            <Input
              id="password"
              type={passVisible ? "password" : "text"}
              placeholder={t("demo.loginForm.passwordPlaceholder")}
              {...register("password", { required: t("demo.loginForm.passwordRequired") })}
            />
            <button
              type="button"
              onClick={handlePasswordVisible}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t("demo.loginForm.showPassword")}
            >
              {passVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
          {/* <Checkbox label="Remember Me" /> */}
        </div>
      </div>

      <div className="text-center">
        <Button
          type="submit"
          className="w-full mb-2 transition-all duration-500"
          size="lg"
          disabled={loading}
        >
          {loading ? t("demo.loginForm.loggingIn") : t("demo.loginForm.login")}
        </Button>
        <Link
          to="/forgot-password"
          className="text-[14px] font-medium hover:text-gray-500 duration-300 transition-all"
        >
          {t("demo.loginForm.forgotLink")}
        </Link>
      </div>
    </form>
  );
}
