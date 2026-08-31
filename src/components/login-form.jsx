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
import { useLanguage } from "@/context/LanguageContext";

export function LoginForm({ className, ...props }) {
  const { t } = useLanguage();
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
      toast.success(t("loginSuccessful"));
      // The PrivateRoute guard redirects incomplete / not-yet-approved
      // members to the Personal Details page automatically.
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || t("loginFailed"));
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
        <h1 className="text-3xl font-bold">{t("memberLogin")}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t("enterEmail")}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            {...register("email", { required: t("emailRequired") })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">{t("password")}</Label>
          <div className="flex items-center justify-between relative">
            <Input
              id="password"
              type={passVisible ? "password" : "text"}
              placeholder={t("passwordPlaceholder")}
              {...register("password", { required: t("passwordRequired") })}
            />
            <button
              type="button"
              onClick={handlePasswordVisible}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t("togglePassword")}
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
          {loading ? t("loggingIn") : t("login")}
        </Button>
        <Link
          to="/forgot-password"
          className="text-[14px] font-medium hover:text-gray-500 duration-300 transition-all"
        >
          {t("forgotPassword")}
        </Link>
      </div>
    </form>
  );
}
