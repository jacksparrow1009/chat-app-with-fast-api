import Login from "./components/Login";
import GuestGuard from "@/components/guards/GuestGuard";

export default function LoginPage() {
  return (
    <GuestGuard>
      <Login />
    </GuestGuard>
  );
}
