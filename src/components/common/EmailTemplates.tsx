// src/components/common/EmailTemplates.tsx
import React from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';

// Base email template interface
export interface EmailTemplateProps {
  recipientName: string;
  recipientEmail: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
}

// Email template data interfaces
export interface InstructorRequestSubmissionData {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  courseNumber: string;
  courseTitle: string;
  requestType: 'primary' | 'co-instructor';
  courseCreationMode?: 'manual' | 'syllabus';
  generatedMaterialsCount?: number;
  requestId: string;
  submittedAt: string;
}

export interface InstructorRequestApprovalData {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  courseNumber: string;
  courseTitle: string;
  requestType: 'primary' | 'co-instructor';
  passcode?: string;
  courseId?: string;
  materialsCreatedCount?: number;
  requestId: string;
  approvedAt: string;
}

// Base email template component
const BaseEmailTemplate = ({ 
  children, 
  title, 
  appName = 'NexLAB', 
  appUrl = 'https://nexlab.bio',
  supportEmail = 'andriy@intofuture.org'
}: {
  children: string;
  title: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: ${typography.fontFamily.primary};
          background-color: ${colors.background.secondary};
          color: ${colors.text.primary};
          line-height: ${typography.lineHeight.normal};
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: ${colors.background.primary};
          border-radius: ${borderRadius.lg};
          box-shadow: ${shadows.lg};
          overflow: hidden;
        }
        .email-header {
          background: linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%);
          padding: ${spacing[8]} ${spacing[6]};
          text-align: center;
          color: ${colors.text.inverse};
        }
        .email-header h1 {
          margin: 0;
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          font-family: ${typography.fontFamily.display};
        }
        .email-header p {
          margin: ${spacing[2]} 0 0 0;
          font-size: ${typography.fontSize.base};
          opacity: 0.9;
        }
        .email-content {
          padding: ${spacing[8]} ${spacing[6]};
        }
        .email-content h2 {
          color: ${colors.text.primary};
          font-size: ${typography.fontSize.xl};
          font-weight: ${typography.fontWeight.semibold};
          margin: 0 0 ${spacing[4]} 0;
          font-family: ${typography.fontFamily.secondary};
        }
        .email-content p {
          color: ${colors.text.secondary};
          font-size: ${typography.fontSize.base};
          margin: 0 0 ${spacing[4]} 0;
          line-height: ${typography.lineHeight.relaxed};
        }
        .info-card {
          background: linear-gradient(135deg, ${colors.background.secondary} 0%, ${colors.background.tertiary} 100%);
          border: 1px solid ${colors.neutral[200]};
          border-radius: ${borderRadius.xl};
          padding: ${spacing[8]};
          margin: ${spacing[6]} 0;
          box-shadow: ${shadows.sm};
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }
        .info-row {
          display: table-row;
        }
        .info-label {
          font-weight: ${typography.fontWeight.semibold};
          color: ${colors.text.primary};
          font-size: ${typography.fontSize.sm};
          padding: ${spacing[3]} ${spacing[4]};
          background-color: ${colors.primary[50]};
          border: 1px solid ${colors.neutral[200]};
          border-right: none;
          width: 35%;
          vertical-align: top;
        }
        .info-value {
          color: ${colors.text.secondary};
          font-size: ${typography.fontSize.sm};
          padding: ${spacing[3]} ${spacing[4]};
          background-color: ${colors.background.primary};
          border: 1px solid ${colors.neutral[200]};
          border-left: none;
          width: 65%;
          vertical-align: top;
        }
        .info-row:first-child .info-label,
        .info-row:first-child .info-value {
          border-top-left-radius: ${borderRadius.lg};
          border-top-right-radius: ${borderRadius.lg};
        }
        .info-row:last-child .info-label,
        .info-row:last-child .info-value {
          border-bottom-left-radius: ${borderRadius.lg};
          border-bottom-right-radius: ${borderRadius.lg};
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%);
          color: ${colors.text.inverse};
          text-decoration: none;
          padding: ${spacing[4]} ${spacing[8]};
          border-radius: ${borderRadius.xl};
          font-weight: ${typography.fontWeight.semibold};
          font-size: ${typography.fontSize.base};
          text-align: center;
          margin: ${spacing[6]} 0;
          transition: all 0.3s ease;
          box-shadow: ${shadows.md};
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: ${shadows.lg};
        }
        .status-badge {
          display: inline-block;
          padding: ${spacing[1]} ${spacing[3]};
          border-radius: ${borderRadius.full};
          font-size: ${typography.fontSize.xs};
          font-weight: ${typography.fontWeight.semibold};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-pending {
          background-color: ${colors.warning}20;
          color: ${colors.warning};
          border: 1px solid ${colors.warning}40;
        }
        .status-approved {
          background-color: ${colors.success}20;
          color: ${colors.success};
          border: 1px solid ${colors.success}40;
        }
        .email-footer {
          background-color: ${colors.background.secondary};
          padding: ${spacing[6]};
          text-align: center;
          border-top: 1px solid ${colors.neutral[200]};
        }
        .email-footer p {
          margin: 0;
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.tertiary};
        }
        .email-footer a {
          color: ${colors.primary[500]};
          text-decoration: none;
        }
        .email-footer a:hover {
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          .email-container {
            margin: 0;
            border-radius: 0;
          }
          .email-header, .email-content, .email-footer {
            padding: ${spacing[4]};
          }
          .info-label, .info-value {
            display: block;
            width: 100%;
            border: 1px solid ${colors.neutral[200]};
            border-radius: 0;
          }
          .info-label {
            border-bottom: none;
            background-color: ${colors.primary[100]};
            font-weight: ${typography.fontWeight.bold};
          }
          .info-value {
            border-top: none;
            margin-bottom: ${spacing[2]};
          }
          .info-row:last-child .info-value {
            margin-bottom: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>${appName}</h1>
          <p>Next-Generation Experiments and Learning for Advanced Biotech</p>
        </div>
        <div class="email-content">
          ${children}
        </div>
        <div class="email-footer">
          <p>
            This email was sent from <a href="${appUrl}">${appName}</a><br>
            If you have any questions, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Instructor request submission email template
export const generateInstructorRequestSubmissionEmail = (
  data: InstructorRequestSubmissionData,
  appName = 'NexLAB',
  appUrl = 'https://nexlab.bio'
): string => {
  const requestTypeLabel = data.requestType === 'primary' ? 'Primary Instructor' : 'Co-Instructor';
  const creationMethodLabel = data.courseCreationMode === 'syllabus' ? 'Syllabus Import' : 'Manual Entry';
  
  return BaseEmailTemplate({
    children: `
      <h2>🎓 Instructor Request Submitted Successfully!</h2>
      <p>Dear ${data.firstName} ${data.lastName},</p>
      <p>Thank you for submitting your request to become an instructor on NexLAB platform. We have received your application and it is currently being reviewed by our team.</p>
      
      <div class="info-card">
        <table class="info-table">
          <tr class="info-row">
            <td class="info-label">Request Status</td>
            <td class="info-value"><span class="status-badge status-pending">Pending Review</span></td>
          </tr>
          <tr class="info-row">
            <td class="info-label">Request Type</td>
            <td class="info-value">${requestTypeLabel}</td>
          </tr>
          <tr class="info-row">
            <td class="info-label">Course</td>
            <td class="info-value">${data.courseNumber} - ${data.courseTitle}</td>
          </tr>
          <tr class="info-row">
            <td class="info-label">Institution</td>
            <td class="info-value">${data.institution}</td>
          </tr>
          ${data.requestType === 'primary' ? `
          <tr class="info-row">
            <td class="info-label">Creation Method</td>
            <td class="info-value">${creationMethodLabel}</td>
          </tr>
          ` : ''}
          ${data.generatedMaterialsCount && data.generatedMaterialsCount > 0 ? `
          <tr class="info-row">
            <td class="info-label">Materials Generated</td>
            <td class="info-value">${data.generatedMaterialsCount} materials ready for publication</td>
          </tr>
          ` : ''}
          <tr class="info-row">
            <td class="info-label">Request ID</td>
            <td class="info-value">${data.requestId}</td>
          </tr>
          <tr class="info-row">
            <td class="info-label">Submitted</td>
            <td class="info-value">${new Date(data.submittedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</td>
          </tr>
        </table>
      </div>
      
      <p><strong>What happens next?</strong></p>
      <p>Our team will review your request within 1-2 business days. You will receive an email notification once your request has been processed.</p>
      
      <p>If you have any questions or need to make changes to your request, please don't hesitate to contact our support team.</p>
    `,
    title: 'Instructor Request Submitted - NexLAB',
    appName,
    appUrl
  });
};

// Instructor request approval email template
export const generateInstructorRequestApprovalEmail = (
  data: InstructorRequestApprovalData,
  appName = 'NexLAB',
  appUrl = 'https://nexlab.bio'
): string => {
  const requestTypeLabel = data.requestType === 'primary' ? 'Primary Instructor' : 'Co-Instructor';
  
  return BaseEmailTemplate({
    children: `
      <h2>🎉 Congratulations! Your Request Has Been Approved!</h2>
      <p>Dear ${data.firstName} ${data.lastName},</p>
      <p>Great news! Your request to become an instructor on NexLAB platform has been approved. You now have access to instructor features and can start managing your course.</p>
      
      <div class="info-card">
        <table class="info-table">
          <tr class="info-row">
            <td class="info-label">Request Status</td>
            <td class="info-value"><span class="status-badge status-approved">Approved</span></td>
          </tr>
          <tr class="info-row">
            <td class="info-label">Request Type</td>
            <td class="info-value">${requestTypeLabel}</td>
          </tr>
          <tr class="info-row">
            <td class="info-label">Course</td>
            <td class="info-value">${data.courseNumber} - ${data.courseTitle}</td>
          </tr>
          <tr class="info-row">
            <td class="info-label">Institution</td>
            <td class="info-value">${data.institution}</td>
          </tr>
          ${data.passcode ? `
          <tr class="info-row">
            <td class="info-label">Course Passcode</td>
            <td class="info-value" style="font-family: monospace; font-weight: bold; color: ${colors.primary[600]};">${data.passcode}</td>
          </tr>
          ` : ''}
          ${data.materialsCreatedCount && data.materialsCreatedCount > 0 ? `
          <tr class="info-row">
            <td class="info-label">Materials Created</td>
            <td class="info-value">${data.materialsCreatedCount} materials automatically added to your course</td>
          </tr>
          ` : ''}
          <tr class="info-row">
            <td class="info-label">Request ID</td>
            <td class="info-value">${data.requestId}</td>
          </tr>
          <tr class="info-row">
            <td class="info-label">Approved</td>
            <td class="info-value">${new Date(data.approvedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin: ${spacing[8]} 0;">
        <a href="${appUrl}/supplemental-materials${data.courseId ? `?course=${data.courseId}` : ''}" class="cta-button">View My Course</a>
      </div>
      
      <p><strong>What you can do now:</strong></p>
      <ul style="color: ${colors.text.secondary}; padding-left: ${spacing[6]};">
        <li>Access your course management dashboard</li>
        <li>Create and manage course materials</li>
        <li>Set up student enrollment with your course passcode</li>
        ${data.materialsCreatedCount && data.materialsCreatedCount > 0 ? '<li>Review and customize your auto-generated materials</li>' : ''}
      </ul>
      
      <p>Welcome to the NexLAB instructor community! We're excited to see what you'll create.</p>
    `,
    title: 'Instructor Request Approved - NexLAB',
    appName,
    appUrl
  });
};

// Email service utility functions
export const createEmailDocument = (
  to: string[],
  subject: string,
  html: string
) => ({
  to,
  message: {
    subject,
    html,
  },
});

// Types are already exported above in the interface declarations
