import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { APP_NAME } from '@/lib/config';
import { paths } from '@/lib/paths';
import {
  ArrowRightIcon,
  DrillsToolIcon,
  ProgressToolIcon,
  ReaderToolIcon,
  SettingsToolIcon,
  buttonClassName,
} from '@/ui';
import styles from './HomePage.module.css';
import { LivePreview } from './LivePreview';

const STEPS = [
  {
    title: 'Paste your text',
    text: 'An article, an email, a chapter – anything you want to get through.',
  },
  {
    title: 'Pick a speed',
    text: 'Start near your normal pace and raise the words per minute as you get comfortable.',
  },
  {
    title: 'Keep your eyes still',
    text: 'Words appear in one spot, lined up on the red focus letter, so your eyes don’t have to move.',
  },
];

interface Tool {
  icon: ReactNode;
  stage: number;
  title: string;
  text: string;
  /** Where the tool lives, once its stage is built. */
  to?: string;
}

/** The site's tools, in the order they are being built. A tool with a link is ready to use. */
const TOOLS: Tool[] = [
  {
    icon: <ReaderToolIcon />,
    stage: 1,
    title: 'RSVP Reader',
    text: 'One word at a time with a speed slider, pause and rewind.',
    to: paths.read(),
  },
  {
    icon: <SettingsToolIcon />,
    stage: 2,
    title: 'Reading settings',
    text: 'Font size, dark mode and focus-letter color, saved in your browser.',
  },
  {
    icon: <DrillsToolIcon />,
    stage: 3,
    title: 'Training drills',
    text: 'Word chunking, a pacer line and peripheral-vision exercises.',
  },
  {
    icon: <ProgressToolIcon />,
    stage: 4,
    title: 'Speed test & progress',
    text: 'Measure your WPM with a short quiz and see your history over time.',
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const content = (
    <>
      <div className={styles.toolTop}>
        {tool.icon}
        <span className={styles.chip} data-ready={tool.to ? '' : undefined}>
          Stage {tool.stage}
        </span>
      </div>
      <h3>{tool.title}</h3>
      <p>{tool.text}</p>
    </>
  );
  return tool.to ? (
    <Link to={tool.to} className={styles.tool}>
      {content}
    </Link>
  ) : (
    <div className={styles.tool}>{content}</div>
  );
}

export function HomePage() {
  return (
    <>
      <title>{APP_NAME}</title>

      <section className={`container ${styles.hero}`}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Free speed reading trainer</p>
          <h1 className={styles.headline}>
            Read faster.
            <br />
            Stay focused.
          </h1>
          <p className={styles.lede}>
            Paste any text or open a book, and read it one word at a time at the speed you choose.
          </p>
          <div className={styles.cta}>
            <Link to={paths.read()} className={buttonClassName('primary')}>
              Start reading
              <ArrowRightIcon />
            </Link>
            <Link to={paths.library()} className={buttonClassName('secondary')}>
              Open your library
            </Link>
          </div>
        </div>
        <div className={styles.preview}>
          <LivePreview />
        </div>
      </section>

      <section className={styles.band} aria-labelledby="how-title">
        <div className={`container ${styles.section}`}>
          <h2 id="how-title" className={styles.sectionTitle}>
            How it works
          </h2>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="tools-title">
        <div className={styles.sectionHead}>
          <h2 id="tools-title" className={styles.sectionTitle}>
            Tools
          </h2>
          <p className={styles.sectionLede}>
            Each tool is its own page, added one stage at a time.
          </p>
        </div>
        <div className={styles.tools}>
          {TOOLS.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>
      </section>
    </>
  );
}
