import React, { Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { PluggableList } from 'unified';

interface ChatMessageContentProps {
    content: string;
    isUser?: boolean;
}

/**
 * ChatMessageContent — Rendu Markdown pour les réponses IA
 * Support: listes, code blocks, titres, gras, italique, liens, tables
 */
export default function ChatMessageContent({ content, isUser = false }: ChatMessageContentProps) {
    // Pour les messages utilisateur, afficher en texte brut avec retours à la ligne
    if (isUser) {
        return (
            <div className="chat-bubble-text user-text">
                {content.split('\n').map((line, i) => (
                    <Fragment key={i}>
                        {line}
                        {i < content.split('\n').length - 1 && <br />}
                    </Fragment>
                ))}
            </div>
        );
    }

    // Pour les réponses assistant, rendre le markdown
    return (
        <div className="chat-bubble-text chat-markdown">
            <ReactMarkdown
                remarkPlugins={[remarkGfm] as PluggableList}
                rehypePlugins={[rehypeHighlight] as PluggableList}
                components={{
                    // Paragraphes
                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                    
                    // Listes
                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1.5">{children}</ol>,
                    li: ({ children }) => <li className="ml-2">{children}</li>,
                    
                    // Code inline
                    code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code className="chat-code-inline" {...props}>
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                    
                    // Code blocks
                    pre: ({ children }) => (
                        <pre className="chat-code-block">
                            {children}
                        </pre>
                    ),
                    
                    // Titres
                    h1: ({ children }) => <h1 className="chat-heading chat-heading-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="chat-heading chat-heading-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="chat-heading chat-heading-3">{children}</h3>,
                    h4: ({ children }) => <h4 className="chat-heading chat-heading-4">{children}</h4>,
                    
                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="chat-blockquote">{children}</blockquote>
                    ),
                    
                    // Liens
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="chat-link">
                            {children}
                        </a>
                    ),
                    
                    // Tables
                    table: ({ children }) => (
                        <div className="chat-table-wrapper">
                            <table className="chat-table">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="chat-table-head">{children}</thead>,
                    th: ({ children }) => <th className="chat-table-header">{children}</th>,
                    td: ({ children }) => <td className="chat-table-cell">{children}</td>,
                    
                    // Horizontal rule
                    hr: () => <hr className="chat-hr" />,
                    
                    // Strong et emphasis
                    strong: ({ children }) => <strong className="font-semibold text-[var(--color-earth-dark)]">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
