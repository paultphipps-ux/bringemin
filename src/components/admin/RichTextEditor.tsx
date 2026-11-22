import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Bold, Heading2, Heading3, ImageIcon, Italic, Link2, List, ListOrdered, Quote, Redo, Undo } from "lucide-react";
import { MediaPicker } from "./MediaPicker";
import { cn } from "@/lib/utils";

export function RichTextEditor({ value, onChange, label = "Body" }: { value: string; onChange: (html: string) => void; label?: string }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener" } }),
      Image,
    ],
    content: value,
    editorProps: {
      attributes: {
        "aria-label": label,
        class: "prose prose-lg max-w-none min-h-[360px] px-1 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Load new content when a different post is opened.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;
  return (
    <div className="flex flex-col gap-3">
      <Toolbar editor={editor} onImage={() => setPickerOpen(true)} />
      <EditorContent editor={editor} />
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(m) => editor.chain().focus().setImage({ src: m.url, alt: m.alt ?? "" }).run()}
      />
    </div>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const btn = (active: boolean) =>
    cn("inline-flex h-10 min-w-10 items-center justify-center rounded-md px-2 text-sm hover:bg-white", active && "bg-white shadow-sm");
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  return (
    <div role="toolbar" aria-label="Formatting" className="sticky top-0 z-10 flex flex-wrap gap-1 rounded-lg border border-paper-line bg-[#FAFAF8] p-1.5">
      <button type="button" aria-label="Heading 2" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={18} /></button>
      <button type="button" aria-label="Heading 3" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={18} /></button>
      <button type="button" aria-label="Bold" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={18} /></button>
      <button type="button" aria-label="Italic" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={18} /></button>
      <button type="button" aria-label="Bulleted list" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={18} /></button>
      <button type="button" aria-label="Numbered list" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={18} /></button>
      <button type="button" aria-label="Quote" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={18} /></button>
      <button type="button" aria-label="Link" className={btn(editor.isActive("link"))} onClick={setLink}><Link2 size={18} /></button>
      <button type="button" aria-label="Insert image" className={btn(false)} onClick={onImage}><ImageIcon size={18} /></button>
      <span className="mx-1 w-px bg-paper-line" aria-hidden />
      <button type="button" aria-label="Undo" className={btn(false)} onClick={() => editor.chain().focus().undo().run()}><Undo size={18} /></button>
      <button type="button" aria-label="Redo" className={btn(false)} onClick={() => editor.chain().focus().redo().run()}><Redo size={18} /></button>
    </div>
  );
}
