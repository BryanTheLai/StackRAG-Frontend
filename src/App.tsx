import Home from "@/pages/Home";
import ErrorPage from "@/pages/Error";
import { Link, Route, Switch } from "wouter";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import Section from "@/pages/private/Section";
import Profile from "@/pages/private/Profile";

export default function App() {
  return (
    <AuthProvider>
      <MantineProvider>
        <nav style={{ padding: "10px 20px", marginBottom: "20px", borderBottom: "1px solid #ccc", background: "#f9f9f9", display: "flex", gap: "15px", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            Home
          </Link>
          <Link href="/login" style={{ textDecoration: "none" }}>
            Login
          </Link>
          <Link href="/private/profile/ec2-525-61" style={{ textDecoration: "none" }}>
            Link to Profile for 'ec2-525-61' (Private)
          </Link>
          <Link href="/private/section/ec2-525-61" style={{ textDecoration: "none" }}>
            Link to Section for 'ec2-525-61' (Private)
          </Link>
          <Link href="/non-existent-page" style={{ textDecoration: "none" }}>
            Test 404
          </Link>
        </nav>

        <div style={{ padding: "0 20px" }}>
          <Switch>
            <Route path="/" component={Home} />
            
            <Route path="/private/profile/:id">
              {(_params) => (
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              )}
            </Route>
            <Route path="/private/section/:id">
              {(_params) => (
                <PrivateRoute>
                  <Section />
                </PrivateRoute>
              )}
            </Route>

            <Route>
              <ErrorPage
                title="404: Page Not Found"
                message="Sorry, the page you are looking for does not exist."
              />
            </Route>
          </Switch>
        </div>
      </MantineProvider>
    </AuthProvider>
  );
}