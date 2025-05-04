import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const LLMOutput: React.FC<{
    text: string;
    status?: 'submitted' | 'streaming' | 'ready' | 'error';
}> = ({ text, status = 'ready' }) => {
    const [isBalanced, setIsBalanced] = useState(true);

    // Check if the markdown code blocks are balanced - this helps prevent rendering broken markdown
    useEffect(() => {
        // Only check for balance if there are code blocks
        if (text.includes('```')) {
            const codeBlockMatches = text.match(/```/g) || [];
            setIsBalanced(codeBlockMatches.length % 2 === 0);
        } else {
            setIsBalanced(true);
        }
    }, [text]);

    const markdownOutput = useMemo(() => {
        return (
            <div className="w-full break-words">
                {isBalanced ? (
                    <ReactMarkdown
                        components={{
                            // Apply styles to different markdown elements
                            pre: ({ ...props }) => (
                                <pre
                                    className="whitespace-pre-wrap overflow-x-auto p-4 bg-gray-100 rounded-md"
                                    {...props}
                                />
                            ),
                            code: ({ ...props }) => (
                                <code
                                    className="text-red-600 font-semibold text-sm"
                                    {...props}
                                />
                            ),
                            ul: ({ ...props }) => (
                                <ul className="list-disc pl-6" {...props} />
                            ),
                            ol: ({ ...props }) => (
                                <ol className="list-decimal pl-6" {...props} />
                            ),
                            blockquote: ({ ...props }) => (
                                <blockquote
                                    className="italic border-l-4 border-gray-200 pl-4"
                                    {...props}
                                />
                            ),
                            h1: ({ ...props }) => (
                                <h1 className="mb-2" {...props} />
                            ),
                            h2: ({ ...props }) => (
                                <h2 className="mb-2" {...props} />
                            ),
                            h3: ({ ...props }) => (
                                <h3 className="mb-2" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                                <p className="mb-0" {...props} />
                            ),
                        }}
                    >
                        {text}
                    </ReactMarkdown>
                ) : (
                    // Display a plain text version when markdown is incomplete (unbalanced code blocks)
                    <pre className="whitespace-pre-wrap">{text}</pre>
                )}
            </div>
        );
    }, [text, isBalanced, status]);

    return markdownOutput;
};

export default LLMOutput;
