import { type Mailer } from "../mail/index.ts";

export function messageWithLink({
  email,
  link,
}: {
  readonly email: string;
  readonly link: string;
}): Mailer.Message {
  const subject = `Login link for kanabr`;
  const text = `Hello, kanabr user!

Here is the link to sign in to kanabr: ${link}

Please keep this link secret and don't share it with anybody!

We wish you productive kana practice!
`;
  return {
    to: email,
    subject,
    text,
  };
}
