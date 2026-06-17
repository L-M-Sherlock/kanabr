import { Screen } from "@keybr/pages-shared";
import { type MessageDescriptor, useIntl } from "react-intl";

export function StaticNotice({
  feature,
}: {
  readonly feature: string | MessageDescriptor;
}) {
  const { formatMessage } = useIntl();
  const featureLabel =
    typeof feature === "string" ? feature : formatMessage(feature);
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
              "{feature} is available only in server mode. The static app stores practice data locally in this browser and does not connect to account, leaderboard, or multiplayer services.",
          },
          { feature: featureLabel },
        )}
      </p>
    </Screen>
  );
}
