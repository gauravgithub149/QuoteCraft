import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, Loader2 ,KeyRound} from "lucide-react";
import { authService } from "../Services/auth.service";
interface ForgotPasswordForm {
  email: string;
}
export const ForgotPassword: React.FC = () => {
  // const { showToast } = useApp();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setLoading(true);

      await authService.forgotPassword(data.email);

      alert("Password reset link has been sent successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e5e7eb] p-8 shadow-xs">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-[#facc15] rounded-xl flex items-center justify-center mb-4 shadow-2xs">
            <KeyRound className="w-6 h-6 text-[#1f1b11]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1f1b11] tracking-tight">
            Reset your password
          </h1>
          <p className="text-xs text-[#4d4632] mt-1">
            Enter your email to receive a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#4d4632] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@company.com"
                {...register("email", { required: "Email is required" })}
                className="w-full pl-9 pr-3.5 py-2.5 border border-[#e5e7eb] rounded-lg text-sm text-[#1f1b11] placeholder-[#4d4632]/60 focus:outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {String(errors.email.message)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] font-bold text-sm rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#e5e7eb] flex flex-col items-center gap-3 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f1b11] hover:text-[#735c00] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to login</span>
          </Link>

          <p className="text-xs text-[#4d4632]">
            Need help?{" "}
            <a
              href="mailto:support@quotecraft.io"
              className="font-semibold text-[#735c00] hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
