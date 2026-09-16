"use client";

import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Underline,
  Undo2,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import ProductImageUpload from "@/components/admin/ProductImageUpload";

type BlogRichTextEditorProps = {
  name: string;
  defaultValue?: string;
};

export default function BlogRichTextEditor({
  name,
  defaultValue = "",
}: BlogRichTextEditorProps) {
  const editorRef =
    useRef<HTMLDivElement | null>(null);

  const savedRangeRef =
    useRef<Range | null>(null);

  const initializedRef =
    useRef(false);

  const [value, setValue] =
    useState(defaultValue);

  const [showImageUpload, setShowImageUpload] =
    useState(false);

  useEffect(() => {
    if (
      editorRef.current &&
      !initializedRef.current
    ) {
      editorRef.current.innerHTML =
        defaultValue;

      initializedRef.current = true;
    }
  }, [defaultValue]);

  function saveSelection() {
    const selection =
      window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (
      editorRef.current?.contains(
        range.commonAncestorContainer
      )
    ) {
      savedRangeRef.current =
        range.cloneRange();
    }
  }

  function restoreSelection() {
    const editor =
      editorRef.current;

    const range =
      savedRangeRef.current;

    if (!editor || !range) {
      editor?.focus();
      return;
    }

    const selection =
      window.getSelection();

    if (!selection) {
      editor.focus();
      return;
    }

    selection.removeAllRanges();
    selection.addRange(range);
    editor.focus();
  }

  function syncValue() {
    if (!editorRef.current) return;

    setValue(
      editorRef.current.innerHTML
    );
  }

  function exec(
    command: string,
    commandValue?: string
  ) {
    editorRef.current?.focus();

    document.execCommand(
      command,
      false,
      commandValue
    );

    syncValue();
  }

  function formatBlock(
    tag:
      | "p"
      | "h1"
      | "h2"
      | "h3"
      | "blockquote"
  ) {
    exec("formatBlock", tag);
  }

  function createLink() {
    saveSelection();

    const url =
      window.prompt(
        "أدخل رابط الصفحة:"
      );

    if (!url) return;

    restoreSelection();

    exec(
      "createLink",
      url
    );
  }

  function openImageUpload() {
    saveSelection();
    setShowImageUpload(true);
  }

  function closeImageUpload() {
    setShowImageUpload(false);
  }

  function handleImageUpload({
    imageUrl,
  }: {
    imageUrl: string;
    imagePublicId: string;
  }) {
    if (!imageUrl) return;

    restoreSelection();

    const imageHtml = `
      <p style="text-align:center;">
        <img
          src="${imageUrl}"
          alt=""
          style="
            display:block;
            width:100%;
            max-width:900px;
            height:auto;
            margin:24px auto;
            border-radius:16px;
          "
        />
      </p>
      <p><br></p>
    `;

    exec(
      "insertHTML",
      imageHtml
    );

    setShowImageUpload(false);
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-(--olive-200) bg-white">
        {/* ================================================== */}
        {/* TOOLBAR */}
        {/* ================================================== */}

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-1
            border-b
            border-(--olive-200)
            bg-(--olive-50)
            p-2
          "
        >
          <ToolbarButton
            label="فقرة"
            onClick={() =>
              formatBlock("p")
            }
          >
            <Pilcrow
              size={16}
              strokeWidth={1.7}
            />
          </ToolbarButton>

          <ToolbarButton
            label="عنوان 1"
            onClick={() =>
              formatBlock("h1")
            }
          >
            <Heading1
              size={17}
              strokeWidth={1.7}
            />
          </ToolbarButton>

          <ToolbarButton
            label="عنوان 2"
            onClick={() =>
              formatBlock("h2")
            }
          >
            <Heading2
              size={17}
              strokeWidth={1.7}
            />
          </ToolbarButton>

          <ToolbarButton
            label="عنوان 3"
            onClick={() =>
              formatBlock("h3")
            }
          >
            <Heading3
              size={17}
              strokeWidth={1.7}
            />
          </ToolbarButton>

          <span className="mx-1 h-6 w-px bg-(--olive-200)" />

          <ToolbarButton
            label="عريض"
            onClick={() =>
              exec("bold")
            }
          >
            <Bold
              size={16}
              strokeWidth={2}
            />
          </ToolbarButton>

          <ToolbarButton
            label="مائل"
            onClick={() =>
              exec("italic")
            }
          >
            <Italic
              size={16}
              strokeWidth={1.8}
            />
          </ToolbarButton>

          <ToolbarButton
            label="تحته خط"
            onClick={() =>
              exec("underline")
            }
          >
            <Underline
              size={16}
              strokeWidth={1.8}
            />
          </ToolbarButton>

          <span className="mx-1 h-6 w-px bg-(--olive-200)" />

          <ToolbarButton
            label="قائمة نقطية"
            onClick={() =>
              exec(
                "insertUnorderedList"
              )
            }
          >
            <List
              size={17}
              strokeWidth={1.8}
            />
          </ToolbarButton>

          <ToolbarButton
            label="قائمة رقمية"
            onClick={() =>
              exec(
                "insertOrderedList"
              )
            }
          >
            <ListOrdered
              size={17}
              strokeWidth={1.8}
            />
          </ToolbarButton>

          <ToolbarButton
            label="اقتباس"
            onClick={() =>
              formatBlock(
                "blockquote"
              )
            }
          >
            <Quote
              size={16}
              strokeWidth={1.8}
            />
          </ToolbarButton>

          <ToolbarButton
            label="إضافة رابط"
            onClick={createLink}
          >
            <LinkIcon
              size={16}
              strokeWidth={1.8}
            />
          </ToolbarButton>

          <ToolbarButton
            label="إضافة صورة"
            onClick={openImageUpload}
          >
            <ImagePlus
              size={17}
              strokeWidth={1.8}
            />
          </ToolbarButton>

          <span className="mx-1 h-6 w-px bg-(--olive-200)" />

          <ToolbarButton
            label="تراجع"
            onClick={() =>
              exec("undo")
            }
          >
            <Undo2
              size={16}
              strokeWidth={1.8}
            />
          </ToolbarButton>

          <ToolbarButton
            label="إعادة"
            onClick={() =>
              exec("redo")
            }
          >
            <Redo2
              size={16}
              strokeWidth={1.8}
            />
          </ToolbarButton>
        </div>

        {/* ================================================== */}
        {/* EDITOR */}
        {/* ================================================== */}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dir="rtl"
          onInput={syncValue}
          data-placeholder="اكتب محتوى المقال هنا..."
          className="
            min-h-[480px]
            w-full
            px-5
            py-5
            text-sm
            leading-8
            text-(--olive-900)
            outline-none

            empty:before:text-(--olive-300)
            empty:before:content-[attr(data-placeholder)]

            [&_p]:mb-4

            [&_h1]:mb-4
            [&_h1]:mt-7
            [&_h1]:text-3xl
            [&_h1]:font-bold
            [&_h1]:leading-tight

            [&_h2]:mb-3
            [&_h2]:mt-6
            [&_h2]:text-2xl
            [&_h2]:font-bold
            [&_h2]:leading-tight

            [&_h3]:mb-2
            [&_h3]:mt-5
            [&_h3]:text-xl
            [&_h3]:font-bold
            [&_h3]:leading-tight

            [&_ul]:my-4
            [&_ul]:list-disc
            [&_ul]:pr-6

            [&_ol]:my-4
            [&_ol]:list-decimal
            [&_ol]:pr-6

            [&_blockquote]:my-5
            [&_blockquote]:border-r-4
            [&_blockquote]:border-(--brick-400)
            [&_blockquote]:bg-(--brick-50)
            [&_blockquote]:px-5
            [&_blockquote]:py-3
            [&_blockquote]:text-(--olive-700)

            [&_a]:text-(--brick-600)
            [&_a]:underline

            [&_img]:h-auto
            [&_img]:max-w-full
          "
        />

        <input
          type="hidden"
          name={name}
          value={value}
          readOnly
        />
      </div>

      {/* ================================================== */}
      {/* IMAGE UPLOAD MODAL */}
      {/* ================================================== */}

      {showImageUpload && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeImageUpload();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-xl
              rounded-2xl
              border
              border-(--olive-200)
              bg-white
              p-6
              shadow-2xl
            "
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-(--brick-500)
                  "
                >
                  Article Image
                </p>

                <h3
                  className="
                    mt-2
                    text-xl
                    font-bold
                    text-(--olive-900)
                  "
                >
                  إضافة صورة داخل المقال
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-(--olive-500)
                  "
                >
                  ارفع الصورة عبر Cloudinary
                  وسيتم إدراجها مباشرة داخل المقال.
                </p>
              </div>

              <button
                type="button"
                onClick={closeImageUpload}
                className="
                  inline-flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-(--olive-500)
                  transition
                  hover:bg-(--olive-50)
                  hover:text-(--brick-600)
                "
              >
                <X
                  size={18}
                  strokeWidth={1.7}
                />
              </button>
            </div>

            <ProductImageUpload
              imageUrl={null}
              onUpload={
                handleImageUpload
              }
            />
          </div>
        </div>
      )}
    </>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className="
        inline-flex
        h-9
        min-w-9
        items-center
        justify-center
        rounded-lg
        text-(--olive-600)
        transition
        hover:bg-white
        hover:text-(--brick-600)
      "
    >
      {children}
    </button>
  );
}