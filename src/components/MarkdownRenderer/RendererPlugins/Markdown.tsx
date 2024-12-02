import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface MarkdownPluginProps {
  markdownContent: string;
}

const MarkdownPlugin: React.FC<MarkdownPluginProps> = ({ markdownContent }) => {
  return (
    <ReactMarkdown
      children={markdownContent}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        img: () => null, // 忽略 img 标签的渲染
        // 忽略 PDF 自定义标记
        a: ({ href, children }) => {
          if (href?.startsWith("/projects") || href?.startsWith("https")) {
            return null;
          }
          return <a href={href}>{children}</a>;
        },
      }}
    />
  );
};

export default MarkdownPlugin;
