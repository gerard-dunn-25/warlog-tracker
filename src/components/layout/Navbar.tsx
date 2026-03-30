import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { Swords, Shield, Scroll } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/warbands", label: "Warbands", icon: Shield },
  { to: "/sessions", label: "Sessions", icon: Scroll },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <Swords className="h-5 w-5" />
            <span>Warlog</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  location.pathname.startsWith(to)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
        <UserButton />
      </div>
    </nav>
  );
}