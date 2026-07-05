import type { LicenseConfig } from "../types/config";
import { keystaticLicense } from "../data/keystatic-license";

export const licenseConfig: LicenseConfig = {
	enable: keystaticLicense.enable ?? true,
	name: keystaticLicense.name || "CC BY-NC-SA 4.0",
	url: keystaticLicense.url || "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};
