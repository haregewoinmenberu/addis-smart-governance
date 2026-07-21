import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface PermissionFilterProps {
  onSearch?: (search: string) => void;
  onModuleChange?: (module: string) => void;
  modules?: string[];
}

export function PermissionFilter({
  onSearch,
  onModuleChange,
  modules = [],
}: PermissionFilterProps) {
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const handleModuleChange = (value: string) => {
    setSelectedModule(value);
    onModuleChange?.(value);
  };

  const handleClear = () => {
    setSearch("");
    setSelectedModule("all");
    onSearch?.("");
    onModuleChange?.("all");
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <Select value={selectedModule} onValueChange={handleModuleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Module" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modules</SelectItem>
          {modules.map((module) => (
            <SelectItem key={module} value={module}>
              {module.charAt(0).toUpperCase() + module.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(search || selectedModule !== "all") && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
