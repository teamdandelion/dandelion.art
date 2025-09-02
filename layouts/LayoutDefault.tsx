import "./style.css";

import "./tailwind.css";
import logoUrl from "../assets/logo.svg";
import { Link } from "../components/Link.js";
import { ThemeToggle } from "../components/ThemeToggle.js";

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={"min-h-screen bg-base-100"}>
      <Header>
        <Logo />
        <div className={"flex items-center gap-6"}>
          <nav className={"flex items-center gap-6"}>
            <Link href="/">Home</Link>
          </nav>
          <ThemeToggle />
        </div>
      </Header>
      <Content>{children}</Content>
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <header className={"border-b border-base-300 bg-base-200"}>
      <div
        className={
          "max-w-5xl mx-auto px-5 py-4 flex items-center justify-between"
        }
      >
        {children}
      </div>
    </header>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return <main className={"max-w-5xl mx-auto px-5 py-8"}>{children}</main>;
}

function Logo() {
  return (
    <a href="/" className={"flex items-center"}>
      <img src={logoUrl} height={40} width={40} alt="logo" />
    </a>
  );
}
