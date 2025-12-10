import React from "react";
import {
  Stack,
  TextInput,
  Select,
  Grid,
  Switch,
  Group,
  Text,
  Card,
} from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { billingAddressFormSchema } from "@/shared/lib/billing-validation";
import type { BillingAddress } from "@/shared/types/billing";
import classes from "./billing-address-form.module.css";

export interface BillingAddressFormProps {
  value?: BillingAddress;
  onChange: (address: BillingAddress) => void;
  onValidationChange?: (isValid: boolean) => void;
  disabled?: boolean;
  showSameAsShipping?: boolean;
  shippingAddress?: BillingAddress;
  title?: string;
  required?: boolean;
}

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "CH", label: "Switzerland" },
  { value: "AT", label: "Austria" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "SG", label: "Singapore" },
  { value: "HK", label: "Hong Kong" },
  { value: "IN", label: "India" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
];

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const CANADIAN_PROVINCES = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "YT", label: "Yukon" },
];

export const BillingAddressForm: React.FC<BillingAddressFormProps> = ({
  value,
  onChange,
  onValidationChange,
  disabled = false,
  showSameAsShipping = false,
  shippingAddress,
  title = "Billing Address",
  required = true,
}) => {
  const form = useForm<BillingAddress & { sameAsShipping?: boolean }>({
    initialValues: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      sameAsShipping: false,
      ...value,
    },
    validate: zodResolver(billingAddressFormSchema) as any,
    onValuesChange: (values) => {
      const { sameAsShipping, ...address } = values;
      onChange(address);

      // Validate and notify parent of validation state
      const validation = billingAddressFormSchema.safeParse(values);
      onValidationChange?.(validation.success);
    },
  });

  const handleSameAsShippingChange = (checked: boolean) => {
    form.setFieldValue("sameAsShipping", checked);

    if (checked && shippingAddress) {
      form.setValues({
        ...form.values,
        ...shippingAddress,
        sameAsShipping: true,
      });
    }
  };

  const getStateProvinceOptions = () => {
    switch (form.values.country) {
      case "US":
        return US_STATES;
      case "CA":
        return CANADIAN_PROVINCES;
      default:
        return [];
    }
  };

  const getStateProvinceLabel = () => {
    switch (form.values.country) {
      case "US":
        return "State";
      case "CA":
        return "Province";
      default:
        return "State/Province";
    }
  };

  const getPostalCodeLabel = () => {
    switch (form.values.country) {
      case "US":
        return "ZIP Code";
      case "CA":
        return "Postal Code";
      case "GB":
        return "Postcode";
      default:
        return "Postal Code";
    }
  };

  const getPostalCodePlaceholder = () => {
    switch (form.values.country) {
      case "US":
        return "12345";
      case "CA":
        return "K1A 0A6";
      case "GB":
        return "SW1A 1AA";
      default:
        return "12345";
    }
  };

  const stateProvinceOptions = getStateProvinceOptions();
  const isFieldDisabled = disabled || form.values.sameAsShipping;

  return (
    <Card withBorder padding="md" className={classes.addressForm}>
      <Stack gap="md">
        <Group>
          <IconMapPin size={20} />
          <Text fw={500}>{title}</Text>
        </Group>

        {showSameAsShipping && shippingAddress && (
          <Switch
            label="Same as shipping address"
            description="Use the same address for billing"
            checked={form.values.sameAsShipping || false}
            onChange={(event) =>
              handleSameAsShippingChange(event.currentTarget.checked)
            }
            disabled={disabled}
          />
        )}

        <TextInput
          label="Address Line 1"
          placeholder="123 Main Street"
          value={form.values.line1}
          onChange={(event) => form.setFieldValue("line1", event.target.value)}
          error={form.errors.line1}
          disabled={isFieldDisabled}
          required={required}
        />

        <TextInput
          label="Address Line 2 (Optional)"
          placeholder="Apartment, suite, etc."
          value={form.values.line2}
          onChange={(event) => form.setFieldValue("line2", event.target.value)}
          error={form.errors.line2}
          disabled={isFieldDisabled}
        />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="City"
              placeholder="New York"
              value={form.values.city}
              onChange={(event) =>
                form.setFieldValue("city", event.target.value)
              }
              error={form.errors.city}
              disabled={isFieldDisabled}
              required={required}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            {stateProvinceOptions.length > 0 ? (
              <Select
                label={getStateProvinceLabel()}
                placeholder={`Select ${getStateProvinceLabel().toLowerCase()}`}
                data={stateProvinceOptions}
                value={form.values.state}
                onChange={(value) => form.setFieldValue("state", value || "")}
                error={form.errors.state}
                disabled={isFieldDisabled}
                required={required}
                searchable
              />
            ) : (
              <TextInput
                label={getStateProvinceLabel()}
                placeholder="State/Province"
                value={form.values.state}
                onChange={(event) =>
                  form.setFieldValue("state", event.target.value)
                }
                error={form.errors.state}
                disabled={isFieldDisabled}
                required={required}
              />
            )}
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label={getPostalCodeLabel()}
              placeholder={getPostalCodePlaceholder()}
              value={form.values.postalCode}
              onChange={(event) =>
                form.setFieldValue("postalCode", event.target.value)
              }
              error={form.errors.postalCode}
              disabled={isFieldDisabled}
              required={required}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Country"
              data={COUNTRIES}
              value={form.values.country}
              onChange={(value) => {
                form.setFieldValue("country", value || "US");
                // Reset state when country changes
                form.setFieldValue("state", "");
              }}
              error={form.errors.country}
              disabled={isFieldDisabled}
              required={required}
              searchable
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
};
