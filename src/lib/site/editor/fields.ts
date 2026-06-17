import type { SiteDocument, Page } from "../schema";
import type { Section } from "../sections";
import { getString, type Path } from "./update";

/**
 * Schema-driven text editing (ADR-0004), built as a **fail-closed allowlist**: only the prose
 * fields enumerated here are editable. Structural fields a section depends on — `type`, `href`,
 * `src`, `slug`, `variant`, `imagePosition`, `icon` — are never listed, so the editor cannot
 * produce a document that breaks the discriminated-union schema or the renderer.
 *
 * Scope is text + theme only. Adding/removing/reordering array items, sections, and images are
 * deferred (ADR-0004 c/d); array entries are edited in place at their existing length.
 */

/** One editable text input bound to a path in the document. */
export type EditableField = {
  id: string;
  path: Path;
  label: string;
  value: string;
  /** Render as a multi-line textarea (prose) rather than a single-line input. */
  multiline: boolean;
};

/** A titled set of fields shown together in the panel (the chrome, or one section). */
export type FieldGroup = {
  id: string;
  title: string;
  fields: EditableField[];
};

/* ── Field specs ──────────────────────────────────────────────────────────────── */

type ScalarSpec = { key: string; label: string; multiline?: boolean };
type StringArraySpec = {
  key: string;
  kind: "stringArray";
  itemLabel: string;
  multiline?: boolean;
};
type ObjectArraySpec = {
  key: string;
  kind: "objectArray";
  itemLabel: string;
  sub: ScalarSpec[];
};
type FieldSpec = ScalarSpec | StringArraySpec | ObjectArraySpec;

/**
 * Editable prose fields per section type. Anything not listed (images, links, the `type`
 * discriminant, layout enums) is intentionally absent and therefore not editable.
 */
const SECTION_FIELDS: Record<Section["type"], FieldSpec[]> = {
  hero: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "heading", label: "Heading" },
    { key: "body", label: "Body", multiline: true },
  ],
  logoStrip: [{ key: "label", label: "Label" }],
  intro: [
    { key: "label", label: "Label" },
    { key: "heading", label: "Heading" },
    { key: "paragraphs", kind: "stringArray", itemLabel: "Paragraph", multiline: true },
  ],
  infoCards: [
    { key: "label", label: "Label" },
    { key: "heading", label: "Heading" },
    {
      key: "cards",
      kind: "objectArray",
      itemLabel: "Card",
      sub: [
        { key: "title", label: "Title" },
        { key: "body", label: "Body", multiline: true },
      ],
    },
  ],
  about: [
    { key: "label", label: "Label" },
    { key: "heading", label: "Heading" },
    { key: "paragraphs", kind: "stringArray", itemLabel: "Paragraph", multiline: true },
  ],
  richText: [
    { key: "label", label: "Label" },
    { key: "heading", label: "Heading" },
    { key: "paragraphs", kind: "stringArray", itemLabel: "Paragraph", multiline: true },
    { key: "list", kind: "stringArray", itemLabel: "List item" },
  ],
  split: [
    { key: "label", label: "Label" },
    { key: "heading", label: "Heading" },
    { key: "paragraphs", kind: "stringArray", itemLabel: "Paragraph", multiline: true },
  ],
  services: [
    { key: "label", label: "Label" },
    { key: "heading", label: "Heading" },
    { key: "body", label: "Body", multiline: true },
    {
      key: "items",
      kind: "objectArray",
      itemLabel: "Service",
      sub: [
        { key: "title", label: "Title" },
        { key: "copy", label: "Copy", multiline: true },
      ],
    },
  ],
  accordion: [
    { key: "label", label: "Label" },
    { key: "heading", label: "Heading" },
    {
      key: "items",
      kind: "objectArray",
      itemLabel: "Item",
      sub: [
        { key: "title", label: "Question" },
        { key: "body", label: "Answer", multiline: true },
      ],
    },
  ],
  testimonial: [
    { key: "quote", label: "Quote", multiline: true },
    { key: "attribution", label: "Attribution" },
  ],
  resourcesGrid: [
    { key: "heading", label: "Heading" },
    { key: "lead", label: "Lead", multiline: true },
    {
      key: "posts",
      kind: "objectArray",
      itemLabel: "Post",
      sub: [
        { key: "title", label: "Title" },
        { key: "excerpt", label: "Excerpt", multiline: true },
      ],
    },
  ],
  contact: [
    { key: "label", label: "Label" },
    { key: "heading", label: "Heading" },
    { key: "intro", label: "Intro", multiline: true },
    { key: "methods", kind: "stringArray", itemLabel: "Method" },
  ],
  cta: [
    { key: "label", label: "Label" },
    { key: "heading", label: "Heading" },
    { key: "body", label: "Body", multiline: true },
    { key: "note", label: "Note" },
  ],
};

/** Visible site chrome (header/footer + contact details), always shown. */
const CHROME_FIELDS: { path: Path; label: string; multiline?: boolean }[] = [
  { path: ["meta", "siteName"], label: "Site name" },
  { path: ["footer", "tagline"], label: "Tagline" },
  { path: ["footer", "location"], label: "Location" },
  { path: ["contact", "email"], label: "Email" },
  { path: ["contact", "phone"], label: "Phone" },
];

/* ── Derivation ───────────────────────────────────────────────────────────────── */

/**
 * Walk the document and produce the editable groups: a "Site details" group plus one group
 * per section that has any editable prose. Values are read live from `document`, so inputs
 * are controlled. Pure — building this performs no mutation.
 */
export function editableFields(document: SiteDocument): FieldGroup[] {
  const groups: FieldGroup[] = [
    {
      id: "site",
      title: "Site details",
      fields: CHROME_FIELDS.map((spec) => ({
        id: spec.path.join("."),
        path: spec.path,
        label: spec.label,
        value: getString(document, spec.path),
        multiline: spec.multiline ?? false,
      })),
    },
  ];

  document.pages.forEach((page, pageIndex) => {
    page.sections.forEach((section, sectionIndex) => {
      const basePath: Path = ["pages", pageIndex, "sections", sectionIndex];
      const fields = (SECTION_FIELDS[section.type] ?? []).flatMap((spec) =>
        fieldsForSpec(section as Record<string, unknown>, basePath, spec),
      );
      if (fields.length === 0) return;
      groups.push({
        id: basePath.join("."),
        title: `${pageName(page.slug)} · ${sectionTitle(section)}`,
        fields,
      });
    });
  });

  return groups;
}

function fieldsForSpec(
  section: Record<string, unknown>,
  basePath: Path,
  spec: FieldSpec,
): EditableField[] {
  if (!("kind" in spec)) {
    // Scalar: only editable if the key is actually present on this section (assemble omits
    // optional fields it leaves empty), keeping the panel to fields that really exist.
    if (typeof section[spec.key] !== "string") return [];
    const path: Path = [...basePath, spec.key];
    return [field(path, spec.label, section[spec.key] as string, spec.multiline)];
  }

  if (spec.kind === "stringArray") {
    const arr = section[spec.key];
    if (!Array.isArray(arr)) return [];
    return arr.map((value, i) =>
      field(
        [...basePath, spec.key, i],
        `${spec.itemLabel} ${i + 1}`,
        typeof value === "string" ? value : "",
        spec.multiline,
      ),
    );
  }

  // objectArray
  const arr = section[spec.key];
  if (!Array.isArray(arr)) return [];
  return arr.flatMap((item, i) => {
    const obj = (item ?? {}) as Record<string, unknown>;
    return spec.sub
      .filter((sub) => typeof obj[sub.key] === "string")
      .map((sub) =>
        field(
          [...basePath, spec.key, i, sub.key],
          `${spec.itemLabel} ${i + 1} — ${sub.label}`,
          obj[sub.key] as string,
          sub.multiline,
        ),
      );
  });
}

function field(path: Path, label: string, value: string, multiline = false): EditableField {
  return { id: path.join("."), path, label, value, multiline };
}

const PAGE_NAMES: Record<string, string> = {
  home: "Home",
  about: "About",
  therapy: "Therapy",
  faq: "FAQ",
  contact: "Contact",
};

function pageName(slug: string): string {
  return PAGE_NAMES[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

/** A human label for a section group: its own heading/label, else a humanized type. */
function sectionTitle(section: Section): string {
  const labelled = section as { label?: string; heading?: string };
  const candidate = labelled.label?.trim() || labelled.heading?.trim();
  if (candidate) return truncate(candidate, 40);
  return TYPE_NAMES[section.type] ?? section.type;
}

const TYPE_NAMES: Record<Section["type"], string> = {
  hero: "Hero",
  logoStrip: "Logos",
  intro: "Intro",
  infoCards: "Info cards",
  about: "About",
  richText: "Text",
  split: "Split",
  services: "Services",
  accordion: "Questions",
  testimonial: "Testimonial",
  resourcesGrid: "Resources",
  contact: "Contact",
  cta: "Call to action",
};

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}
