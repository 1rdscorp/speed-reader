import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router';
import { APP_NAME } from '@/lib/config';
import type { NavItem } from '@/lib/feature';
import { paths } from '@/lib/paths';
import { Logo } from '@/ui';
import styles from './AppShell.module.css';
import { ThemeToggle } from './ThemeToggle';

/** The frame around every page: logo, the navigation contributed by features, footer. */
export function AppShell({ navItems }: { navItems: NavItem[] }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`container ${styles.bar}`}>
          <Link to={paths.home()} className={styles.home} aria-label={`${APP_NAME} home`}>
            <Logo />
          </Link>
          <nav className={styles.nav} aria-label="Main">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={styles.navLink}>
                {item.label}
              </NavLink>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      {/* A new page opens at its top; going back returns to where you were. */}
      <ScrollRestoration />
      <footer className={styles.footer}>
        <div className={`container ${styles.footerBar}`}>
          <span>{APP_NAME} · hosted on GitHub Pages</span>
          <span>Everything runs in your browser – your text never leaves your device.</span>
        </div>
      </footer>
    </div>
  );
}
