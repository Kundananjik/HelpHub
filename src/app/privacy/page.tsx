import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — HelpHub",
};

const PRIVACY_EMAIL = "Kundananjisimukonda@gmail.com";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 2026">
      <p>
        This Privacy Policy explains how HelpHub (&quot;we&quot;, &quot;us&quot;)
        collects, uses, and protects your information when you use the HelpHub IT
        service desk application.
      </p>

      <LegalSection heading="Information we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account information</strong> — your name, email address, and
            (optionally) job title, phone number, and department.
          </li>
          <li>
            <strong>Ticket content</strong> — the titles, descriptions, comments,
            and attachments you submit to request or provide support.
          </li>
          <li>
            <strong>Authentication data</strong> — a securely hashed password and
            session cookies used to keep you signed in.
          </li>
          <li>
            <strong>Usage records</strong> — audit logs of key actions (e.g.
            ticket creation, status changes) for security and accountability.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <p>
          We use your information solely to operate the service desk: to
          authenticate you, route and resolve your tickets, notify you of
          updates, and administer the system. We do not sell your personal data
          or use it for advertising.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          HelpHub uses only strictly-necessary cookies for authentication and
          security. See our{" "}
          <a
            href="/cookies"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Cookie Policy
          </a>{" "}
          for details.
        </p>
      </LegalSection>

      <LegalSection heading="Data retention & security">
        <p>
          Your data is stored on secured, access-controlled infrastructure and
          transmitted over HTTPS. Passwords are hashed with bcrypt. We retain
          account and ticket data for as long as your account is active or as
          needed to provide the service.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You can view and update your profile at any time, change your password,
          and request access to or deletion of your personal data. To exercise
          these rights, contact us using the details below.
        </p>
      </LegalSection>

      <LegalSection heading="Contact for privacy inquiries">
        <p>
          For any privacy questions or requests, contact:{" "}
          <a
            href={`mailto:${PRIVACY_EMAIL}`}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {PRIVACY_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
