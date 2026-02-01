import { useEffect } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";

/**
 * Custom hook to set page title using Helmet and i18n
 * @param title - The page title (already translated using t`` macro)
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    // The title will be automatically formatted using the titleTemplate
    // defined in __root.tsx: "%s | IQ Scaffold Platform"
  }, [title]);

  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
}
