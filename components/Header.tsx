import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  isAdmin?: boolean;
}

export default function Header({ isAdmin = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
              🍳
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold text-primary-600">
                Lixi's Kitchen
              </span>
              <span className="text-xs text-sage-600 -mt-1">
                Cooking with Love
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
            >
              Blog
            </Link>
            <Link 
              href="/recipes" 
              className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
            >
              Recipes
            </Link>
            <Link 
              href="/about" 
              className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
            >
              Contact
            </Link>
            {isAdmin && (
              <button
                onClick={() => { window.location.href = '/api/auth/logout'; }}
                className="px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors font-medium text-sm"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-neutral-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-neutral-700 hover:text-primary-600 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/recipes"
                className="text-neutral-700 hover:text-primary-600 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recipes
              </Link>
              <Link
                href="/about"
                className="text-neutral-700 hover:text-primary-600 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-neutral-700 hover:text-primary-600 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {isAdmin && (
                <button
                  onClick={() => { window.location.href = '/api/auth/logout'; }}
                  className="text-left px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors font-medium text-sm mt-2"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

