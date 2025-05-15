import Layout from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { Route, Switch } from "wouter";
import PrivateRoute from "@/components/PrivateRoute";
import Dashboard from "@/pages/private/Dashboard";
import Login from "@/pages/Login";
import Profile from "@/pages/private/Profile";
import Section from "@/pages/private/Section";
import ErrorPage from "@/pages/Error";
import Home from "@/pages/Home";


export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />

          <Route path="/private/dashboard">
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          </Route>

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
              message="Sorry, the page you are looking for does not exist@"
            />
          </Route>
        </Switch>
      </Layout>
    </AuthProvider>
  );
}
