import Link from 'next/link';
import { ReactElement } from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { NextPageWithLayout } from './_app';

const TOS: NextPageWithLayout = () => (
	<div className="flex justify-center">
		<article className="prose-sm prose my-40 p-3 md:prose-base lg:prose-lg">
			<h1 className="uppercase">Terms of Service</h1>
			<h4>Last updated and effective: May 1st, 2022</h4>
			<p>
				Please read these Terms of Service (&quot;Terms&quot;, &quot;Terms of
				Service&quot;) carefully before using the https://www.economicabot.com
				website (the &quot;Service&quot;) operated by Economica (&quot;us&quot;,
				&quot;we&quot;, or &quot;our&quot;).
			</p>
			<p>
				Your access to and use of the Service is conditioned upon your
				acceptance of and compliance with these Terms. These Terms apply to all
				visitors, users and others who wish to access or use the Service.
			</p>
			<p>
				By accessing or using the Service you agree to be bound by these Terms.
				If you disagree with any part of the terms then you do not have
				permission to access the Service.
			</p>
			<h2>Purchases</h2>
			<p>
				If you wish to purchase any product or service made available through
				the Service (&quot;Purchase&quot;), you may be asked to supply certain
				information relevant to your Purchase including, without limitation,
				your credit card number, the expiration date of your credit card, your
				billing address, and your shipping information.
			</p>
			<p>
				You represent and warrant that: (i) you have the legal right to use any
				credit card(s)or other payment method(s) in connection with any
				Purchase; and that (ii) the information you supply to us is true,
				correct and complete.
			</p>
			<p>
				The service may employ the use of third party services for the purpose
				of facilitating payment and the completion of Purchases. By submitting
				your information, you grant us the right to provide the information to
				these third parties subject to our Privacy Policy.
			</p>
			<p>
				We reserve the right to refuse or cancel your order at any time for
				reasons including but not limited to: product or service availability,
				errors in the description or price of the product or service, error in
				your order or other reasons.
			</p>
			<p>
				We reserve the right to refuse or cancel your order if fraud or an
				unauthorized or illegal transaction is suspected.
			</p>
			<h2>Availability, Errors and Inaccuracies</h2>
			<p>
				We are constantly updating product and service offerings on the Service.
				We may experience delays in updating information on the Service and in
				our advertising on other web sites. The information found on the Service
				may contain errors or inaccuracies and may not be complete or current.
				Products or services may be mispriced, described inaccurately, or
				unavailable on the Service and we cannot guarantee the accuracy or
				completeness of any information found on the Service.
			</p>
			<p>
				We therefore reserve the right to change or update information and to
				correct errors, inaccuracies, or omissions at any time without prior
				notice.
			</p>
			<h2>Links To Other Web Sites</h2>
			<p>
				Our Service may contain links to third party web sites or services that
				are not owned or controlled by Economica.
			</p>
			<p>
				Economica has no control over, and assumes no responsibility for the
				content, privacy policies, or practices of any third party web sites or
				services. We do not warrant the offerings of any of these
				entities/individuals or their websites.
			</p>
			<p>
				You acknowledge and agree that Economica shall not be responsible or
				liable, directly or indirectly, for any damage or loss caused or alleged
				to be caused by or in connection with use of or reliance on any such
				content, goods or services available on or through any such third party
				web sites or services.
			</p>
			<p>
				We strongly advise you to read the terms and conditions and privacy
				policies of any third party web sites or services that you visit.
			</p>
			<p>
				We therefore reserve the right to change or update information and to
				correct errors, inaccuracies, or omissions at any time without prior
				notice.
			</p>
			<h2>Termination</h2>
			<p>
				We may terminate or suspend your access to the Service immediately,
				without prior notice or liability, under our sole discretion, for any
				reason whatsoever and without limitation, including but not limited to a
				breach of the Terms.
			</p>
			<p>
				All provisions of the Terms which by their nature should survive
				termination shall survive termination, including, without limitation,
				ownership provisions, warranty disclaimers, indemnity and limitations of
				liability.
			</p>
			<h2>Indemnification</h2>
			<p>
				You agree to defend, indemnify and hold harmless Economica and its
				licensee and licensors, and their employees, contractors, agents,
				officers and directors, from and against any and all claims, damages,
				obligations, losses, liabilities, costs or debt, and expenses (including
				but not limited to attorney&apos;s fees), resulting from or arising out
				of a) your use and access of the Service, or b) a breach of these Terms.
			</p>
			<h2>Disclaimer</h2>
			<p>
				Your use of the Service is at your sole risk. The Service is provided on
				an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The Service is
				provided without warranties of any kind, whether express or implied,
				including, but not limited to, implied warranties of merchantability,
				fitness for a particular purpose, non-infringement or course of
				performance.
			</p>
			<p>
				Economica its subsidiaries, affiliates, and its licensors do not warrant
				that a) the Service will function uninterrupted, secure or available at
				any particular time or location; b) any errors or defects will be
				corrected; c) the Service is free of viruses or other harmful
				components; or d) the results of using the Service will meet your
				requirements.
			</p>
			<h2>Exclusions</h2>
			<p>
				Some jurisdictions do not allow the exclusion of certain warranties or
				the exclusion or limitation of liability for consequential or incidental
				damages, so the limitations above may not apply to you.
			</p>
			<h2>Governing Law</h2>
			<p>
				These Terms shall be governed and construed in accordance with the laws
				of California, United States, without regard to its conflict of law
				provisions.
			</p>
			<p>
				Our failure to enforce any right or provision of these Terms will not be
				considered a waiver of those rights. If any provision of these Terms is
				held to be invalid or unenforceable by a court, the remaining provisions
				of these Terms will remain in effect. These Terms constitute the entire
				agreement between us regarding our Service, and supersede and replace
				any prior agreements we might have had between us regarding the Service.
			</p>
			<h2>Changes</h2>
			<p>
				We reserve the right, at our sole discretion, to modify or replace these
				Terms at any time. If a revision is material we will provide at least 30
				days notice prior to any new terms taking effect. What constitutes a
				material change will be determined at our sole discretion.
			</p>
			<p>
				By continuing to access or use our Service after any revisions become
				effective, you agree to be bound by the revised terms. If you do not
				agree to the new terms, you are no longer authorized to use the Service.
			</p>
			<h2>Contact Us</h2>
			<p>
				If you have any questions about our Privacy Policy, please contact us on
				our <Link href="/api/support">support server</Link>.
			</p>
		</article>
	</div>
);

TOS.getLayout = function getLayout(page: ReactElement) {
	return <MainLayout>{page}</MainLayout>;
};

export default TOS;
