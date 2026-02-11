import { Link as StaticLink } from "@keybr/widget";
import { useIntl } from "react-intl";
import * as styles from "./SubMenu.module.less";

export function SubMenu() {
  const { formatMessage } = useIntl();
  return (
    <div className={styles.root}>
      <GithubLink />
      <KeybrLink />
    </div>
  );
}

function GithubLink() {
  const { formatMessage } = useIntl();
  return (
    <StaticLink
      href="https://github.com/L-M-Sherlock/kanabr"
      target="github"
      title={formatMessage({
        id: "footer.githubLink.description",
        defaultMessage: "The source code of kanabr is available on GitHub.",
      })}
    >
      Github
    </StaticLink>
  );
}

function KeybrLink() {
  const { formatMessage } = useIntl();
  return (
    <StaticLink
      href="https://www.keybr.com/"
      target="keybr"
      title={formatMessage({
        id: "footer.keybrLink.description",
        defaultMessage:
          "For other languages and keyboard layouts, use keybr.com.",
      })}
    >
      keybr.com
    </StaticLink>
  );
}
