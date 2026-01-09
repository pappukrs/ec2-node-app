'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, User, Mail, Calendar, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { userApi, UserSearchResult } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const searchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
});

type SearchFormData = z.infer<typeof searchSchema>;

function SearchContent() {
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  const query = watch('query');

  const onSubmit = async (data: SearchFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userApi.searchUsers(data.query);
      setSearchResults(response.users);
      setHasSearched(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      setError(message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search as user types (debounced)
  useEffect(() => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      onSubmit({ query });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search Users</h1>
          <p className="mt-2 text-sm text-gray-600">
            Find other users in the platform
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search Users</span>
            </CardTitle>
            <CardDescription>
              Enter a name or email to search for users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="query" className="sr-only">Search query</Label>
                  <Input
                    id="query"
                    type="text"
                    placeholder="Search by name or email..."
                    {...register('query')}
                    className="w-full"
                  />
                  {errors.query && (
                    <p className="text-sm text-red-600 mt-1">{errors.query.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Search Results ({searchResults.length})
              </h2>
            </div>

            {searchResults.length === 0 && !isLoading && (
          <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">
                      Try adjusting your search query or check the spelling.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

                  {searchResults.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                          alt={user.firstName}
                          className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                        <User className="w-6 h-6 text-gray-500" />
                          )}
                        </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                            </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {user.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                    </div>
                </div>
            </CardContent>
          </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <SearchContent />
    </ProtectedRoute>
  );
}