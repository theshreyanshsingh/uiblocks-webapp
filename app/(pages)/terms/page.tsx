"use client";
import React from "react";
import Header from "@/app/_components/Header";

const Page = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#141415] text-white pt-20 p-6 md:p-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold my-8">Terms and Conditions</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-300 mb-4">
            By accessing and using UIBlocks, you agree to be bound by these
            Terms and Conditions. If you do not agree with any part of these
            terms, please do not use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Service Description</h2>
          <p className="text-gray-300 mb-4">
            UIBlocks provides an AI-powered interface design and development
            platform. Our services include, but are not limited to, code
            generation, UI component creation, and design assistance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. User Obligations</h2>
          <ul className="text-gray-300 list-disc pl-6 space-y-2">
            <li>
              You must provide accurate information when using our services
            </li>
            <li>
              You are responsible for maintaining the security of your account
            </li>
            <li>You agree not to misuse or attempt to exploit our services</li>
            <li>You must comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            4. Intellectual Property
          </h2>
          <p className="text-gray-300 mb-4">
            The code and designs generated through our platform are owned by
            you. However, UIBlocks retains all rights to our platform,
            technology, and algorithms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            5. Payment and Refund Policy
          </h2>
          <p className="text-gray-300 mb-4">
            We currently do not offer refunds for our services. All purchases
            are final. Please carefully review our pricing and features before
            making a purchase.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            6. Limitation of Liability
          </h2>
          <p className="text-gray-300 mb-4">
            UIBlocks is provided "as is" without any warranties. We are not
            liable for any damages arising from the use or inability to use our
            services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Changes to Terms</h2>
          <p className="text-gray-300 mb-4">
            We reserve the right to modify these terms at any time. Continued
            use of UIBlocks after changes constitutes acceptance of the new
            terms.
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
