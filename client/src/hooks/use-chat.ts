import { useState } from 'react';

interface ChatState {
  isOpen: boolean;
  initialIntent?: 'file_claim' | 'check_status' | 'appeal' | 'general_help';
  prefilledMessage?: string;
}

export function useChat() {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
  });

  const openChat = (
    intent?: 'file_claim' | 'check_status' | 'appeal' | 'general_help',
    message?: string
  ) => {
    setChatState({
      isOpen: true,
      initialIntent: intent,
      prefilledMessage: message,
    });
  };

  const closeChat = () => {
    setChatState({ isOpen: false });
  };

  // Specific helper functions for common actions
  const startClaim = () => {
    openChat('file_claim', 'I want to start a new VA disability claim. Can you help guide me through the process?');
  };

  const checkStatus = () => {
    openChat('check_status', 'I need to check the status of my VA claim. How can I do that?');
  };

  const getEvaluation = () => {
    openChat('file_claim', 'I would like a free case evaluation for my potential VA disability claim.');
  };

  const appealHelp = () => {
    openChat('appeal', 'My VA claim was denied and I need help with the appeals process.');
  };

  const generalHelp = () => {
    openChat('general_help', 'I have questions about VA benefits and need assistance.');
  };

  return {
    ...chatState,
    openChat,
    closeChat,
    startClaim,
    checkStatus,
    getEvaluation,
    appealHelp,
    generalHelp,
  };
}