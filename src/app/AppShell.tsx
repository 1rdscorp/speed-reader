import { Link, NavLink, Outlet } from 'react-router';
import { APP_NAME } from '@/lib/config';
import type { NavItem } from '@/lib/feature';
import { paths } from '@/lib/paths';
import { Wordmark } from '@/ui';
import styles from './AppShell.module.css';
import { ThemeToggle } from './ThemeToggle';

/** Chrome around ordinary pages: wordmark, navigation contributed by features, theme switch. */
export function AppShell({ navItems }: { navItems: NavItem[] }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to={paths.home()} className={styles.home} aria-label={`${APP_NAME} home`}>
          <Wordmark />
        </Link>
        {navItems.length > 0 && (
          <nav className={styles.nav} aria-label="Main">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={styles.navLink}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
        <ThemeToggle />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
