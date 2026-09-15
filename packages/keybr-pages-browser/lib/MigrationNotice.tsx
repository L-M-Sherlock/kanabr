import { Pages } from "@keybr/pages-shared";
import { useIntl } from "react-intl";
import { Link } from "react-router";
import * as styles from "./MigrationNotice.module.less";
import { KEYBR_STATIC } from "./static.ts";

export function MigrationNotice() {
  const { formatMessage, locale } = useIntl();
  if (process.env.VERCEL !== "1" || !KEYBR_STATIC) {
    return null;
  }
  const title = formatMessage({
    id: "migration.pages.title",
    defaultMessage: "Continue practicing on GitHub Pages",
  });
  return (
    <aside className={styles.root} aria-label={title}>
      <strong>{title}</strong>
      <p className={styles.description}>
        {formatMessage({
          id: "migration.pages.description",
          defaultMessage:
            "We recommend moving to our GitHub Pages site. Your progress does not transfer automatically: first choose Export data on this site's Profile page, then choose Import data on the new site's Profile page.",
        })}
      </p>
      <div className={styles.actions}>
        <Link to={Pages.profile.path}>
          {formatMessage({
            id: "migration.pages.export",
            defaultMessage: "Go to Profile to export",
          })}
        </Link>
        <a
          href={`https://l-m-sherlock.github.io/kanabr/${locale}/profile/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {formatMessage({
            id: "migration.pages.open",
            defaultMessage: "Open the new site to import",
          })}
        </a>
      </div>
    </aside>
  );
}
