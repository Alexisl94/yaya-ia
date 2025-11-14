/**
 * Markdown Content Component
 * Renders markdown with beautiful styling for AI responses
 */

'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn('max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings
        h1: ({ node, ...props }) => (
          <h1 className="text-[14px] leading-[20px] font-semibold mb-1 mt-1.5 text-foreground" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-[14px] leading-[20px] font-semibold mb-1 mt-1.5 text-foreground" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-[14px] leading-[20px] font-semibold mb-1 mt-1.5 text-foreground" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-[14px] leading-[20px] font-semibold mb-1 mt-1.5 text-foreground" {...props} />
        ),

        // Paragraphs
        p: ({ node, ...props }) => (
          <p className="text-[13px] leading-[20px] mb-0.5 text-foreground" {...props} />
        ),

        // Strong/Bold
        strong: ({ node, ...props }) => (
          <strong className="text-[13px] leading-[20px] font-semibold text-foreground" {...props} />
        ),

        // Emphasis/Italic
        em: ({ node, ...props }) => (
          <em className="text-[13px] leading-[20px] italic text-foreground/90" {...props} />
        ),

        // Links
        a: ({ node, ...props }) => (
          <a
            className="text-[13px] leading-[20px] text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),

        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-0.5 space-y-0" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-0.5 space-y-0" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="text-[13px] leading-[20px] text-foreground" {...props} />
        ),

        // Code blocks
        code: ({ node, inline, className, children, ...props }: any) => {
          if (inline) {
            return (
              <code
                className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[12px] leading-[20px] border border-border"
                {...props}
              >
                {children}
              </code>
            )
          }
          return (
            <code
              className="block px-3 py-2 rounded-lg bg-muted/50 text-foreground font-mono text-[12px] leading-[20px] overflow-x-auto border border-border my-1"
              {...props}
            >
              {children}
            </code>
          )
        },

        // Pre (for code blocks)
        pre: ({ node, ...props }) => (
          <pre className="overflow-x-auto text-[12px] leading-[20px]" {...props} />
        ),

        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="text-[13px] leading-[20px] border-l-4 border-primary/30 pl-3 py-1 my-1 italic text-muted-foreground bg-muted/20 rounded-r"
            {...props}
          />
        ),

        // Horizontal rule
        hr: ({ node, ...props }) => (
          <hr className="my-2 border-t border-border" {...props} />
        ),

        // Tables
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-1">
            <table className="min-w-full divide-y divide-border border border-border rounded-lg" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-muted" {...props} />
        ),
        tbody: ({ node, ...props }) => (
          <tbody className="divide-y divide-border bg-background" {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="hover:bg-muted/30 transition-colors" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-3 py-1.5 text-left text-[12px] leading-[20px] font-semibold text-foreground" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-3 py-1.5 text-[13px] leading-[20px] text-foreground" {...props} />
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
