// Form entity types
export type FormValidationRule<T = any> = (value: T, values?: any) => string | null;

export interface FormValidationRules<T = any> {
  [key: string]: FormValidationRule<T>;
}
