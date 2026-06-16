import type { Section } from "@/lib/site/sections";
import { ImagePlaceholder } from "./ImagePlaceholder";

type ResourcesGrid = Extract<Section, { type: "resourcesGrid" }>;

export function ResourcesGridSection({ section }: { section: ResourcesGrid }) {
  const { label, heading, lead, posts } = section;
  return (
    <section className="resources-grid">
      <div className="wrap">
        <div className="resources-header">
          {label ? <span className="section-label">{label}</span> : null}
          <h2>{heading}</h2>
          {lead ? <p className="resources-lead">{lead}</p> : null}
        </div>
        <div className="resources-posts">
          {posts.map((post, i) => (
            <div className="resource-card" key={i}>
              <ImagePlaceholder label={post.title} className="resource-img" />
              <div className="resource-card-body">
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
