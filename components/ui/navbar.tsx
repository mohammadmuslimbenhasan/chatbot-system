'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Menu, 
  X, 
  Settings, 
  Users, 
  Shield,
  Home,
  LogIn
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  variant?: 'default' | 'admin' | 'agent';
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const defaultNavItems: NavItem[] = [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Setup', href: '/setup', icon: <Settings className="w-4 h-4" /> },
    { label: 'Admin', href: '/admin/login', icon: <Shield className="w-4 h-4" /> },
    { label: 'Agent Login', href: '/agent/login', icon: <Users className="w-4 h-4" /> },
  ];

  const navItems = defaultNavItems;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-xl font-bold text-gray-900 hidden xs:block">ChatBot System</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={isActive(item.href) ? 'default' : 'ghost'} 
                  size="sm"
                  className="gap-2"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button 
                    variant={isActive(item.href) ? 'default' : 'ghost'} 
                    className="w-full justify-start gap-3"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
