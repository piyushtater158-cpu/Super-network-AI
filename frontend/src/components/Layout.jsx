import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Home,
  Search,
  MessageSquare,
  Trophy,
  Settings,
  LogOut,
  Plus,
  User,
  Sparkles,
} from "lucide-react";
import { StarsBackground } from "../components/3d/Scenes";

const NavLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
      active
        ? "bg-white/10 text-white"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    }`}
  >
    <Icon size={18} />
    <span className="hidden md:inline text-sm font-medium">{label}</span>
  </Link>
);

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  ];

  return (
    <div className="min-h-screen bg-[hsl(240_10%_2%)] relative">
      <StarsBackground />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)] flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white hidden sm:block">
              SuperNetwork<span className="text-[hsl(250_100%_70%)]">AI</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                {...item}
                active={location.pathname === item.to}
              />
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/create-opportunity")}
              className="bg-white text-black hover:bg-white/90 rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2"
              data-testid="create-opportunity-btn"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Post</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors"
                  data-testid="user-menu-trigger"
                >
                  <Avatar className="w-8 h-8 border-2 border-white/20">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="bg-[hsl(250_100%_70%)] text-white text-sm">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[hsl(240_5%_10%)] border-white/10"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => navigate(`/profile/${user?.user_id}`)}
                  className="cursor-pointer text-slate-300 hover:text-white focus:text-white focus:bg-white/10"
                >
                  <User size={16} className="mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/settings")}
                  className="cursor-pointer text-slate-300 hover:text-white focus:text-white focus:bg-white/10"
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10"
                  data-testid="logout-btn"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
