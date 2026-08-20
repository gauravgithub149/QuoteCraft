import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";

interface RegisterForm {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
}

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: any) => {
    const success = await register({
      name: data.fullName,
      email: data.email,
      password: data.password,
      companyName: data.companyName,
    });

    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e5e7eb] p-8 shadow-xs">
        <div className="flex flex-col items-center mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#1f1b11] tracking-tight">
            Create MongoDB Account
          </h1>
          <p className="text-xs text-[#4d4632] mt-1">
            Register to persist quotes in MongoDB Atlas collection.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#4d4632] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Alex Vance"
                {...registerField("fullName", { required: "Full Name is required" })}
                className="w-full pl-9 pr-3.5 py-2.5 border border-[#e5e7eb] rounded-lg text-xs text-[#1f1b11] placeholder-[#4d4632]/60 focus:outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1">
                {String(errors.fullName.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
              Company Name
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#4d4632] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Acme Solutions Inc."
                {...registerField("companyName", {
                  required: "Company Name is required",
                })}
                className="w-full pl-9 pr-3.5 py-2.5 border border-[#e5e7eb] rounded-lg text-xs text-[#1f1b11] placeholder-[#4d4632]/60 focus:outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>
            {errors.companyName && (
              <p className="text-xs text-red-600 mt-1">
                {String(errors.companyName.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#4d4632] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="alex@acme.com"
                {...registerField("email", { required: "Email is required" })}
                className="w-full pl-9 pr-3.5 py-2.5 border border-[#e5e7eb] rounded-lg text-xs text-[#1f1b11] placeholder-[#4d4632]/60 focus:outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {String(errors.email.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#4d4632] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...registerField("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Must be at least 6 characters",
                  },
                })}
                className="w-full pl-9 pr-9 py-2.5 border border-[#e5e7eb] rounded-lg text-xs text-[#1f1b11] placeholder-[#4d4632]/60 focus:outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d4632] hover:text-[#1f1b11]"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">
                {String(errors.password.message)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] font-bold text-xs rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating User in MongoDB...</span>
              </>
            ) : (
              <>
                <span>Register & Connect</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#e5e7eb] text-center">
          <p className="text-xs text-[#4d4632]">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#735c00] hover:underline"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
