import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const NavBar = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">
                    <i className="fas fa-route"></i>
                  </div>
                  <span className="text-xl font-bold text-neutral-800">Pivot Point</span>
                </div>
              </Link>
            </div>
            {!isLoading && user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/">
                  <div className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${isActive('/') ? 'border-primary text-neutral-900' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'}`}>
                    Dashboard
                  </div>
                </Link>
                <Link href="/adjacent-gigs">
                  <div className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${isActive('/adjacent-gigs') ? 'border-primary text-neutral-900' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'}`}>
                    Adjacent Gigs
                  </div>
                </Link>
                <Link href="/learning-paths">
                  <div className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${isActive('/learning-paths') ? 'border-primary text-neutral-900' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'}`}>
                    Learning Paths
                  </div>
                </Link>
                <Link href="/financial-tools">
                  <div className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${isActive('/financial-tools') ? 'border-primary text-neutral-900' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'}`}>
                    Financial Tools
                  </div>
                </Link>
                <Link href="/community">
                  <div className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${isActive('/community') ? 'border-primary text-neutral-900' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'}`}>
                    Community
                  </div>
                </Link>
              </div>
            )}
          </div>
          {!isLoading && (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? (
                <>
                  <button type="button" className="bg-white p-1 rounded-full text-neutral-400 hover:text-neutral-500">
                    <span className="sr-only">View notifications</span>
                    <i className="fas fa-bell"></i>
                  </button>

                  <div className="ml-3 relative">
                    <div>
                      <Link href="/profile">
                        <button type="button" className="flex text-sm rounded-full focus:outline-none">
                          <span className="sr-only">Open user menu</span>
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                            {user.firstName && user.lastName 
                              ? `${user.firstName[0]}${user.lastName[0]}`
                              : user.username.slice(0, 2).toUpperCase()}
                          </div>
                        </button>
                      </Link>
                    </div>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="ml-4 text-sm text-neutral-500 hover:text-neutral-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-x-2">
                  <Link href="/login">
                    <a className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark">
                      Log in
                    </a>
                  </Link>
                  <Link href="/register">
                    <a className="inline-flex items-center px-3 py-1.5 rounded-md border border-transparent shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark">
                      Register
                    </a>
                  </Link>
                </div>
              )}
            </div>
          )}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>

      <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        {!isLoading && user ? (
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/">
              <div className={`block pl-3 pr-4 py-2 text-base font-medium cursor-pointer ${isActive('/') ? 'bg-primary-light border-primary border-l-4 text-primary' : 'border-transparent border-l-4 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'}`}>
                Dashboard
              </div>
            </Link>
            <Link href="/adjacent-gigs">
              <div className={`block pl-3 pr-4 py-2 text-base font-medium cursor-pointer ${isActive('/adjacent-gigs') ? 'bg-primary-light border-primary border-l-4 text-primary' : 'border-transparent border-l-4 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'}`}>
                Adjacent Gigs
              </div>
            </Link>
            <Link href="/learning-paths">
              <div className={`block pl-3 pr-4 py-2 text-base font-medium cursor-pointer ${isActive('/learning-paths') ? 'bg-primary-light border-primary border-l-4 text-primary' : 'border-transparent border-l-4 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'}`}>
                Learning Paths
              </div>
            </Link>
            <Link href="/financial-tools">
              <div className={`block pl-3 pr-4 py-2 text-base font-medium cursor-pointer ${isActive('/financial-tools') ? 'bg-primary-light border-primary border-l-4 text-primary' : 'border-transparent border-l-4 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'}`}>
                Financial Tools
              </div>
            </Link>
            <Link href="/community">
              <div className={`block pl-3 pr-4 py-2 text-base font-medium cursor-pointer ${isActive('/community') ? 'bg-primary-light border-primary border-l-4 text-primary' : 'border-transparent border-l-4 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'}`}>
                Community
              </div>
            </Link>
            <Link href="/profile">
              <div className={`block pl-3 pr-4 py-2 text-base font-medium cursor-pointer ${isActive('/profile') ? 'bg-primary-light border-primary border-l-4 text-primary' : 'border-transparent border-l-4 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'}`}>
                Profile
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left block pl-3 pr-4 py-2 border-transparent border-l-4 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700 text-base font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/login">
              <div className="block pl-3 pr-4 py-2 text-base font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 cursor-pointer">
                Log in
              </div>
            </Link>
            <Link href="/register">
              <div className="block pl-3 pr-4 py-2 text-base font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 cursor-pointer">
                Register
              </div>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
