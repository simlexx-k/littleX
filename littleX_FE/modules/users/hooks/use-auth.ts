"use client";

import useAppNavigation from "@/_core/hooks/useAppNavigation";
import { useEffect, useCallback, useState } from "react";
import { AuthService } from "../auth-service";
import { useAppDispatch, useAppSelector } from "@/store/useStore";
import {
  setUser,
  resetSuccess,
  setLoading,
  setInitialCheckComplete,
} from "@/store/userSlice";
import {
  changePassword,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from "../userActions";
import { useToast } from "@/ds/atoms/hooks/use-toast";

export function useAuth() {
  const dispatch = useAppDispatch();
  const {
    user,
    success,
    successMessage,
    error,
    initialCheckComplete,
    isLoading,
  } = useAppSelector((state) => state.users);
  const router = useAppNavigation();
  const { toast } = useToast();
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [sessionWarning, setSessionWarning] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      dispatch(setLoading(true));
      const currentUser = AuthService.getCurrentUser();
      dispatch(setUser(currentUser));
      dispatch(setLoading(false));
      dispatch(setInitialCheckComplete());
    };

    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      if (successMessage === "Login successful") {
        router.navigate("/");
        setSessionWarning(false);
        setSessionExpiry(AuthService.getSessionExpiry());
      } else if (successMessage === "Registration successful") {
        router.navigate("/auth/login");
      } else if (successMessage === "Logout successful") {
        router.navigate("/auth/login");
        setSessionWarning(false);
        setSessionExpiry(null);
      }
      dispatch(resetSuccess());
    }
  }, [success, successMessage, router, dispatch]);

  const login = useCallback(
    async (email: string, password: string) => {
      dispatch(loginUser({ email, password }));
    },
    [dispatch]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      dispatch(registerUser({ email, password }));
    },
    [dispatch]
  );

  const change_password = useCallback(
    async (currentPassword: string, newPassword: string) => {
      dispatch(changePassword({ currentPassword, newPassword }));
    },
    [dispatch]
  );

  const forgot_password = useCallback(
    async (email: string) => {
      dispatch(forgotPassword(email));
    },
    [dispatch]
  );

  const reset_password = useCallback(
    async (token: string, password: string) => {
      dispatch(resetPassword({ token, password }));
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    dispatch(logoutUser());
  }, [dispatch]);

  useEffect(() => {
    const expiry = AuthService.getSessionExpiry();
    if (!expiry) {
      setSessionWarning(false);
    }
    setSessionExpiry(expiry);
  }, [initialCheckComplete, successMessage]);

  useEffect(() => {
    if (!sessionExpiry) {
      return;
    }
    const timeLeft = sessionExpiry - Date.now();
    if (timeLeft <= 0) {
      toast({
        title: "Session expired",
        description: "You have been logged out for security reasons.",
        variant: "destructive",
      });
      setSessionExpiry(null);
      logout();
      return;
    }

    const warningThreshold = 60 * 1000;
    if (timeLeft <= warningThreshold && !sessionWarning) {
      toast({
        title: "Session expiring soon",
        description: "Extend your work by logging in again before the timeout.",
      });
      setSessionWarning(true);
    }

    const timer = setTimeout(() => {
      toast({
        title: "Session expired",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      setSessionExpiry(null);
      logout();
    }, timeLeft);

    return () => {
      clearTimeout(timer);
    };
  }, [sessionExpiry, sessionWarning, logout, toast]);

  return {
    login,
    register,
    logout,
    isLoading: isLoading,
    error: error,
    data: user,
    success: success,
    successMessage: successMessage,
    change_password,
    forgot_password,
    reset_password,
    isAuthenticated: !!user,
    initialCheckComplete: initialCheckComplete,
  };
}
