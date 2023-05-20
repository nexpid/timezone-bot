import { Env, Redirect } from "..";
import { getOAuthUrl } from "../oauth2";
import { sign } from "../util/cookiesigner";

export default async (env: Env) => {
  const { url, state } = getOAuthUrl(env);

  return new Redirect(url, {
    headers: {
      "Set-Cookie": `state=${await sign(
        state,
        env.cookie_secret
      )}; Max-Age=300`,
    },
  });
};
