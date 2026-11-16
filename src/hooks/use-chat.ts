"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useConversationStore } from "@/store/conversation-store";
import { useWorkspaceStore } from "@/store/workspace-store";

export function useChat() {
  const { 
    messages, 
    isGenerating, 
    sendMessage, 
    activeConversationId, 
    conversations, 
    setActiveConversation 
  } = useConversationStore();
  
  const { activeWorkspaceId } = useWorkspaceStore();
  const [input, setInput] = useState("");
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const searchParams = useSearchParams();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [kbs, setKbs] = useState<any[]>([]);
  const [selectedKbId, setSelectedKbId] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [docDetails, setDocDetails] = useState<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  const docId = searchParams?.get("documentId") || undefined;
  const docTitle = searchParams?.get("documentTitle") || undefined;
  const knowledgeBaseIdParam = searchParams?.get("knowledgeBaseId") || undefined;

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const currentKbId = activeConversationId
    ? activeConversation?.knowledgeBaseId || ""
    : selectedKbId;

  useEffect(() => {
    if (activeWorkspaceId) {
      fetch(`/api/knowledge-bases?workspaceId=${activeWorkspaceId}`)
        .then(res => res.json())
        .then(data => {
          if (data.knowledgeBases) setKbs(data.knowledgeBases);
        })
        .catch(console.error);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetch("/api/user/key")
      .then(res => res.json())
      .then(data => {
        setHasKey(data.hasOpenAIKey || data.hasGeminiKey);
      })
      .catch(() => setHasKey(false));
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
    setIsNearBottom(true);
    setShowJumpToLatest(false);
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom < 120;
    setIsNearBottom(nearBottom);
    setShowJumpToLatest(!nearBottom);
  }, []);

  useEffect(() => {
    if (!isNearBottom) return;
    const frame = requestAnimationFrame(() => {
      scrollToBottom(isGenerating ? "auto" : "smooth");
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, isGenerating, isNearBottom, scrollToBottom]);

  useEffect(() => {
    setIsNearBottom(true);
    setShowJumpToLatest(false);
    const frame = requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [activeConversationId, docId]);

  // When navigating to a specific document, clear the active conversation
  useEffect(() => {
    if (docId) {
      setActiveConversation(null);
      fetch(`/api/documents/${docId}`)
        .then(res => res.json())
        .then(data => {
          if (data.document) setDocDetails(data.document);
        })
        .catch(console.error);
    } else {
      setDocDetails(null);
    }
  }, [docId, setActiveConversation]);

  useEffect(() => {
    if (!knowledgeBaseIdParam) return;
    setSelectedKbId(knowledgeBaseIdParam);
    setActiveConversation(null);
  }, [knowledgeBaseIdParam, setActiveConversation]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating || !activeWorkspaceId) return;
    const userMsg = input;
    setInput("");
    setIsNearBottom(true);
    setShowJumpToLatest(false);
    await sendMessage(userMsg, activeWorkspaceId, currentKbId || undefined, docId);
  };

  const handleTranscript = (text: string) => {
    setInput((prev) => prev ? `${prev} ${text}` : text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleShare = async () => {
    if (!activeConversationId || !activeWorkspaceId) return;
    setIsSharing(true);
    try {
      const res = await fetch("/api/shared-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: activeConversationId,
          resourceType: "CONVERSATION",
          workspaceId: activeWorkspaceId
        })
      });
      if (res.ok) {
        const data = await res.json();
        const url = `${window.location.origin}/shared/${data.token}`;
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied to clipboard!");
      } else {
        throw new Error("Failed to share");
      }
    } catch {
      toast.error("Could not generate share link.");
    } finally {
      setIsSharing(false);
    }
  };

  return {
    messages,
    isGenerating,
    activeConversationId,
    conversations,
    activeWorkspaceId,
    input,
    setInput,
    isChatSidebarOpen,
    setIsChatSidebarOpen,
    hasKey,
    messagesEndRef,
    scrollContainerRef,
    isNearBottom,
    showJumpToLatest,
    scrollToBottom,
    handleScroll,
    kbs,
    selectedKbId,
    setSelectedKbId,
    docDetails,
    isSharing,
    docId,
    docTitle,
    activeConversation,
    currentKbId,
    knowledgeBaseIdParam,
    handleSend,
    handleTranscript,
    handleKeyDown,
    handleShare,
  };
}
