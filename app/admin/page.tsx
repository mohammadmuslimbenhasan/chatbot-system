'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Users, 
  MessageSquare, 
  Palette, 
  LogOut, 
  Menu, 
  X, 
  Home,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { AgentManagement } from '@/components/admin/AgentManagement';
import { FlowBuilder } from '@/components/admin/FlowBuilder';
import { BrandSettings } from '@/components/admin/BrandSettings';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('agents');

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const user = await authService.getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setProfile(user);
    setLoading(false);
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/admin/login');
  };

  const goToProxyLink = () => {
    router.push('/admin/proxy-link');
  };

  const goToMasterAgentList = () => {
    router.push('/admin/master-agent-list');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-base sm:text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Chatbot Management</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link href="/agent/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Users className="w-4 h-4" />
                  Agent Login
                </Button>
              </Link>
              <Link href="/embed" target="_blank">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Widget
                </Button>
              </Link>
            </nav>

            {/* User Info & Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block truncate max-w-[150px]">
                {profile?.email}
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm" className="hidden sm:flex">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
              
              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3 border-t space-y-2">
              <div className="text-xs text-gray-500 px-2 mb-2">{profile?.email}</div>
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link href="/agent/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Users className="w-4 h-4" />
                  Agent Login
                </Button>
              </Link>
              <Link href="/embed" target="_blank" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Preview Widget
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Quick Navigation */}
        <section className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Quick Navigation</h2>
              <p className="text-xs sm:text-sm text-gray-500">Go to key admin pages quickly</p>
            </div>

            <div className="flex flex-col xs:flex-row gap-2">
              <Button onClick={goToProxyLink} variant="default" size="sm" className="text-sm">
                প্রক্সি লিংক
              </Button>
              <Button onClick={goToMasterAgentList} variant="outline" size="sm" className="text-sm">
                মাস্টার এজেন্ট লিস্ট
              </Button>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="agents" className="gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Agents</span>
            </TabsTrigger>
            <TabsTrigger value="flow" className="gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Flow</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Brand</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <AgentManagement />
          </TabsContent>

          <TabsContent value="flow">
            <FlowBuilder />
          </TabsContent>

          <TabsContent value="branding">
            <BrandSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
