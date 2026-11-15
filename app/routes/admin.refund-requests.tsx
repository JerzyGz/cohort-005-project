import { z } from "zod";
import { data, isRouteErrorResponse, Link } from "react-router";
import { AlertTriangle, ReceiptText, UsersRound } from "lucide-react";
import type { Route } from "./+types/admin.refund-requests";
import { getCurrentUserId } from "~/lib/session";
import { parseParams } from "~/lib/validation";
import { db } from "~/db";
import { RefundRequestStatus, UserRole, users } from "~/db/schema";
import { eq } from "drizzle-orm";
import {
  listRefundRequests,
  type RefundRequestRow,
} from "~/lib/refund-requests.server";
import { cn, formatPrice } from "~/lib/utils";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

const searchSchema = z.object({
  tab: z.enum(["open", "all"]).default("open"),
  status: z.nativeEnum(RefundRequestStatus).optional(),
});

type Tab = z.infer<typeof searchSchema>["tab"];

export function meta() {
  return [
    { title: "Refund Requests — Cadence" },
    { name: "description", content: "Review learners' Refund Requests" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const currentUserId = await getCurrentUserId(request);

  if (!currentUserId) {
    throw data("Select a user from the DevUI panel to review Refund Requests.", {
      status: 401,
    });
  }

  const currentUser = db
    .select()
    .from(users)
    .where(eq(users.id, currentUserId))
    .get();

  if (!currentUser || currentUser.role !== UserRole.Admin) {
    throw data("Only admins can review Refund Requests.", { status: 403 });
  }

  const url = new URL(request.url);
  const { tab, status } = parseParams(
    Object.fromEntries(url.searchParams),
    searchSchema
  );

  const refundRequests =
    tab === "open"
      ? listRefundRequests({
          status: RefundRequestStatus.Open,
          oldestFirst: true,
        })
      : listRefundRequests({ status: status ?? null, oldestFirst: false });

  return { tab, status: status ?? null, refundRequests };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const statusLabels: Record<RefundRequestStatus, string> = {
  [RefundRequestStatus.Open]: "Open",
  [RefundRequestStatus.Approved]: "Approved",
  [RefundRequestStatus.Declined]: "Declined",
};

function StatusBadge({ status }: { status: RefundRequestStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === RefundRequestStatus.Open &&
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        status === RefundRequestStatus.Approved &&
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        status === RefundRequestStatus.Declined &&
          "bg-muted text-muted-foreground"
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function ReviewCell({ review }: { review: RefundRequestRow["review"] }) {
  if (review.kind === "teamLicence") {
    return (
      <div className="text-sm">
        <div className="flex items-center gap-1.5 font-medium">
          <UsersRound className="size-3.5" />
          Team licence · {review.seats} {review.seats === 1 ? "seat" : "seats"}
        </div>
        <div className="mt-0.5 text-muted-foreground">
          {review.seatsClaimed} of {review.seats} Seats Claimed
        </div>
      </div>
    );
  }

  if (review.courseProgress === null) {
    return (
      <span
        className="text-sm text-muted-foreground"
        title="No lesson in this course has a video length"
      >
        —
      </span>
    );
  }

  return (
    <div className="flex min-w-32 items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${review.courseProgress}%` }}
        />
      </div>
      <span className="text-sm font-medium">{review.courseProgress}%</span>
    </div>
  );
}

function tabLink(tab: Tab, status: RefundRequestStatus | null) {
  if (tab === "open") return "?tab=open";
  return status ? `?tab=all&status=${status}` : "?tab=all";
}

export default function AdminRefundRequests({
  loaderData,
}: Route.ComponentProps) {
  const { tab, status, refundRequests } = loaderData;
  const showDecision = tab === "all";

  const tabs: { tab: Tab; label: string }[] = [
    { tab: "open", label: "Open" },
    { tab: "all", label: "All" },
  ];

  const statusFilters: { status: RefundRequestStatus | null; label: string }[] =
    [
      { status: null, label: "Any state" },
      ...Object.values(RefundRequestStatus).map((value) => ({
        status: value,
        label: statusLabels[value],
      })),
    ];

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Refund Requests</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Refund Requests</h1>
        <p className="mt-1 text-muted-foreground">
          Review what learners have asked for, and how much of the course
          they have watched
        </p>
      </div>

      <div className="mb-4 inline-flex rounded-lg bg-muted p-1">
        {tabs.map((item) => (
          <Link
            key={item.tab}
            to={tabLink(item.tab, null)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              tab === item.tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {tab === "all" && (
        <div className="mb-4 flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Link
              key={filter.label}
              to={tabLink("all", filter.status)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                status === filter.status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      )}

      {refundRequests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <ReceiptText className="mx-auto mb-3 size-8 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {tab === "open"
                ? "No Open Refund Requests. Nothing is waiting for review."
                : "No Refund Requests match this filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {[
                      "Learner",
                      "Course",
                      "Refund Amount",
                      "Requested",
                      "Reason",
                      "Course Progress",
                      ...(showDecision ? ["State"] : []),
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {refundRequests.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border align-top last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">
                          {row.learnerName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {row.learnerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          to={`/courses/${row.courseSlug}`}
                          className="hover:underline"
                        >
                          {row.courseTitle}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatPrice(row.refundAmount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(row.requestedAt)}
                      </td>
                      <td className="min-w-56 max-w-sm px-4 py-3 text-sm">
                        <p className="whitespace-pre-line">{row.reason}</p>
                      </td>
                      <td className="px-4 py-3">
                        <ReviewCell review={row.review} />
                      </td>
                      {showDecision && (
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={row.status} />
                          {row.status !== RefundRequestStatus.Open && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {row.resolvedAt ? formatDate(row.resolvedAt) : "—"}
                              {row.resolvedByName && ` by ${row.resolvedByName}`}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Something went wrong";
  let message = "An unexpected error occurred while loading Refund Requests.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      title = "Sign in required";
      message =
        typeof error.data === "string"
          ? error.data
          : "Please select a user from the DevUI panel.";
    } else if (error.status === 403) {
      title = "Access denied";
      message =
        typeof error.data === "string"
          ? error.data
          : "Only admins can access this page.";
    } else {
      title = `Error ${error.status}`;
      message = typeof error.data === "string" ? error.data : error.statusText;
    }
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="text-center">
        <AlertTriangle className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">{title}</h1>
        <p className="mb-6 text-muted-foreground">{message}</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
