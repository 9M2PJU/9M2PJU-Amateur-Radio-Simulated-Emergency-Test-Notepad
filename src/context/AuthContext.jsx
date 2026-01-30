import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [impersonatedUser, setImpersonatedUser] = useState(null);

    useEffect(() => {
        // Check active session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setImpersonatedUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            console.log("AuthContext: Fetching profile for", userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error("AuthContext: Error fetching profile:", error);
                throw error;
            }

            console.log("AuthContext: Profile loaded:", data);
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
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const impersonate = async (targetUser) => {
        // Only allow if current real user is super admin
        if (!profile?.is_super_admin) {
            throw new Error("Unauthorized");
        }

        if (targetUser === null) {
            setImpersonatedUser(null);
            return;
        }

        // Just sets the context state, requests will use this ID for RLS impersonation context if we were using RLS functions, 
        // but for now we'll handle it via manual queries or client-side context logic, 
        // OR we can't truly "impersonate" at RLS level easily without Postgres functions. 
        // For this app's requirement: "super admin can see any users logger data and outbox".
        // We will expose the `effectiveUser` to components.
        setImpersonatedUser(targetUser);
    };

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
            effectiveUser // Components should use this to Fetch Data
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
