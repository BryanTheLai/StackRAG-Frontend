import { useState, type ReactNode } from "react";
import { Link } from "wouter";

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
  const [active, setActive] = useState(links[0].link);

  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link}
      data-active={active === link.link || undefined}
      onClick={() => {
        setActive(link.link);
      }}
    >
      {link.label}
    </Link>
  ));
  return (
    <>
      <nav>{items}</nav>

      {children}
    </>
  );
}
