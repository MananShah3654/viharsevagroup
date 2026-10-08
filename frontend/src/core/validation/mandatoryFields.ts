// Shared mandatory-field validation, matching main's exact check order and
// rules across Register, Profile edit, and Admin Add/Edit User. Returns the
// first failing message, or null if the form passes.
import type { T } from "@/src/core/i18n";

type Translator = (key: keyof typeof T) => string;

export interface UserFieldsForm {
  phone: string;
  name: string;
  area?: string;
  blood_group: string;
  emergency_contact: string;
  date_of_birth: string;
  password?: string;
  confirm_password?: string;
}

export interface ValidateOptions {
  requireArea?: boolean;
  requirePassword?: boolean;
  requireConfirm?: boolean;
}

export function validateMandatoryUserFields(
  form: UserFieldsForm,
  opts: ValidateOptions,
  t: Translator,
): string | null {
  if (form.phone.replace(/[^0-9]/g, "").length !== 10) return t("phoneRequired");
  if (!form.name.trim()) return t("nameRequired");
  if (opts.requireArea && !form.area?.trim()) return t("areaRequired");
  if (!form.blood_group.trim()) return t("bloodGroupRequired");
  if (form.emergency_contact.replace(/[^0-9]/g, "").length !== 10) return t("emergencyContactRequired");
  if (!form.date_of_birth.trim()) return t("dobRequired");
  if (opts.requirePassword) {
    if (!form.password) return t("passwordRequired");
    if (!/^\d{4}$/.test(form.password)) return t("passwordInvalid");
  }
  if (opts.requireConfirm) {
    if (!form.confirm_password) return t("confirmPasswordRequired");
    if (form.password !== form.confirm_password) return t("passwordMismatch");
  }
  return null;
}
