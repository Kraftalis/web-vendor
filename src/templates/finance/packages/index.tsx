"use client";

import { PackageSection } from "./package-section";
import { AddOnSection } from "./addon-section";

export const PricingTab = () => (
  <div className="space-y-8">
    <PackageSection />
    <AddOnSection />
  </div>
);
