import React, { useState, useRef, useEffect, KeyboardEvent } from "react";

export interface TerminalOutput {
  id: string;
  type: "input" | "output" | "error" | "system";
  content: string;
}

export interface TerminalProps {
  promptSymbol?: string;
  systemBanner?: string;
  onExecute?: (command: string, args: string[]) => Promise<string | void> | string | void;
}

export const Terminal: React.FC<TerminalProps> = ({
  promptSymbol = "sys@node:~$",
  systemBanner = "Terminal Shell v2.4 initialized. Type 'help' for available commands.",
  onExecute,
}) => {
  const [history, setHistory] = useState<TerminalOutput[]>([
    { id: "init", type: "system", content: systemBanner },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmed = inputVal.trim();
      if (!trimmed) return;

      const newEntry: TerminalOutput = {
        id: crypto.randomUUID(),
        type: "input",
        content: `${promptSymbol} ${trimmed}`,
      };

      setCmdHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);
      setInputVal("");

      const [cmd, ...args] = trimmed.split(/\s+/);

      if (cmd.toLowerCase() === "clear") {
        setHistory([]);
        return;
      }

      if (cmd.toLowerCase() === "help") {
        setHistory((prev) => [
          ...prev,
          newEntry,
          {
            id: crypto.randomUUID(),
            type: "system",
            content: "Available commands: help, clear, echo, date, history",
          },
        ]);
        return;
      }

      if (cmd.toLowerCase() === "history") {
        setHistory((prev) => [
          ...prev,
          newEntry,
          {
            id: crypto.randomUUID(),
            type: "output",
            content: cmdHistory.map((h, i) => `${i + 1}  ${h}`).join("\n"),
          },
        ]);
        return;
      }

      if (cmd.toLowerCase() === "echo") {
        setHistory((prev) => [
          ...prev,
          newEntry,
          { id: crypto.randomUUID(), type: "output", content: args.join(" ") },
        ]);
        return;
      }

      if (cmd.toLowerCase() === "date") {
        setHistory((prev) => [
          ...prev,
          newEntry,
          { id: crypto.randomUUID(), type: "output", content: new Date().toISOString() },
        ]);
        return;
      }

      // Delegate to external handler if supplied
      if (onExecute) {
        try {
          const res = await onExecute(cmd, args);
          setHistory((prev) => [
            ...prev,
            newEntry,
            ...(res ? [{ id: crypto.randomUUID(), type: "output" as const, content: res }] : []),
          ]);
        } catch (err: unknown) {
          setHistory((prev) => [
            ...prev,
            newEntry,
            {
              id: crypto.randomUUID(),
              type: "error",
              content: err instanceof Error ? err.message : "Execution failed.",
            },
          ]);
        }
      } else {
        setHistory((prev) => [
          ...prev,
          newEntry,
          {
            id: crypto.randomUUID(),
            type: "error",
            content: `Command not recognized: '${cmd}'. Type 'help' for options.`,
          },
        ]);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryIndex(-1);
        setInputVal("");
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex flex-col h-96 w-full max-w-4xl rounded