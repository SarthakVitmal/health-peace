"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast, Toaster } from 'sonner';
import { useRouter } from 'next/navigation';

const SignupForm = () => {
  const [firstname, setFirstname] = React.useState('');
  const [lastname, setLastname] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phone: ''
  });

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const router = useRouter();

  // Validation functions
  const validateName = (name: string) => {
    const re = /^[A-Za-z]+$/;
    return re.test(name);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return re.test(password);
  };

  const validatePhone = (phone: string) => {
    const re = /^\+?[0-9\s\-\(\)]{10}$/;
    return re.test(phone);
  };

  const handleValidation = () => {
    let valid = true;
    const newErrors = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      phone: ''
    };

    // First name validation
    if (!firstname) {
      newErrors.firstname = 'First name is required';
      valid = false;
    } else if (!validateName(firstname)) {
      newErrors.firstname = 'First name should contain only alphabets';
      valid = false;
    }

    // Last name validation
    if (!lastname) {
      newErrors.lastname = 'Last name is required';
      valid = false;
    } else if (!validateName(lastname)) {
      newErrors.lastname = 'Last name should contain only alphabets';
      valid = false;
    }

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character';
      valid = false;
    }

    // Phone validation
    if (!phone) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!handleValidation()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstname, lastname, phone })
      });
      
      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        if (data.message.includes('User already exists with this email address')) {
          setErrors(prev => ({ ...prev, email: "Email already exists" }));
          return toast.error("Email already exists. Please use a different email.");
        }
        return toast.error(data.message || "Signup failed");
      }

      toast.success("Signup Successful");
      await delay(1000);
      router.push('/login');
    } catch (error) {
      setIsLoading(false);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4 overflow-y-hidden">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Join MindEase
          </h2>
          <p className="mt-2 text-gray-600">
            Create your account to begin your journey towards mental wellness.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstname" className="text-sm font-medium text-gray-700">
                First Name
              </Label>
              <Input 
                id="firstname" 
                type="text" 
                placeholder="John" 
                value={firstname}
                onChange={(e) => {
                  setFirstname(e.target.value);
                  setErrors(prev => ({ ...prev, firstname: '' }));
                }}
                className={`w-full border-gray-300 focus:border-indigo-600 focus:ring-indigo-600 ${
                  errors.firstname ? 'border-red-500' : ''
                }`}
              />
              {errors.firstname && (
                <p className="text-sm text-red-500">{errors.firstname}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastname" className="text-sm font-medium text-gray-700">
                Last Name
              </Label>
              <Input 
                id="lastname" 
                type="text" 
                placeholder="Doe" 
                value={lastname}
                onChange={(e) => {
                  setLastname(e.target.value);
                  setErrors(prev => ({ ...prev, lastname: '' }));
                }}
                className={`w-full border-gray-300 focus:border-indigo-600 focus:ring-indigo-600 ${
                  errors.lastname ? 'border-red-500' : ''
                }`}
              />
              {errors.lastname && (
                <p className="text-sm text-red-500">{errors.lastname}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors(prev => ({ ...prev, email: '' }));
              }}
              className={`w-full border-gray-300 focus:border-indigo-600 focus:ring-indigo-600 ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number
            </Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+1 123 456 7890" 
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors(prev => ({ ...prev, phone: '' }));
              }}
              className={`w-full border-gray-300 focus:border-indigo-600 focus:ring-indigo-600 ${
                errors.phone ? 'border-red-500' : ''
              }`}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
              className={`w-full border-gray-300 focus:border-indigo-600 focus:ring-indigo-600 ${
                errors.password ? 'border-red-500' : ''
              }`}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Password must contain at least:
              <ul className="list-disc pl-5 mt-1">
                <li>8 characters</li>
                <li>1 uppercase letter</li>
                <li>1 lowercase letter</li>
                <li>1 number</li>
                <li>1 special character</li>
              </ul>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              'Sign up →'
            )}
          </button>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="font-medium text-indigo-600 hover:text-indigo-500">
            Privacy Policy
          </Link>
          . Your data is safe with us.
        </p>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
};

export default SignupForm;