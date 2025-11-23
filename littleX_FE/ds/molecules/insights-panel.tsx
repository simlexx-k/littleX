import React from "react";
import { Button } from "../atoms/button";
import { cn } from "@/_core/utils";
import {
  TrendingUp,
  RefreshCw,
  Users,
  MessageCircle,
} from "lucide-react";
import type {
  TrendingTopic,
  SuggestedCommunity,
  ThreadInsight,
} from "@/modules/insights/services";

interface InsightsPanelProps {
  trendingTopics: TrendingTopic[];
  communities: SuggestedCommunity[];
  threadInsights: ThreadInsight[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

export const InsightsPanel = ({
  trendingTopics,
  communities,
  threadInsights,
  isLoading = false,
  error = null,
  onRefresh,
  className,
}: InsightsPanelProps) => {
  const latestThread = threadInsights[0];
  const latestSummary =
    latestThread?.summary || latestThread?.thread || "No summary available";
  const hasContent =
    trendingTopics.length > 0 || communities.length > 0 || !!latestThread;

  return (
    <section
      className={cn(
        "space-y-4 border-t border-sidebar-border px-4 py-4 bg-sidebar-background",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>Community Insights</span>
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            aria-label="Refresh community insights"
          >
            <RefreshCw className="size-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading insights...</p>
      ) : error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : !hasContent ? (
        <p className="text-xs text-muted-foreground">
          No insights available yet.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Trending Topics */}
          {trendingTopics.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                <span>Trending topics</span>
                <span>{trendingTopics.length} topics</span>
              </div>
              <div className="space-y-2">
                {trendingTopics.slice(0, 3).map((topic) => (
                  <div
                    key={topic.topic}
                    className="rounded-xl border border-border bg-muted/10 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-sidebar-foreground">
                        #{topic.topic}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        {topic.mentions} mentions
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {topic.sample || "No additional context yet."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Communities */}
          {communities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                <span>
                  <Users className="w-3 h-3 inline-block mr-1" />
                  Communities
                </span>
                <span>{communities.length} clusters</span>
              </div>
              <div className="space-y-2">
                {communities.slice(0, 2).map((community) => (
                  <div
                    key={community.community}
                    className="rounded-xl border border-border/50 bg-background p-3 space-y-1"
                  >
                    <p className="text-sm font-semibold text-sidebar-foreground">
                      {community.community}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Focus: #{community.topic}
                    </p>
                    <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>{community.members} members</span>
                      <span>Engagement {community.engagement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thread Summary */}
          {latestThread && (
            <div className="rounded-xl border border-border/60 bg-muted/5 p-3 space-y-1">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                <span>
                  <MessageCircle className="w-3 h-3 inline-block mr-1" />
                  Thread highlight
                </span>
                <span>{latestThread.engagement.toFixed(1)} engagement</span>
              </div>
              <p className="text-sm font-semibold text-sidebar-foreground">
                {latestSummary}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Participants: {latestThread.participants?.length || 0}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Last activity: {latestThread.last_activity}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
