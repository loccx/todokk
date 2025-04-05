import "./App.css";
import { useState, useEffect } from "react";

// auth
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";

import { Button } from "./components/ui/button";
import { Todo } from "./components/Todo";
// import Clock from "./components/Clock"
import { Toaster } from "sonner";

import { ThemeProvider } from "./components/theme-provider";
// import { ThemeToggle } from './components/theme-toggle'

const supa_url = import.meta.env.VITE_SUPA_URL;
const anon_key = import.meta.env.VITE_ANON_KEY;

export const supabase = createClient(supa_url, anon_key);

function App() {
  
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => { // auth session
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

    return () => subscription.unsubscribe();
  }, []);

  async function signout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }  

  if (!session) {
    return (
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        theme='dark'
        view="magic_link"
        // localization={{
        //   variables: {
        //     magic_link: {
        //       email_input_placeholder: 'Your email address',
        //     },
        //   },
        // }}
      />
    );
  } else {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster position='bottom-center' richColors/>
        {/* <ThemeToggle/> */}
        <div className="flex">
          <Todo />
          <Button
            onClick={signout}
          >
          sign out
          </Button>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
