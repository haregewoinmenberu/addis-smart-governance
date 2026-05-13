import { Bell, Search, Moon, Sun, Globe, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { isDark, toggleTheme } from "@/lib/theme";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Topbar() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(isDark()), []);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="h-full px-4 lg:px-6 flex items-center gap-3">
        <div className="lg:hidden h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>

        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search technologies, vendors, requests…"
            className="pl-9 h-10 bg-muted/50 border-transparent focus-visible:bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 h-9">
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline text-xs font-medium">EN</span>
                <ChevronDown className="h-3 w-3 hidden md:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>አማርኛ</DropdownMenuItem>
              <DropdownMenuItem>Afaan Oromoo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setDark(toggleTheme())}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications <Badge variant="secondary" className="text-[10px]">5 new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[
                { t: "New technology request submitted", s: "Bole Sub-City • 2m ago" },
                { t: "Compliance audit scheduled", s: "ITDB • 1h ago" },
                { t: "Cybersecurity alert: medium severity", s: "SOC • 3h ago" },
                { t: "Vendor SLA breach detected", s: "Procurement • 1d ago" },
              ].map((n, i) => (
                <DropdownMenuItem key={i} className="flex flex-col items-start gap-0.5 py-2.5">
                  <span className="text-sm font-medium">{n.t}</span>
                  <span className="text-xs text-muted-foreground">{n.s}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-xl hover:bg-muted transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">AB</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold">Abel Bekele</span>
                  <span className="text-[10px] text-muted-foreground">ITDB Administrator</span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:inline" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuItem>Activity log</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
