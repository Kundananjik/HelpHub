import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions — HelpHub",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="July 2026">
      <p>
        These Terms &amp; Conditions govern your use of the HelpHub IT service
        desk application. By creating an account or using HelpHub, you agree to
        these terms.
      </p>

      <LegalSection heading="Use of the service">
        <p>
          HelpHub is provided to submit, manage, and resolve IT support tickets.
          You agree to use it only for its intended purpose and in compliance
          with your organization&apos;s policies and applicable laws.
        </p>
      </LegalSection>

      <LegalSection heading="Accounts">
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity under your account. Notify an
          administrator immediately of any unauthorized use.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable content">
        <p>
          You must not upload unlawful, harmful, or infringing content, or
          attempt to disrupt, reverse-engineer, or gain unauthorized access to
          the service or other users&apos; data.
        </p>
      </LegalSection>

      <LegalSection heading="Availability">
        <p>
          The service is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis. We aim for high availability but do not
          guarantee uninterrupted access.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the maximum extent permitted by law, HelpHub and its operators are
          not liable for indirect or consequential damages arising from your use
          of the service.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <p>
          We may update these terms from time to time. Continued use of HelpHub
          after changes take effect constitutes acceptance of the revised terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
