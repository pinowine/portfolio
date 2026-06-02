import { Children, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface MarkdownPluginProps {
  markdownContent: string;
}

const getPlainText = (children: ReactNode) => {
  return Children.toArray(children)
    .map((child) =>
      typeof child === "string" || typeof child === "number" ? child : ""
    )
    .join("")
    .trim();
};

const isMediaLink = (children: ReactNode) => {
  return /^(audio|pdf|video|website):/.test(getPlainText(children));
};

const MarkdownPlugin: React.FC<MarkdownPluginProps> = ({ markdownContent }) => {
  return (
    <ReactMarkdown
      children={markdownContent}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        img: () => null,
        a: ({ href, children, title }) => {
          if (isMediaLink(children)) {
            return null;
          }

          const isExternalLink = /^https?:\/\//.test(href || "");

          return (
            <a
              href={href}
              title={title}
              target={isExternalLink ? "_blank" : undefined}
              rel={isExternalLink ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          );
        },
        p: ({ children }) => {
          return <p>{children}</p>;
        },
      }}
    />
  );
};

export default MarkdownPlugin;
