// src/components/common/index.ts
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as GlobalNotifications } from './GlobalNotifications';
export { default as MaterialCard } from './MaterialCard';
export { default as ModernTable } from './ModernTable';
export type { TableColumn } from './ModernTable';
export { default as PageHeader } from './PageHeader';
export { default as RouteErrorBoundary } from './RouteErrorBoundary';

// New reusable components
export { default as CopyableUserID } from './CopyableUserID';
export { default as CourseHyperlink } from './CourseHyperlink';
export { default as CourseSelector } from './CourseSelector';
export type { CourseOption } from './CourseSelector';
export { default as MaterialSelector } from './MaterialSelector';
export type { Material } from './MaterialSelector';
export { default as MaterialHyperlink } from './MaterialHyperlink';
export { default as UserStatusChip } from './UserStatusChip';
export { default as CopyableChatbotID } from './CopyableChatbotID';
export { default as CopyableConversationID } from './CopyableConversationID';
export { default as CopyableCourseID } from './CopyableCourseID';
export { default as CopyableMaterialID } from './CopyableMaterialID';

// Table components
export * from './TableComponents';

// Form Components
export { default as FormContainer } from './FormContainer';
export { default as FormSection } from './FormSection';
export { default as FormField, FormSelect } from './FormField';
export { default as FormActions, FormActionButton } from './FormActions';
