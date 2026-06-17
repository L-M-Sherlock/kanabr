import {
  type AnyUser,
  isPremiumUser,
  type UserDetails,
  UserName,
} from "@keybr/pages-shared";
import { paddlePriceId, paddleToken } from "@keybr/thirdparties";
import { Article, Button, CheckBox, FieldSet, Icon, Para } from "@keybr/widget";
import { mdiCreditCard, mdiDeleteForever, mdiExitToApp } from "@mdi/js";
import { FormattedMessage, useIntl } from "react-intl";
import { AccountName } from "./AccountName.tsx";
import { AccountPricePreview } from "./AccountPricePreview.tsx";
import { type AccountActions } from "./actions.ts";

export function AccountSection({
  user,
  publicUser,
  actions,
}: {
  user: UserDetails;
  publicUser: AnyUser;
  actions: AccountActions;
}) {
  const { formatMessage } = useIntl();
  const premiumEnabled = paddleToken !== "0" && paddlePriceId !== "0";

  return (
    <Article>
      <AccountName user={user} />

      <FormattedMessage
        id="account.accountPage.description"
        defaultMessage="<p>You are using an account to store your typing data on our servers in the cloud. You will be able to access your profile from any computer or browser.</p>"
      />

      <FieldSet
        legend={formatMessage({
          id: "t_Account_details",
          defaultMessage: "Account details",
        })}
      >
        <Para>
          <UserName user={publicUser} />
        </Para>

        <Para>
          <FormattedMessage
            id="account.avatar.description"
            defaultMessage="Your user image and name as they are visible to server-backed features such as public profiles, high scores, and multiplayer."
          />
        </Para>

        <Para>
          <CheckBox
            label={formatMessage({
              id: "t_Anonymize_me",
              defaultMessage: "Anonymize me",
            })}
            checked={user.anonymized}
            onChange={() => {
              actions.patchAccount({ anonymized: !user.anonymized });
            }}
          />
        </Para>

        <Para>
          <FormattedMessage
            id="account.anonymize.description"
            defaultMessage="Anonymization replaces your real user image and name with the one that we give you. You can switch between your real and anonymous name any number of times."
          />
        </Para>

        <Para>
          <Button
            onClick={() => {
              actions.logout();
            }}
            icon={<Icon shape={mdiExitToApp} />}
            label={formatMessage({
              id: "t_Sing_out",
              defaultMessage: "Sign out",
            })}
          />
        </Para>
      </FieldSet>

      {premiumEnabled && (
        <FieldSet
          legend={formatMessage({
            id: "t_Premium_account",
            defaultMessage: "Premium account",
          })}
        >
          {isPremiumUser(publicUser) ? (
            <FormattedMessage
              id="account.premiumAccount.description"
              defaultMessage="<p>Thank you for purchasing a premium account! Premium status is active for server-backed features on this installation.</p>"
            />
          ) : (
            <>
              <FormattedMessage
                id="account.freeAccount.description"
                defaultMessage={
                  "<p>Buy a <strong>premium account</strong> for this server-backed installation to unlock the features configured by the site operator. If ads are enabled on this installation, premium status also removes them.</p>" +
                  "<p>It is a single time payment that provides lifetime access on this installation. It is NOT a recurring subscription.</p>"
                }
              />

              <AccountPricePreview />

              <Para>
                <Button
                  onClick={() => {
                    actions.checkout();
                  }}
                  icon={<Icon shape={mdiCreditCard} />}
                  label={formatMessage({
                    id: "t_Buy_a_premium_",
                    defaultMessage: "Buy a premium account",
                  })}
                />
              </Para>
            </>
          )}
        </FieldSet>
      )}

      <FieldSet
        legend={formatMessage({
          id: "t_Delete_account",
          defaultMessage: "Delete account",
        })}
      >
        <Para>
          <Button
            onClick={() => {
              actions.deleteAccount();
            }}
            icon={<Icon shape={mdiDeleteForever} />}
            label={formatMessage({
              id: "t_Delete_account",
              defaultMessage: "Delete account",
            })}
          />
        </Para>

        <Para>
          <FormattedMessage
            id="account.deleteAccount.description"
            defaultMessage="This will delete all your personally identifiable information, such as your name and e-mail address from our database. This operation cannot be undone! If you only want to clear your typing statistics and start over, you can do this on the profile page."
          />
        </Para>
      </FieldSet>
    </Article>
  );
}
