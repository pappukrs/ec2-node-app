import { LoginForm } from '@/components/auth/LoginForm';
import { PublicRoute } from '@/components/auth/PublicRoute';

export default function LoginPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </div>
    </PublicRoute>
  );
}
