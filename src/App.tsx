import Home from "@/pages/Home";
import ProfilePage from "@/pages/ProfilePage";
import ErrorPage from "@/pages/Error";
import { Link, Route, Switch } from "wouter";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

export default function App() {
  return (
    <MantineProvider>
      <nav style={{ padding: "10px 20px", marginBottom: "20px", borderBottom: "1px solid #ccc", background: "#f9f9f9" }}>
        <Link href="/" style={{ marginRight: "15px"}}>
          Home
        </Link>
        <Link href="/users/1" style={{ marginRight: "15px"}}>
          Profile (User 1)
        </Link>
        <Link href="/users/alex" style={{ marginRight: "15px" }}>
          Profile (User Alex)
        </Link>
        <Link href="/non-existent-page">
          Test 404
        </Link>
      </nav>

      <div style={{ padding: "0 20px" }}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/users/:id" component={ProfilePage} />

          {/* 2. Use the ErrorPage component for the 404 route */}
          <Route>
            <ErrorPage
              title="404: Page Not Found"
              message="Sorry, the page you are looking for does not exist."
            />
          </Route>
        </Switch>
      </div>
    </MantineProvider>
  );
}