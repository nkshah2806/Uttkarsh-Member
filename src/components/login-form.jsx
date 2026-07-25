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

export function LoginForm({ className, ...props }) {
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

      if (!userData.isAdmin) {
        toast.error("Access denied. Admins only.");
        return;
      }
      localStorage.setItem("token", response.data.data.jwtToken);
      localStorage.setItem("UserDetails", JSON.stringify(response.data.data));
      localStorage.setItem("isAuthenticated", "true");
      toast.success("Login successful! Redirecting to dashboard...");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.meta?.message || "Login failed. Please try again.");
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
        <h1 className="text-3xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <div className="flex items-center justify-between relative">
            <Input
              id="password"
              type={passVisible ? "password" : "text"}
              placeholder="Enter password"
              {...register("password", { required: "Password is required" })}
            />
            <button
              type="button"
              onClick={handlePasswordVisible}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle password visibility"
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
          {loading ? "Logging in..." : "Login"}
        </Button>
        <Link
          to="/forgot-password"
          className="text-[14px] font-medium hover:text-gray-500 duration-300 transition-all"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}
