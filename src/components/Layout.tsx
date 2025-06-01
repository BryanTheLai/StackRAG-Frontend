import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

const links = [
  { link: "/", label: "Home" },
  { link: "/private/profile/ec2-525-61", label: "Profile" },
  { link: "/private/section/ec2-525-61", label: "Section" },
  { link: "/non-existent-page", label: "Error" },
  { link: "/login", label: "Login" },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <>
      <nav className="flex space-x-4 p-4 bg-base-100 border-b border-base-300">
        {links.map(({ link, label }) => (
          <Link
            key={label}
            href={link}
            className={`px-3 py-2 rounded transition-colors text-base font-medium ${
              location === link
                ? 'bg-primary text-primary-content'
                : 'text-neutral hover:bg-base-200'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {children}
    </>
  );
}
