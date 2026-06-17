import { paddlePriceId, paddleToken } from "@keybr/thirdparties";
import { Article, Header } from "@keybr/widget";
import { FormattedMessage } from "react-intl";
import { AccountName } from "./AccountName.tsx";
import { AccountPricePreview } from "./AccountPricePreview.tsx";
import { type SignInActions } from "./actions.ts";
import { EmailLoginForm } from "./EmailLoginForm.tsx";
import { OAuthLoginForm } from "./OAuthLoginForm.tsx";

export function SignInSection({ actions }: { actions: SignInActions }) {
  const premiumEnabled = paddleToken !== "0" && paddlePriceId !== "0";
  return (
    <Article>
      <AccountName user={null} />

      <FormattedMessage
        id="account.signInPage.description"
        defaultMessage={
          "<p>Create an account to store your typing data on our servers in the cloud. This allows you to access your profile from any computer or browser. If you don’t have an account then your typing data is stored locally and is accessible only from your current computer.</p>" +
          "<p>We don’t store any passwords. Instead we use third-party services to authenticate our users. We offer several convenient ways to create an account and sign-in.</p>" +
          "<p>Account features are part of server mode. The static kanabr app works without sign-in and stores practice data locally in your browser. You can opt out of server mode at any time by deleting your account.</p>"
        }
      />

      {premiumEnabled && (
        <>
          <Header level={2}>
            <FormattedMessage
              id="t_Premium_account"
              defaultMessage="Premium account"
            />
          </Header>

          <FormattedMessage
            id="account.freeAccount.description"
            defaultMessage={
              "<p>Buy a <strong>premium account</strong> for this server-backed installation to unlock the features configured by the site operator. If ads are enabled on this installation, premium status also removes them.</p>" +
              "<p>It is a single time payment that provides lifetime access on this installation. It is NOT a recurring subscription.</p>"
            }
          />

          <AccountPricePreview />
        </>
      )}

      <Header level={2}>
        <FormattedMessage
          id="t_Signin_with_social_"
          defaultMessage="Sign-in with social networks"
        />
      </Header>

      <OAuthLoginForm />

      <Header level={2}>
        <FormattedMessage
          id="t_Signin_with_email"
          defaultMessage="Sign-in with e-mail"
        />
      </Header>

      <EmailLoginForm actions={actions} />
    </Article>
  );
}
