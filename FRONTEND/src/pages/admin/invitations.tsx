import { useState, useCallback } from "react";
import { useGetIdentity, useList } from "@refinedev/core";
import { format }        from "date-fns";
import { Copy, Check, Plus, RefreshCw, Trash2 } from "lucide-react";
import axios             from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button }   from "@/components/ui/button";
import { Badge }    from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { RoleGuard }            from "@/components/auth/RoleGuard";
import type { User, AdminInvitation, InvitationStatus } from "@/types";
import { getInvitationStatus }  from "@/types";
import { cn }                   from "@/lib/utils";

const API = import.meta.env.VITE_BACKEND_URL as string;

interface GeneratedCode {
  code:      string;
  expiresAt: string;
}

function StatusBadge({ status }: { status: InvitationStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        status === "active"  && "border-green-500  text-green-600  dark:text-green-400",
        status === "expired" && "border-amber-500  text-amber-600  dark:text-amber-400",
        status === "used"    && "border-slate-400  text-slate-500  dark:text-slate-400"
      )}
    >
      {status}
    </Badge>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5"
    >
      {copied
        ? <><Check className="h-3.5 w-3.5" /> Copied</>
        : <><Copy className="h-3.5 w-3.5" /> Copy</>
      }
    </Button>
  );
}

export default function AdminInvitationsPage() {
  const { data: identity }        = useGetIdentity<User>();
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated]   = useState<GeneratedCode | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [revoking, setRevoking]     = useState<string | null>(null);

  // Fetch invitation list via Refine's useList
  // This calls GET /api/admin/invitations through the dataProvider
const {
  query: {
    data: listData,
    isLoading: listLoading,
    refetch: refetchList,
  },
} = useList<AdminInvitation>({
  resource: "admin/invitations",
});

  const invitations = listData?.data ?? [];

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenerateError(null);
    setGenerated(null);
    try {
      const res = await axios.post<{
        success:   boolean;
        code:      string;
        expiresAt: string;
      }>(
        `${API}/api/admin/invitations`,
        {},
        { withCredentials: true }
      );
      setGenerated({ code: res.data.code, expiresAt: res.data.expiresAt });
      void refetchList();
    } catch (err) {
      const msg =
        axios.isAxiosError(err)
          ? (err.response?.data as { error?: string })?.error ?? "Failed to generate invitation."
          : "Failed to generate invitation.";
      setGenerateError(msg);
    } finally {
      setGenerating(false);
    }
  }, [refetchList]);

  const handleRevoke = useCallback(async (id: string) => {
    setRevoking(id);
    try {
      await axios.delete(
        `${API}/api/admin/invitations/${id}`,
        { withCredentials: true }
      );
      void refetchList();
    } catch (err) {
      console.error("Revoke error:", err);
    } finally {
      setRevoking(null);
    }
  }, [refetchList]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Invitations</h1>
          <p className="text-muted-foreground mt-1">
            Generate single-use invitation codes for new administrators.
          </p>
        </div>

        {/* Generate card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate Invitation Code</CardTitle>
            <CardDescription>
              Each code is valid for 7 days and can only be used once.
              Share it directly with the person you are inviting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="gap-2"
            >
              {generating
                ? <><RefreshCw className="h-4 w-4 animate-spin" />Generating…</>
                : <><Plus className="h-4 w-4" />Generate Code</>
              }
            </Button>

            {generateError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{generateError}</AlertDescription>
              </Alert>
            )}

            {generated && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30">
                <AlertTitle className="text-green-800 dark:text-green-300 font-semibold">
                  Invitation Code Generated
                </AlertTitle>
                <AlertDescription className="mt-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <code className="text-lg font-mono font-bold tracking-widest text-green-900 dark:text-green-200">
                      {generated.code}
                    </code>
                    <CopyButton text={generated.code} />
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Expires:{" "}
                    <span className="font-medium">
                      {format(new Date(generated.expiresAt), "MMMM d, yyyy 'at' h:mm a")}
                    </span>
                  </p>
                  <p className="text-xs text-green-600/80 dark:text-green-500">
                    This code will not be shown again. Copy it now and share it securely.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Invitation list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Invitation History</CardTitle>
              <CardDescription>All invitations created by administrators.</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void refetchList()}
              className="gap-1.5"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", listLoading && "animate-spin")} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {listLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading…
              </div>
            ) : invitations.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No invitations yet. Generate one above.
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Used By</TableHead>
                      <TableHead>Used At</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((inv) => {
                      const status = getInvitationStatus(inv);
                      return (
                        <TableRow key={inv.id}>
                          <TableCell><StatusBadge status={status} /></TableCell>
                          <TableCell className="text-sm">
                            {inv.createdByName ?? inv.createdBy}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(inv.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(inv.expiresAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {inv.usedByEmail ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {inv.usedAt
                              ? format(new Date(inv.usedAt), "MMM d, yyyy")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {status === "active" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRevoke(inv.id)}
                                disabled={revoking === inv.id}
                                title="Revoke invitation"
                              >
                                {revoking === inv.id
                                  ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  : <Trash2 className="h-3.5 w-3.5" />
                                }
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}