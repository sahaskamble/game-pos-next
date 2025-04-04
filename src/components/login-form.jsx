'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";
import PostLoginSplash from "@/components/layout/PostLoginSplash";

export function LoginForm({ className, ...props }) {
  const { branches, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  console.log(branches);

  // Check if the logged-in user's branch matches the selected branch
  function verifyBranch(data, branch) {
    if (!data?.record?.branch_id) {
      console.log(data);
      return false;
    }
    return data?.record?.branch_id.includes(branch);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!username || !password || !branch) {
      alert("Please fill in all fields");
      return;
    }

    const response = await login(username, password);

    if (!verifyBranch(response, branch)) {
      toast.error('You are not Authorized for this branch.');
      return;
    }

    // Show splash screen on successful login
    if (response?.record?.role) {
      localStorage.setItem('branch_id', branch);
      setShowSplash(true);
      toast.success("Authorization successful");
      return; // Let the splash screen handle navigation
    }

    toast.warning("You are not Authorized by role for this application");
  }

  if (showSplash) {
    return <PostLoginSplash />;
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-1"
            placeholder="Enter your username"
          />
        </div>
        <div className="grid gap-2 relative">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-1"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-10 p-2 inline-flex justify-center items-center transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <div>
          <Label htmlFor="branch">Select Branch</Label>
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger className="mb-4">
              {branch.length === 0 ? "Select the branch" : <SelectValue />}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Select the branch">Select the branch</SelectItem>
              {branches.map((b, index) => (
                <SelectItem key={index} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full text-white font-bold">
          Login
        </Button>
      </div>
    </form>
  );
}

