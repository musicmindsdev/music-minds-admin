"use client";

import EmailDomainTab from "../../_components/EmailDomain";


export default function EmailDomainPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="font-light text-lg">Email Domains</h2>
     
      <EmailDomainTab />
    </div>
  );
}