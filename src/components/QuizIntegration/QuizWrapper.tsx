import React, { useImperativeHandle, forwardRef, useRef, useCallback } from 'react';
import { QuizModal } from 'rag-quiz-modal-ifi';
import { useUser } from '../../hooks/useUser';
import { useQuizStore } from '../../stores/quizStore';
import { 
  saveQuizStartEvent,
  saveAnswerChangeEvent,
  saveQuizSubmissionEvent,
  saveQuizCloseEvent
} from '../../services/quizDataService';
import {
  QuizWrapperProps,
  QuizModalRef,
  QuizStartData,
  QuizAnswerChangeEvent,
  QuizSubmissionResult,
  QuizCloseInfo,
  QuizErrorPhase
} from '../../types/quiz';

const QuizWrapper = forwardRef<QuizModalRef, QuizWrapperProps>(
  ({ chatbotId, difficulty, open, onClose, eventHandlers }, ref) => {
    const { userDetails } = useUser();
    const quizModalRef = useRef<QuizModalRef | null>(null);
    
    const {
      startQuiz,
      updateAnswers,
      submitQuiz,
      closeQuiz,
      setError
    } = useQuizStore();

    // Handle quiz start - simple logging like documentation
    const handleQuizStart = useCallback((data: QuizStartData) => {
      console.log("Quiz started:", data);
      
      // Update UI state
      startQuiz(data);
      
      // Save to Firestore (non-blocking)
      if (userDetails?.uid) {
        saveQuizStartEvent(data, userDetails.uid).catch(error => {
          console.error('Failed to save quiz start event:', error);
        });
      }
      
      // Call external handler if provided
      if (eventHandlers?.onQuizStart) {
        eventHandlers.onQuizStart(data);
      }
    }, [userDetails?.uid, startQuiz, eventHandlers]);

    // Handle answer changes - simple logging like documentation
    const handleAnswerChange = useCallback((event: QuizAnswerChangeEvent) => {
      console.log("Answer changed:", event);
      
      // Update UI state
      updateAnswers(event);
      
      // Save to Firestore (non-blocking)
      if (userDetails?.uid) {
        // Ensure chatbotId is included in the event (external package may not provide it)
        const eventWithChatbotId: QuizAnswerChangeEvent = {
          ...event,
          chatbotId: event.chatbotId || chatbotId
        };
        
        saveAnswerChangeEvent(eventWithChatbotId, userDetails.uid).catch(error => {
          console.warn('Failed to save answer change event:', error);
        });
      }
      
      // Call external handler if provided
      if (eventHandlers?.onAnswerChange) {
        eventHandlers.onAnswerChange(event);
      }
    }, [updateAnswers, eventHandlers, userDetails?.uid, chatbotId]);

    // Handle quiz submission - simple logging like documentation
    const handleQuizSubmit = useCallback((result: QuizSubmissionResult) => {
      console.log("Quiz submitted:", result);
      
      // Update UI state
      submitQuiz(result);
      
      // Save to Firestore (non-blocking)
      if (userDetails?.uid) {
        saveQuizSubmissionEvent(result, userDetails.uid).catch(error => {
          console.error('Failed to save quiz submission event:', error);
        });
      }
      
      // Call external handler if provided
      if (eventHandlers?.onQuizSubmit) {
        eventHandlers.onQuizSubmit(result);
      }
    }, [submitQuiz, eventHandlers, userDetails?.uid]);

      // Handle quiz close - simple logging like documentation
      const handleQuizClose = useCallback((info: QuizCloseInfo) => {
        console.log("Quiz closed:", info);
        
        // Update UI state
        closeQuiz(info);
        
        // Save to Firestore (non-blocking)
        if (userDetails?.uid) {
          saveQuizCloseEvent(info, userDetails.uid).catch(error => {
            console.error('Failed to save quiz close event:', error);
          });
        }
        
        // Call external handler if provided
        if (eventHandlers?.onQuizClose) {
          eventHandlers.onQuizClose(info);
        }
      }, [closeQuiz, eventHandlers, userDetails?.uid]);

    // Handle quiz errors - simple logging like documentation
    const handleQuizError = useCallback((error: Error, phase: QuizErrorPhase) => {
      console.error("Error in", phase, error);
      setError(`Quiz ${phase} failed: ${error.message}`);
      
      if (eventHandlers?.onError) {
        eventHandlers.onError(error, phase);
      }
    }, [setError, eventHandlers]);


    // Expose quiz control methods through ref
    useImperativeHandle(ref, () => ({
      reloadQuiz: () => {
        if (quizModalRef.current) {
          quizModalRef.current.reloadQuiz();
        }
      },
      clearProgress: () => {
        if (quizModalRef.current) {
          quizModalRef.current.clearProgress();
        }
      },
      submit: () => {
        if (quizModalRef.current) {
          quizModalRef.current.submit();
        }
      },
      getAnswers: () => {
        if (quizModalRef.current) {
          return quizModalRef.current.getAnswers();
        }
        return {};
      },
      getSummary: () => {
        if (quizModalRef.current) {
          return quizModalRef.current.getSummary();
        }
        return null;
      },
      close: () => {
        if (quizModalRef.current) {
          quizModalRef.current.close();
        }
        onClose();
      }
    }));

    return (
      <QuizModal
        ref={quizModalRef}
        chatbotId={chatbotId}
        open={open}
        onClose={onClose}
        difficulty={difficulty}
        onQuizStart={handleQuizStart}
        onAnswerChange={handleAnswerChange}
        onQuizSubmit={handleQuizSubmit}
        onQuizClose={handleQuizClose}
        onError={handleQuizError}
      />
    );
  }
);

QuizWrapper.displayName = 'QuizWrapper';

export default QuizWrapper;
