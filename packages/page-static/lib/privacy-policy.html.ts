export default `
<h1>Privacy Policy</h1>
<p>kanabr is a Japanese kana typing practice app. The default static app works without an account or server database.</p>
<h2>Static Local Data</h2>
<p>In static mode, your practice history, settings, preferences, and theme are stored locally in your browser using browser storage such as IndexedDB and localStorage. This data stays on the device and browser profile where you use the app unless you export it, import it, reset it, or clear browser site data.</p>
<p>Static mode does not create accounts, public profiles, high scores, multiplayer sessions, or cloud sync.</p>
<h2>Analytics</h2>
<p>The browser app includes Vercel Analytics. Vercel may collect limited usage and performance information such as page views, device/browser metadata, and request metadata according to Vercel's analytics service behavior.</p>
<h2>Optional Server Mode</h2>
<p>If you run or use a server-backed kanabr installation, the server may store:</p>
<ul>
<li>account identifiers such as email address and OAuth profile data,</li>
<li>public profile name and image,</li>
<li>typing results, settings, and synchronization data,</li>
<li>high score and multiplayer data,</li>
<li>operational logs needed to run and protect the service.</li>
</ul>
<p>Server mode does not require passwords for kanabr itself when email/OAuth login is used. Login links should be kept private.</p>
<h2>Optional Third-Party Services</h2>
<p>A server operator may enable additional third-party services through configuration:</p>
<ul>
<li>OAuth providers for sign-in,</li>
<li>email delivery for login links,</li>
<li>Vercel Analytics for usage analytics,</li>
<li>Cookiebot and an ad provider when ads are enabled,</li>
<li>Paddle when paid features are enabled.</li>
</ul>
<p>If these services are not configured, kanabr does not use them for the corresponding feature.</p>
<h2>Exporting and Deleting Data</h2>
<p>In static mode, use the Profile page to export or reset local data. Clearing browser site data also removes local kanabr data.</p>
<p>In server mode, signed-in users can delete their account from the Account page. Deleting an account removes personally identifying account data from that server installation. If you only want to reset practice statistics, use the Profile page.</p>
<h2>Changes</h2>
<p>This policy may be updated as kanabr changes. Changes are effective when posted on this page.</p>
`;
