import { useCallback, useEffect, useState } from "react";
import {
  InsightsService,
  TrendingTopic,
  SuggestedCommunity,
  ThreadInsight,
} from "../services";

export const useInsights = () => {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [communities, setCommunities] = useState<SuggestedCommunity[]>([]);
  const [threadInsights, setThreadInsights] = useState<ThreadInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [topics, communitiesResult, threads] = await Promise.all([
        InsightsService.fetchTrendingTopics(),
        InsightsService.discoverCommunities(),
        InsightsService.fetchThreadInsights(),
      ]);
      setTrendingTopics(topics);
      setCommunities(communitiesResult);
      setThreadInsights(threads);
    } catch (err) {
      console.error("Failed to load insights", err);
      setError("Unable to load community insights right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshInsights();
  }, [refreshInsights]);

  return {
    trendingTopics,
    communities,
    threadInsights,
    refreshInsights,
    isLoading,
    error,
  };
};
