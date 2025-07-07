import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = "https://jrmyejvilobctxpqahsj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpybXllanZpbG9iY3R4cHFhaHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDAzNTMsImV4cCI6MjA2MzY3NjM1M30.nVcenQ8H_80RAd7VTgfE29fusqEHVcSK7IaPOClWH_Q";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: async (key) => {
        const result = await chrome.storage.local.get(key);
        return result[key] ?? null;
      },
      setItem: async (key, value) => {
        await chrome.storage.local.set({ [key]: value });
      },
      removeItem: async (key) => {
        await chrome.storage.local.remove(key);
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'auth') {
    handleAuth(request.payload).then(sendResponse);
    return true; // Indicates we will send a response asynchronously
  }
   if (request.type === 'auth:check') {
    checkAuth().then(sendResponse);
    return true;
  }
   if (request.type === 'auth:logout') {
    logout().then(sendResponse);
    return true;
  }
  if (request.type === 'generate:comments') {
    handleGenerateComments(request.payload).then(sendResponse);
    return true; // Indicates we will send a response asynchronously
  }
});

async function handleGenerateComments({ originalPost, tone, platform, maxLength }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: 'You must be logged in to generate comments.' };
  }

  console.log('Invoking Supabase function with payload:', { originalPost, tone, platform, maxLength });

  try {
    const { data, error } = await supabase.functions.invoke('generate-ai-comment', {
      body: {
        originalPost,
        platform,
        tone,
        maxLength
      }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    console.log('Received from Supabase function:', data);
    return { success: true, comments: data.comments };
  } catch (error) {
    console.error('Error invoking generate-ai-comment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

async function handleAuth({ mode, email, password, fullName }) {
  try {
    let result;
    if (mode === 'signup') {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `https://jrmyejvilobctxpqahsj.supabase.co/` // Placeholder, not used in extension flow
        }
      });
    } else {
      result = await supabase.auth.signInWithPassword({
        email,
        password
      });
    }

    if (result.error) throw result.error;
    return { success: true, user: result.data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        return { authenticated: true, user: session.user };
    }
    return { authenticated: false };
}

async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
}
