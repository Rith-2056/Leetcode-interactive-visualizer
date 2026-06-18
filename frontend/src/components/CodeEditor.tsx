"use client";

import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import type { editor } from "monaco-editor";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** 1-based line to highlight as "currently executing", or null. */
  activeLine: number | null;
  /** Locks editing while a trace is playing. */
  readOnly: boolean;
}

const THEME = "algovision-dark";

/**
 * Monaco wrapper that owns syntax highlighting and the moving "current line"
 * decoration. The decoration is imperative (Monaco's model) so it updates
 * without re-mounting the editor each step.
 */
export function CodeEditor({ value, onChange, activeLine, readOnly }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  const handleBeforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme(THEME, {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0f0f17",
        "editor.lineHighlightBorder": "#00000000",
        "editorLineNumber.foreground": "#3f3f5a",
        "editorLineNumber.activeForeground": "#a78bfa",
      },
    });
  };

  const handleMount: OnMount = (ed) => {
    editorRef.current = ed;
    decorationsRef.current = ed.createDecorationsCollection();
  };

  // Move the highlight + scroll the active line into view on every step.
  useEffect(() => {
    const ed = editorRef.current;
    const decorations = decorationsRef.current;
    if (!ed || !decorations) return;

    if (activeLine == null) {
      decorations.clear();
      return;
    }
    decorations.set([
      {
        range: { startLineNumber: activeLine, startColumn: 1, endLineNumber: activeLine, endColumn: 1 },
        options: {
          isWholeLine: true,
          className: "av-active-line",
          glyphMarginClassName: "av-active-glyph",
        },
      },
    ]);
    ed.revealLineInCenterIfOutsideViewport(activeLine);
  }, [activeLine]);

  return (
    <Editor
      height="100%"
      language="python"
      theme={THEME}
      value={value}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      onChange={(v) => onChange(v ?? "")}
      options={{
        readOnly,
        fontSize: 14,
        fontFamily: "var(--font-mono)",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        glyphMargin: true,
        padding: { top: 16 },
        renderLineHighlight: "none",
        lineNumbersMinChars: 3,
        scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
      }}
    />
  );
}
