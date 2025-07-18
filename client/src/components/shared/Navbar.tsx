'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Film, Search, User, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getCurrentUser, logout } from '@/service/AuthService';
import { useUser } from '@/context/userContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/series', label: 'Series' },
  { href: '/browse', label: 'Browse' },
];

const Navbar = () => {
  const { user, setUser } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to the search page with the query parameter
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-black shadow-md m-2 rounded-xl">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
          <Film className="h-6 w-6 bg-white" />
          <span className="hidden sm:inline text-white">MediaHaven</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href && href !== '/';
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3 py-1 rounded-md font-medium transition-all duration-200
                  ${isActive
                    ? 'text-stone-200 font-semibold shadow-inner bg-gradient-to-t from-stone-800/70 to-stone-900/0 border border-stone-600'
                    : ''
                  }
                  text-white hover:text-white hover:font-semibold hover:shadow-[0_0_15px_2px_rgba(255,255,255,0.4)] hover:bg-gradient-to-r from-slate-700/70 via-gray-800/80 to-black/80
                `}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search movies, series..."
                className="w-64 pr-10 bg-gray-800 text-white border-gray-700"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Search className="h-4 w-4" />
              </button>
              <X
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer text-gray-400 hover:text-red-400"
                onClick={() => setIsSearchOpen(false)}
              />
            </form>

          ) : (
            <Search
              className="h-5 w-5 text-white hover:text-primary transition-colors cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
            />
          )}

          {!user ? (
            <>
              <Link href="/login">
                <Button variant="outline" className="gap-2 border-white text-black hover:bg-gray-800">
                  <User className="h-4 w-4 text-black" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button className="gap-2 bg-primary hover:bg-primary/80 text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin/product">
                  <Button className="bg-primary text-white hover:bg-primary/80">
                    Dashboard
                  </Button>
                </Link>
              )}
              <span className="text-white font-medium">{user.name || 'User'}</span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Search
            className="h-5 w-5 text-white hover:text-primary transition-colors cursor-pointer mr-2"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          />
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="md:hidden px-4 py-2 border-t border-gray-800">
          <form onSubmit={handleSearchSubmit}>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search movies, series..."
              className="w-full bg-gray-800 text-white border-gray-700"
              autoFocus
            />
          </form>
        </div>
      )}

      {isOpen && (
        <div className="md:hidden px-4 py-2 border-t border-gray-800 bg-black animate-fade-in">
          <div className="flex flex-col space-y-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}

            <div className="flex gap-2 py-2 mr-2">
              {!user ? (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full text-white border-white hover:bg-gray-800">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/80 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin/media" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/80 text-white">
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="destructive"
                    className="mr-2"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;