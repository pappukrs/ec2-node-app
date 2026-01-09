import { RegisterForm } from '@/components/auth/RegisterForm';
import { PublicRoute } from '@/components/auth/PublicRoute';

export default function RegisterPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <RegisterForm />
      </div>
    </PublicRoute>
  );
}
