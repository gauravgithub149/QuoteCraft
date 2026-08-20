import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
const { login, loading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
  setLoginError("");

  const result = await login(
    data.email,
    data.password
  );

  if (result.success) {
    navigate("/dashboard");
  } else {
    setLoginError(
      result.message || "Invalid email or password."
    );
  }
};

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        
        <h1 className="text-3xl font-bold tracking-tight text-[#1f1b11] mb-1">QuoteCraft</h1>
        <p className="text-xs text-[#4d4632]">Enterprise Commercial Quotation Platform</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e5e7eb] p-8 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {loginError && (
  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
    {loginError}
  </div>
)}
          <div>
            <label className="block text-xs font-semibold text-[#1f1b11] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#4d4632] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="alex.vance@acme.com"
                {...register('email', { required: 'Email is required' })}
                className="w-full pl-9 pr-3.5 py-2.5 border border-[#e5e7eb] rounded-lg text-xs text-[#1f1b11] placeholder-[#4d4632]/60 focus:outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{String(errors.email.message)}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#1f1b11]">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-[#735c00] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#4d4632] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-9 pr-3.5 py-2.5 border border-[#e5e7eb] rounded-lg text-xs text-[#1f1b11] placeholder-[#4d4632]/60 focus:outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{String(errors.password.message)}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] font-bold text-xs rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating JWT...</span>
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-xs text-[#4d4632] mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-[#735c00] hover:underline">
          Register New Account
        </Link>
      </p>
    </div>
  );
};
