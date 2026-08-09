import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@refinedev/core";

export default function PendingApproval() {
  const { mutate: logout } = useLogout();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
          <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Account Pending Approval</h1>
          <p className="text-muted-foreground">
            Your administrator account has been created and is awaiting review.
            You'll receive an email once an existing administrator approves your
            account.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-left space-y-2">
          <p className="text-sm font-medium">What happens next?</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>An admin will review your request.</li>
            <li>Your account status will be set to active.</li>
            <li>You can then log in with full admin access.</li>
          </ul>
        </div>

        <Button
          variant="outline"
          onClick={() => logout()}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}