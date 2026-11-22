import { ResourceManager, publishedBadge, type ResourceConfig } from "@/components/admin/ResourceManager";

const AUDIENCE = [
  { value: "bail", label: "Bail bond companies" },
  { value: "attorney", label: "Attorneys" },
  { value: "individual", label: "Individuals & families" },
  { value: "business", label: "Businesses" },
];

const services: ResourceConfig = {
  table: "services", title: "Services", singular: "service", sortable: true, invalidate: ["services", "service"],
  subtitle: "Each service gets its own page at /services/slug.",
  defaults: { published: true },
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "slug", label: "URL slug", type: "slug", from: "name" },
    { key: "summary", label: "Short summary", type: "textarea", hint: "One or two sentences shown on service cards." },
    { key: "body", label: "Full page content", type: "richtext" },
    { key: "audience", label: "Main audience", type: "select", options: AUDIENCE },
    { key: "image_url", label: "Image", type: "image" },
    { key: "seo_title", label: "SEO title", type: "text" },
    { key: "seo_description", label: "Meta description", type: "textarea" },
    { key: "published", label: "Show on the website", type: "boolean" },
  ],
  columns: [
    { key: "name", label: "Name" },
    { key: "slug", label: "URL", render: (r) => <span className="text-sm text-[#6B6B72]">/services/{String(r.slug)}</span> },
    { key: "published", label: "Visibility", render: publishedBadge },
  ],
};

const team: ResourceConfig = {
  table: "team_members", title: "Team", singular: "team member", sortable: true, invalidate: ["team"],
  defaults: { published: true },
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "title", label: "Title", type: "text" },
    { key: "license_number", label: "PI license number", type: "text" },
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "photo_url", label: "Photo", type: "image" },
    { key: "published", label: "Show on the website", type: "boolean" },
  ],
  columns: [{ key: "name", label: "Name" }, { key: "title", label: "Title" }, { key: "published", label: "Visibility", render: publishedBadge }],
};

const testimonials: ResourceConfig = {
  table: "testimonials", title: "Testimonials", singular: "testimonial", sortable: true, invalidate: ["testimonials"],
  subtitle: "Only publish testimonials the client has permission to use. Initials are fine.",
  fields: [
    { key: "quote", label: "Quote", type: "textarea", required: true },
    { key: "author", label: "Name or initials", type: "text", required: true },
    { key: "context", label: "Company or city", type: "text" },
    { key: "audience", label: "Client type", type: "select", options: AUDIENCE },
    { key: "published", label: "Show on the website", type: "boolean" },
  ],
  columns: [
    { key: "quote", label: "Quote", render: (r) => <span className="line-clamp-2">{String(r.quote)}</span> },
    { key: "author", label: "From" },
    { key: "published", label: "Visibility", render: publishedBadge },
  ],
};

const faqs: ResourceConfig = {
  table: "faqs", title: "FAQs", singular: "question", sortable: true, invalidate: ["faqs"],
  subtitle: "Questions appear on the FAQ page, the bail bond page, or a service page.",
  defaults: { published: true, page: "faq" },
  fields: [
    { key: "question", label: "Question", type: "text", required: true },
    { key: "answer", label: "Answer", type: "textarea", required: true },
    { key: "page", label: "Show on", type: "text", required: true, hint: "faq, bail, or a service slug such as child-custody" },
    { key: "published", label: "Show on the website", type: "boolean" },
  ],
  columns: [{ key: "question", label: "Question" }, { key: "page", label: "Page" }, { key: "published", label: "Visibility", render: publishedBadge }],
};

const categories: ResourceConfig = {
  table: "categories", title: "Blog categories", singular: "category", orderBy: "name", invalidate: ["categories"],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "slug", label: "URL slug", type: "slug", from: "name" },
    { key: "description", label: "Description", type: "textarea" },
  ],
  columns: [{ key: "name", label: "Name" }, { key: "slug", label: "URL", render: (r) => <span className="text-sm text-[#6B6B72]">/blog/category/{String(r.slug)}</span> }],
};

export const ServicesAdmin = () => <ResourceManager config={services} />;
export const TeamAdmin = () => <ResourceManager config={team} />;
export const TestimonialsAdmin = () => <ResourceManager config={testimonials} />;
export const FaqsAdmin = () => <ResourceManager config={faqs} />;
export const CategoriesAdmin = () => <ResourceManager config={categories} />;
