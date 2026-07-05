import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy — HelpHub",
};

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" updated="July 2026">
      <p>
        This Cookie Policy explains how HelpHub uses cookies. HelpHub uses only
        strictly-necessary cookies required for the application to function
        securely — we do not use advertising or third-party tracking cookies.
      </p>

      <LegalSection heading="Cookies we use">
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Cookie</th>
                <th className="px-4 py-2 text-left font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2 font-mono text-xs">authjs.session-token</td>
                <td className="px-4 py-2">
                  Keeps you securely signed in between requests.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs">authjs.csrf-token</td>
                <td className="px-4 py-2">
                  Protects sign-in and forms against cross-site request forgery.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs">authjs.callback-url</td>
                <td className="px-4 py-2">
                  Remembers where to return you after authentication.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs">theme</td>
                <td className="px-4 py-2">
                  Stores your light/dark mode preference (kept in your browser,
                  not sent to our servers).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection heading="Managing cookies">
        <p>
          Because these cookies are essential to sign in and use HelpHub,
          disabling them in your browser will prevent the application from
          working correctly. We do not require consent for strictly-necessary
          cookies, but this notice is provided for transparency.
        </p>
      </LegalSection>

      <LegalSection heading="Questions">
        <p>
          For questions about our use of cookies, contact{" "}
          <a
            href="mailto:Kundananjisimukonda@gmail.com"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Kundananjisimukonda@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
