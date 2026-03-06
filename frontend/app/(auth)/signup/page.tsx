import Signup from "./components/SignUp";
import GuestGuard from "@/components/guards/GuestGuard";

export default function SignupPage() {
  return (
    <GuestGuard>
      <Signup />
    </GuestGuard>
  );
}
