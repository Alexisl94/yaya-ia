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
    <div className={cn('prose prose-sm max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings
        h1: ({ node, ...props }) => (
          <h1 className="text-xl font-bold mb-3 mt-4 text-foreground" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-lg font-bold mb-2 mt-3 text-foreground" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-base font-semibold mb-2 mt-3 text-foreground" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-sm font-semibold mb-1 mt-2 text-foreground" {...props} />
        ),

        // Paragraphs
        p: ({ node, ...props }) => (
          <p className="mb-3 leading-relaxed text-foreground" {...props} />
        ),

        // Strong/Bold
        strong: ({ node, ...props }) => (
          <strong className="font-bold text-foreground" {...props} />
        ),

        // Emphasis/Italic
        em: ({ node, ...props }) => (
          <em className="italic text-foreground/90" {...props} />
        ),

        // Links
        a: ({ node, ...props }) => (
          <a
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),

        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-3 space-y-1" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="text-foreground leading-relaxed" {...props} />
        ),

        // Code blocks
        code: ({ node, inline, className, children, ...props }: any) => {
          if (inline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs border border-border"
                {...props}
              >
                {children}
              </code>
            )
          }
          return (
            <code
              className="block px-4 py-3 rounded-lg bg-muted/50 text-foreground font-mono text-xs overflow-x-auto border border-border my-3"
              {...props}
            >
              {children}
            </code>
          )
        },

        // Pre (for code blocks)
        pre: ({ node, ...props }) => (
          <pre className="overflow-x-auto" {...props} />
        ),

        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-primary/30 pl-4 py-2 my-3 italic text-muted-foreground bg-muted/20 rounded-r"
            {...props}
          />
        ),

        // Horizontal rule
        hr: ({ node, ...props }) => (
          <hr className="my-4 border-t border-border" {...props} />
        ),

        // Tables
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-3">
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
          <th className="px-4 py-2 text-left text-xs font-semibold text-foreground" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-4 py-2 text-sm text-foreground" {...props} />
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
