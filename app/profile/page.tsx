'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User, Mail, Calendar, Shield, Phone, MapPin, Settings, Lock, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/lib/toast';
import { userApi, authApi, BackendUser, UserProfile, PasswordChangeData, DeleteAccountData, Address } from '@/lib/api/auth';
import { ChangePasswordData } from '@/lib/auth/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  preferences: z.object({
    theme: z.string().optional(),
    notifications: z.boolean().optional(),
  }).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ProfileContent() {
  const { user, error, clearError, logout } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<BackendUser | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserProfile>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<ChangePasswordData & { confirmPassword: string }>({
    resolver: zodResolver(passwordSchema),
  });

  const deleteForm = useForm<DeleteAccountData & { confirmDelete: string }>({
    resolver: zodResolver(z.object({
      password: z.string().min(1, 'Password is required'),
      confirmDelete: z.string().min(1, 'Please type "DELETE" to confirm'),
    }).refine((data) => data.confirmDelete === 'DELETE', {
      message: 'Please type "DELETE" to confirm account deletion',
      path: ['confirmDelete'],
    })),
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const fullProfile = await authApi.getCurrentUser();
          setProfileData(fullProfile);
          reset({
            firstName: fullProfile.firstName,
            lastName: fullProfile.lastName,
            bio: fullProfile.bio || '',
            phone: fullProfile.phone || '',
            dateOfBirth: fullProfile.dateOfBirth || '',
            address: fullProfile.address || {},
            preferences: fullProfile.preferences || {},
          });
        } catch (error) {
          console.error('Failed to load profile:', error);
          // Show user-friendly error message
          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              apiUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'}/auth/me`,
            });
          }
        }
      }
    };

    loadProfile();
  }, [user, reset]);

  const onSubmit = async (data: UserProfile) => {
    setIsLoading(true);
    clearError();

    try {
      const profileUpdate: UserProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        preferences: data.preferences,
      };

      const updatedUser = await userApi.updateProfile(profileUpdate);
      setProfileData(updatedUser);

      addToast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      addToast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordData & { confirmPassword: string }) => {
    setIsLoading(true);
    clearError();

    try {
      await userApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      passwordForm.reset();

      addToast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully. Please login again.',
        type: 'success',
      });

      // Logout user after password change
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {profileData.avatarUrl ? (
                        <img
                          src={profileData.avatarUrl}
                          alt={`${profileData.firstName} ${profileData.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{profileData.firstName} {profileData.lastName}</h3>
                      <p className="text-sm text-gray-500">{profileData.email}</p>
                      {profileData.bio && (
                        <p className="text-sm text-gray-600 mt-1">{profileData.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{profileData.email}</span>
                      {profileData.emailVerified && (
                        <span className="text-green-600 text-xs">✓ Verified</span>
                      )}
                    </div>
                    {profileData.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                    {profileData.address && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>
                          {profileData.address.city}, {profileData.address.state}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        Joined {new Date(profileData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your personal information and email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        {...register('firstName')}
                        disabled={isLoading}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        {...register('lastName')}
                        disabled={isLoading}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        {...register('phone')}
                        disabled={isLoading}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                      {...register('bio')}
                      disabled={isLoading}
                    />
                    {errors.bio && (
                      <p className="text-sm text-red-600">{errors.bio.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                      disabled={isLoading}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Address</Label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          type="text"
                          placeholder="123 Main St"
                          {...register('address.street')}
                          disabled={isLoading}
                        />
                        {errors.address?.street && (
                          <p className="text-sm text-red-600">{errors.address.street.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          type="text"
                          placeholder="Anytown"
                          {...register('address.city')}
                          disabled={isLoading}
                        />
                        {errors.address?.city && (
                          <p className="text-sm text-red-600">{errors.address.city.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          type="text"
                          placeholder="CA"
                          {...register('address.state')}
                          disabled={isLoading}
                        />
                        {errors.address?.state && (
                          <p className="text-sm text-red-600">{errors.address.state.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          type="text"
                          placeholder="12345"
                          {...register('address.zipCode')}
                          disabled={isLoading}
                        />
                        {errors.address?.zipCode && (
                          <p className="text-sm text-red-600">{errors.address.zipCode.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Additional details about your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">User ID</Label>
                    <p className="mt-1 text-sm">{profileData.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email Verified</Label>
                    <p className="mt-1 text-sm">{profileData.emailVerified ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                    <p className="mt-1 text-sm">
                      {new Date(profileData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                    <p className="mt-1 text-sm">
                      {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>

                {profileData.preferences && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-500">Preferences</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {Object.entries(profileData.preferences).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium capitalize">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter your current password"
                      {...passwordForm.register('currentPassword')}
                      disabled={isLoading}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                      {...passwordForm.register('newPassword')}
                      disabled={isLoading}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      {...passwordForm.register('confirmPassword')}
                      disabled={isLoading}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Change Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Delete Account Section */}
            <Card className="mt-6 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Delete Account
                </CardTitle>
                <CardDescription className="text-red-600">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-1">Warning</h4>
                      <p className="text-sm text-red-700">
                        Deleting your account will permanently remove all your data including profile information,
                        preferences, and any other associated content. This action cannot be reversed.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={deleteForm.handleSubmit(async (data) => {
                  setIsLoading(true);
                  clearError();

                  try {
                    await userApi.deleteAccount({ password: data.password });

                    addToast({
                      title: 'Account Deleted',
                      description: 'Your account has been permanently deleted.',
                      type: 'info',
                    });

                    // Logout and redirect to home
                    setTimeout(() => {
                      window.location.href = '/';
                    }, 2000);
                  } catch (error) {
                    console.error('Failed to delete account:', error);
                    addToast({
                      title: 'Deletion Failed',
                      description: 'Failed to delete account. Please check your password.',
                      type: 'error',
                    });
                  } finally {
                    setIsLoading(false);
                  }
                })} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deletePassword">Confirm Password</Label>
                    <Input
                      id="deletePassword"
                      type="password"
                      placeholder="Enter your password"
                      {...deleteForm.register('password')}
                      disabled={isLoading}
                    />
                    {deleteForm.formState.errors.password && (
                      <p className="text-sm text-red-600">
                        {deleteForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmDelete">
                      Type "DELETE" to confirm
                    </Label>
                    <Input
                      id="confirmDelete"
                      type="text"
                      placeholder="Type DELETE to confirm"
                      {...deleteForm.register('confirmDelete')}
                      disabled={isLoading}
                    />
                    {deleteForm.formState.errors.confirmDelete && (
                      <p className="text-sm text-red-600">
                        {deleteForm.formState.errors.confirmDelete.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete Account
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
