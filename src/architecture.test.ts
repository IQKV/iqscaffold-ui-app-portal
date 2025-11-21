import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "fs";
import { join } from "path";

describe("FSD Architecture", () => {
  const srcDir = join(process.cwd(), "src");

  describe("Layer Structure", () => {
    it("should have all FSD layers", () => {
      const layers = [
        "app",
        "pages",
        "widgets",
        "features",
        "entities",
        "shared",
      ];

      layers.forEach((layer) => {
        const layerPath = join(srcDir, layer);
        expect(
          () => statSync(layerPath),
          `Layer "${layer}" must exist`
        ).not.toThrow();
      });
    });

    it("app layer should have index.ts", () => {
      const appIndex = join(srcDir, "app", "index.ts");
      expect(() => statSync(appIndex)).not.toThrow();
    });

    it("shared layer should have standard segments", () => {
      const segments = ["api", "lib", "ui", "types"];

      segments.forEach((segment) => {
        const segmentPath = join(srcDir, "shared", segment);
        expect(
          () => statSync(segmentPath),
          `Shared segment "${segment}" must exist`
        ).not.toThrow();
      });
    });
  });

  describe("Public API", () => {
    it("features should have index.ts", () => {
      const featuresDir = join(srcDir, "features");
      const features = readdirSync(featuresDir).filter((f) =>
        statSync(join(featuresDir, f)).isDirectory()
      );

      features.forEach((feature) => {
        const indexPath = join(featuresDir, feature, "index.ts");
        expect(
          () => statSync(indexPath),
          `Feature "${feature}" must have index.ts`
        ).not.toThrow();
      });
    });

    it("widgets should have index.ts", () => {
      const widgetsDir = join(srcDir, "widgets");
      const widgets = readdirSync(widgetsDir).filter((f) =>
        statSync(join(widgetsDir, f)).isDirectory()
      );

      widgets.forEach((widget) => {
        const indexPath = join(widgetsDir, widget, "index.ts");
        expect(
          () => statSync(indexPath),
          `Widget "${widget}" must have index.ts`
        ).not.toThrow();
      });
    });

    it("entities should have index.ts", () => {
      const entitiesDir = join(srcDir, "entities");
      const entities = readdirSync(entitiesDir).filter((f) =>
        statSync(join(entitiesDir, f)).isDirectory()
      );

      entities.forEach((entity) => {
        const indexPath = join(entitiesDir, entity, "index.ts");
        expect(
          () => statSync(indexPath),
          `Entity "${entity}" must have index.ts`
        ).not.toThrow();
      });
    });

    it("processes should have index.ts", () => {
      const processesDir = join(srcDir, "processes");
      const processes = readdirSync(processesDir).filter((f) =>
        statSync(join(processesDir, f)).isDirectory()
      );

      processes.forEach((process) => {
        const indexPath = join(processesDir, process, "index.ts");
        expect(
          () => statSync(indexPath),
          `Process "${process}" must have index.ts`
        ).not.toThrow();
      });
    });

    it("shared segments should have index.ts", () => {
      const segments = ["api", "lib", "ui", "types", "locales"];

      segments.forEach((segment) => {
        const indexPath = join(srcDir, "shared", segment, "index.ts");
        expect(
          () => statSync(indexPath),
          `Shared/${segment} must have index.ts`
        ).not.toThrow();
      });
    });
  });

  describe("Segment Organization", () => {
    it("features should have ui segment", () => {
      const featuresDir = join(srcDir, "features");
      const features = readdirSync(featuresDir).filter((f) =>
        statSync(join(featuresDir, f)).isDirectory()
      );

      features.forEach((feature) => {
        const uiPath = join(featuresDir, feature, "ui");
        expect(
          () => statSync(uiPath),
          `Feature "${feature}" must have ui/ segment`
        ).not.toThrow();
      });
    });

    it("features should have model segment", () => {
      const featuresDir = join(srcDir, "features");
      const features = readdirSync(featuresDir).filter((f) =>
        statSync(join(featuresDir, f)).isDirectory()
      );

      features.forEach((feature) => {
        const modelPath = join(featuresDir, feature, "model");
        expect(
          () => statSync(modelPath),
          `Feature "${feature}" must have model/ segment`
        ).not.toThrow();
      });
    });

    it("widgets should have ui segment or component file", () => {
      const widgetsDir = join(srcDir, "widgets");
      const widgets = readdirSync(widgetsDir).filter((f) =>
        statSync(join(widgetsDir, f)).isDirectory()
      );

      widgets.forEach((widget) => {
        const uiPath = join(widgetsDir, widget, "ui");
        const componentFile = join(widgetsDir, widget, `${widget}.tsx`);

        const hasUiFolder = (() => {
          try {
            statSync(uiPath);
            return true;
          } catch {
            return false;
          }
        })();

        const hasComponentFile = (() => {
          try {
            statSync(componentFile);
            return true;
          } catch {
            return false;
          }
        })();

        expect(
          hasUiFolder || hasComponentFile,
          `Widget "${widget}" must have ui/ folder or ${widget}.tsx file`
        ).toBe(true);
      });
    });
  });

  describe("File Naming", () => {
    it("pages should use kebab-case", () => {
      const pagesDir = join(srcDir, "pages");
      const pages = readdirSync(pagesDir).filter((f) => f.endsWith(".tsx"));

      pages.forEach((page) => {
        const isValid =
          /^[a-z0-9-_]+\.tsx$/.test(page) || page.startsWith("__");
        expect(isValid, `Page "${page}" should use kebab-case`).toBe(true);
      });
    });

    it("shared/ui components should use kebab-case folders", () => {
      const uiDir = join(srcDir, "shared", "ui");
      const components = readdirSync(uiDir).filter((f) =>
        statSync(join(uiDir, f)).isDirectory()
      );

      components.forEach((component) => {
        const isValid = /^[a-z][a-z0-9-]*$/.test(component);
        expect(
          isValid,
          `UI component "${component}" should use kebab-case`
        ).toBe(true);
      });
    });
  });
});
