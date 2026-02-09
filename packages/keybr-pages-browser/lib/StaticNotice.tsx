import { Screen } from "@keybr/pages-shared";
import { useIntl } from "react-intl";

export function StaticNotice({ feature }: { readonly feature: string }) {
  const { formatMessage } = useIntl();
  return (
    <Screen>
      <h2>
        {formatMessage(
          {
            id: "static.notice.title",
            defaultMessage: "Unavailable in static mode",
          },
          {},
        )}
      </h2>
      <p>
        {formatMessage(
          {
            id: "static.notice.body",
            defaultMessage:
              "{feature} requires a server and is not available in the Vercel/static build.",
          },
          { feature },
        )}
      </p>
    </Screen>
  );
}
