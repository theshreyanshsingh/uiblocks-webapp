"use client";
import React from "react";
import Header from "@/app/_components/Header";

const Page = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#141415] text-white pt-20 p-6 md:p-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold my-8">Privacy Policy</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            1. Information We Collect
          </h2>
          <p className="text-gray-300 mb-4">
            We collect information you provide directly to us when using
            UIBlocks, including your email address, account details, and any
            other information you choose to provide. We also automatically
            collect certain information about your device and how you interact
            with our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            2. How We Use Your Information
          </h2>
          <p className="text-gray-300 mb-4">
            We use the information we collect to provide, maintain, and improve
            our services, communicate with you, and personalize your experience.
            This includes generating UI components, processing your requests,
            and sending you technical notices and updates.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            3. Data Storage and Security
          </h2>
          <p className="text-gray-300 mb-4">
            We implement appropriate technical and organizational measures to
            protect your personal information. Your data is stored securely and
            we regularly review our security practices to ensure the safety of
            your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            4. Cookies and Tracking
          </h2>
          <p className="text-gray-300 mb-4">
            We use cookies and similar tracking technologies to collect
            information about your browsing behavior and preferences. You can
            control cookie settings through your browser, but disabling cookies
            may limit some features of our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Data Sharing</h2>
          <p className="text-gray-300 mb-4">
            We do not sell your personal information. We may share your
            information with third-party service providers who assist us in
            operating our platform, but only as necessary to provide our
            services to you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
          <ul className="text-gray-300 list-disc pl-6 space-y-2">
            <li>Request correction or deletion of your data</li>

            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            7. Changes to Privacy Policy
          </h2>
          <p className="text-gray-300 mb-4">
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new policy on this page and
            updating the date below.
          </p>
        </section>

        <footer className="text-gray-400 text-sm">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </footer>
      </div>
    </>
  );
};

export default Page;
