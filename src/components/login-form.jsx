import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// ---------------------------------------------------------------------------
// Shared password-visibility toggle button
// ---------------------------------------------------------------------------
function PasswordToggle({ visible, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// LOGIN form
// ---------------------------------------------------------------------------
function LoginSection({ className }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [passVisible, setPassVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("user/login", {
        emailOrPhone: data.email,
        password: data.password,
      });
      const userData = response.data.data;

      localStorage.setItem("token", userData.jwtToken);
      localStorage.setItem("UserDetails", JSON.stringify(userData));
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("memberApprovalStatus", userData?.approval_status || "pending");
      localStorage.setItem("memberIsActive", userData?.isActive !== false ? "true" : "false");

      toast.success(t("demo.loginForm.loginSuccess"));
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || t("demo.loginForm.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-5", className)} onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Email / Phone */}
      <div className="grid gap-2">
        <Label htmlFor="login-email">{t("demo.loginForm.email")}</Label>
        <Input
          id="login-email"
          type="text"
          autoComplete="username"
          placeholder={t("demo.loginForm.emailPlaceholder")}
          {...register("email", { required: t("demo.loginForm.emailRequired") })}
        />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="grid gap-2">
        <Label htmlFor="login-password">{t("demo.loginForm.password")}</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={passVisible ? "text" : "password"}
            autoComplete="current-password"
            placeholder={t("demo.loginForm.passwordPlaceholder")}
            className="pr-10"
            {...register("password", { required: t("demo.loginForm.passwordRequired") })}
          />
          <PasswordToggle visible={passVisible} onClick={() => setPassVisible((p) => !p)} />
        </div>
        {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
      </div>

      <Button
        id="login-submit-btn"
        type="submit"
        className="w-full transition-all duration-300"
        size="lg"
        disabled={loading}
      >
        {loading ? t("demo.loginForm.loggingIn") : t("demo.loginForm.login")}
      </Button>

      <div className="text-center">
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          {t("demo.loginForm.forgotLink")}
        </Link>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// REGISTER form
// ---------------------------------------------------------------------------
function RegisterSection({ onRegistered }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [passVisible, setPassVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("user/register", {
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        mobileNumber: data.mobileNumber,
        phoneNumber: data.mobileNumber,
      });

      const userData = response.data.user || response.data.data;
      toast.success("Registration successful!");

      // Notify parent to show success screen
      onRegistered({
        memberName: userData?.fullName || `${data.firstName} ${data.lastName}`,
      });
    } catch (error) {
      const msg = error?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="reg-first-name">First Name <span className="text-destructive">*</span></Label>
          <Input
            id="reg-first-name"
            type="text"
            placeholder="First name"
            autoComplete="given-name"
            {...register("firstName", {
              required: "First name is required",
              pattern: { value: /^[A-Za-z\s'-]+$/, message: "Only letters allowed" },
            })}
          />
          {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="reg-last-name">Last Name <span className="text-destructive">*</span></Label>
          <Input
            id="reg-last-name"
            type="text"
            placeholder="Last name"
            autoComplete="family-name"
            {...register("lastName", {
              required: "Last name is required",
              pattern: { value: /^[A-Za-z\s'-]+$/, message: "Only letters allowed" },
            })}
          />
          {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Mobile number */}
      <div className="grid gap-2">
        <Label htmlFor="reg-mobile">
          Mobile Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="reg-mobile"
          type="tel"
          placeholder="10-digit mobile number"
          autoComplete="tel"
          maxLength={10}
          {...register("mobileNumber", {
            required: "Mobile number is required",
            pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit mobile number" },
          })}
        />
        {errors.mobileNumber && <p className="text-destructive text-xs">{errors.mobileNumber.message}</p>}
      </div>

      {/* Email */}
      <div className="grid gap-2">
        <Label htmlFor="reg-email">Email Address <span className="text-destructive">*</span></Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
          })}
        />
        {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="grid gap-2">
        <Label htmlFor="reg-password">Password <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={passVisible ? "text" : "password"}
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            className="pr-10"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
          />
          <PasswordToggle visible={passVisible} onClick={() => setPassVisible((p) => !p)} />
        </div>
        {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
      </div>

      {/* Confirm password */}
      <div className="grid gap-2">
        <Label htmlFor="reg-confirm-password">Confirm Password <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Input
            id="reg-confirm-password"
            type={confirmVisible ? "text" : "password"}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            className="pr-10"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match",
            })}
          />
          <PasswordToggle visible={confirmVisible} onClick={() => setConfirmVisible((p) => !p)} />
        </div>
        {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
      </div>

      <Button
        id="register-submit-btn"
        type="submit"
        className="w-full transition-all duration-300 mt-1"
        size="lg"
        disabled={loading}
      >
        {loading ? "Creating Account…" : "Create Account"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// REGISTRATION SUCCESS screen
// ---------------------------------------------------------------------------
function RegistrationSuccess({ memberName, onBackToLogin }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Registration Successful!</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your account has been created successfully.</p>
      </div>

      {/* Info cards */}
      <div className="w-full space-y-3 text-left">
        {/* Next steps */}
        <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Next Steps</p>
          <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside leading-relaxed">
            <li>Log in with your registered email and password.</li>
            <li>Complete your personal & business profile.</li>
            <li>Submit your profile for Admin approval.</li>
            <li>Once approved, you will have full access to the Member Panel.</li>
          </ol>
        </div>
      </div>

      <Button
        id="go-to-login-btn"
        className="w-full"
        size="lg"
        onClick={onBackToLogin}
      >
        Go to Login
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported component — Login / Register tabs
// ---------------------------------------------------------------------------
export function LoginForm({ className, ...props }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("login");
  const [registrationResult, setRegistrationResult] = useState(null);

  const handleRegistered = (result) => {
    setRegistrationResult(result);
  };

  const handleBackToLogin = () => {
    setRegistrationResult(null);
    setActiveTab("login");
  };

  // If registration just completed, show the success screen
  if (activeTab === "register" && registrationResult) {
    return (
      <div className={cn("w-full", className)} {...props}>
        <RegistrationSuccess
          memberName={registrationResult.memberName}
          onBackToLogin={handleBackToLogin}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      {/* Tab switcher */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold">
          {activeTab === "login" ? t("demo.loginForm.title") : "Create Account"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {activeTab === "login"
            ? t("demo.loginForm.subtitle")
            : "Register as a new Franchise Member"}
        </p>

        {/* Tab pills */}
        <div className="mt-1 flex w-full rounded-xl bg-muted p-1 gap-1">
          <button
            id="tab-login"
            type="button"
            onClick={() => setActiveTab("login")}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200",
              activeTab === "login"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Login
          </button>
          <button
            id="tab-register"
            type="button"
            onClick={() => setActiveTab("register")}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200",
              activeTab === "register"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Register
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="animate-in fade-in duration-300">
        {activeTab === "login" ? (
          <LoginSection />
        ) : (
          <RegisterSection onRegistered={handleRegistered} />
        )}
      </div>
    </div>
  );
}
