declare module 'chatbot-interface-ifi' {
  import { ForwardRefExoticComponent, RefAttributes, ReactElement } from 'react';

  export interface ChatbotInterfaceProps {
    chatbotId: string;
    onConversationStart?: (conversationId: string) => void;
    enableGuidedQuestions?: boolean;
    customToggleButton?: ReactElement;
    onSwitchToLearn?: () => void;
    isActive?: boolean;
  }

  export interface TeachModeInterfaceProps {
    chatbotId: string;
    onSessionStart?: (sessionId: string) => void;
    sessionIds?: string[];
    initialSessionId?: string;
    onSwitchToChat?: () => void;
    customToggleButton?: ReactElement;
    isActive?: boolean;
    showRestartButton?: boolean;
  }

  export interface ChatbotRef {
    endConversation: () => void;
  }

  export interface TeachModeRef {
    createNewSession: () => void;
  }

  export const ChatbotInterface: ForwardRefExoticComponent<
    ChatbotInterfaceProps & RefAttributes<ChatbotRef>
  >;

  export const TeachModeInterface: ForwardRefExoticComponent<
    TeachModeInterfaceProps & RefAttributes<TeachModeRef>
  >;
}