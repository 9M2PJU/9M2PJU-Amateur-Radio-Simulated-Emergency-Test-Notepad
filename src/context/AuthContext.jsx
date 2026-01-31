import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [impersonatedUser, setImpersonatedUser] = useState(null);
    const [autoLogoutMinutes, setAutoLogoutMinutes] = useState(5); // Default 5 mins
    const timerRef = useRef(null);

    useEffect(() => {
        // Check active session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchSystemConfig();
            } else {
                setLoading(false);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchSystemConfig();
            } else {
                setProfile(null);
                setImpersonatedUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchSystemConfig = async () => {
        try {
            const { data } = await supabase
                .from('system_config')
                .select('value')
                .eq('key', 'auto_logout_minutes')
                .single();

            if (data?.value?.minutes) {
                setAutoLogoutMinutes(data.value.minutes);
            }
        } catch (error) {
            console.error("AuthContext: Error fetching logout config:", error);
        }
    };

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const register = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        const { error } = await supabase.auth.signOut();

        // Clear donation session tracking
        if (user?.id) {
            sessionStorage.removeItem(`lastDonationDismissed_${user.id}`);
        }
        sessionStorage.removeItem('lastDonationDismissed'); // Cleanup legacy/fallback

        if (error) throw error;
    };

    const impersonate = async (targetUser) => {
        if (!profile?.is_super_admin) {
            throw new Error("Unauthorized");
        }
        if (targetUser === null) {
            setImpersonatedUser(null);
            return;
        }
        setImpersonatedUser(targetUser);
    };

    // Inactivity Timer Implementation
    useEffect(() => {
        if (!user) return;

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const handleActivity = () => {
            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                console.log(`Auto-logout triggered: ${autoLogoutMinutes} minutes of inactivity.`);
                logout();
            }, autoLogoutMinutes * 60 * 1000);
        };

        // Initialize timer
        handleActivity();

        // Listen for user activity
        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [user, autoLogoutMinutes]);

    const effectiveUser = impersonatedUser ? { id: impersonatedUser } : user;

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            login,
            register,
            logout,
            impersonate,
            impersonatedUser,
            effectiveUser
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
