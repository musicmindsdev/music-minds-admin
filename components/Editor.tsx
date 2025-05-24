
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline'; 
import Link from '@tiptap/extension-link';       

import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon} from 'lucide-react';
import { useState } from 'react'; 

interface EditorProps {
    onChange: (value: string) => void;
    value: string;
}

export const Editor = ({ onChange, value }: EditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false, 
                autolink: true,     
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none p-2 min-h-[150px]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // State for the heading/paragraph dropdown
    const [, setHeadingType] = useState('paragraph');

    // Function to handle the dropdown change
    const handleHeadingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const type = event.target.value;
        setHeadingType(type);
        if (type === 'paragraph') {
            editor?.chain().focus().setParagraph().run();
        } else if (type === 'heading1') {
            editor?.chain().focus().toggleHeading({ level: 1 }).run();
        } else if (type === 'heading2') {
            editor?.chain().focus().toggleHeading({ level: 2 }).run();
        }
     
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col border rounded-lg bg-card overflow-hidden">
            {/* Toolbar for Tiptap */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-card">

                {/* Dropdown for Paragraph/Headings */}
                <select
                    value={
                        editor.isActive('heading', { level: 1 }) ? 'heading1' :
                        editor.isActive('heading', { level: 2 }) ? 'heading2' :
                        'paragraph' // Default to paragraph if no heading is active
                    }
                    onChange={handleHeadingChange}
                    className="p-1 rounded-md border text-sm"
                >
                    <option value="paragraph">Paragraph</option>
                    <option value="heading1">Heading 1</option>
                    <option value="heading2">Heading 2</option>
                  
                </select>

                {/* Bold Button */}
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1 rounded-md ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                    aria-label="Bold"
                >
                    <Bold className="h-4 w-4" />
                </button>

                {/* Italic Button */}
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1 rounded-md ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
                    aria-label="Italic"
                >
                    <Italic className="h-4 w-4" />
                </button>

                {/* Underline Button */}
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1 rounded-md ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
                    aria-label="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" /> 
                </button>

                {/* Link Button */}
                <button
                    onClick={() => {
                        const url = window.prompt('URL:');
                        if (url) {
                            editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
                        }
                    }}
                    className={`p-1 rounded-md ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
                    aria-label="Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </button>

               
            </div>

            {/* The actual editor content area */}
            <EditorContent editor={editor} className="min-h-[150px]" />
        </div>
    );
};