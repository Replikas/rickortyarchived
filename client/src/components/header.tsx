import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Atom, Search, Menu, User, LogOut, Upload } from "lucide-react";

interface HeaderProps {
  onSearch?: (search: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-dark-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center">
                <Atom className="text-dark-bg h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-neon-green">Rickorty Archive</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className={`transition-colors ${
                  isActive("/") 
                    ? "text-neon-green" 
                    : "text-muted-foreground hover:text-neon-green"
                }`}
              >
                Home
              </Link>
              <Link 
                href="/browse" 
                className={`transition-colors ${
                  isActive("/browse") 
                    ? "text-neon-green" 
                    : "text-muted-foreground hover:text-neon-green"
                }`}
              >
                Browse
              </Link>
              <Link 
                href="/upload" 
                className={`transition-colors ${
                  isActive("/upload") 
                    ? "text-neon-green" 
                    : "text-muted-foreground hover:text-neon-green"
                }`}
              >
                Upload
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search fanworks, tags, creators..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-dark-elevated border-border pl-10 focus:border-neon-green focus:ring-neon-green/20"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </form>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setLocation("/upload")}
              className="bg-neon-green text-dark-bg hover:bg-neon-green/90 glow-neon hidden md:flex"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Work
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full glow-portal">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback className="bg-portal-blue text-white">
                      {user?.firstName?.[0] || user?.email?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-dark-surface border-border" align="end">
                <DropdownMenuItem onClick={() => setLocation("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search fanworks, tags, creators..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full bg-dark-elevated border-border pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <Link 
                  href="/" 
                  className={`block py-2 px-3 rounded transition-colors ${
                    isActive("/") 
                      ? "bg-neon-green text-dark-bg" 
                      : "text-muted-foreground hover:text-neon-green"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/browse" 
                  className={`block py-2 px-3 rounded transition-colors ${
                    isActive("/browse") 
                      ? "bg-neon-green text-dark-bg" 
                      : "text-muted-foreground hover:text-neon-green"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse
                </Link>
                <Link 
                  href="/upload" 
                  className={`block py-2 px-3 rounded transition-colors ${
                    isActive("/upload") 
                      ? "bg-neon-green text-dark-bg" 
                      : "text-muted-foreground hover:text-neon-green"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Upload
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
