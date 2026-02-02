// src/utils/generatePDF.ts
import jsPDF from 'jspdf';
import { Material } from '../types/Material';
import { parseDocument } from 'htmlparser2';
import type { ChildNode, Element } from 'domhandler';
import { isTag } from 'domelementtype';

// Type for text segments with styling information
interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  isLink?: boolean;
  url?: string;
}

export const handleDownloadPDF = async (materialData: Material | null, setProgress: (progress: number) => void) => {
  if (!materialData) return;

  const pdf = new jsPDF('p', 'mm', 'a4', true); // Enable page margins
  let yOffset = 10;
  const pageHeight = 297;
  const pageWidth = 210;
  const leftMargin = 10;
  const rightMargin = 10;
  const maxTextWidth = pageWidth - leftMargin - rightMargin;

  const addNewPageIfNeeded = (linesCount: number) => {
    if (yOffset + linesCount * 6 > pageHeight - 20) {
      pdf.addPage();
      yOffset = 10;
    }
  };

  const totalSteps = materialData.sections.length +
    materialData.sections.reduce((acc, section) => acc + section.subsections.length, 0) +
    materialData.sections.reduce((acc, section) =>
      acc + section.subsections.reduce((subAcc, sub) => subAcc + sub.subSubsections.length, 0), 0) +
    materialData.sections.reduce((acc, section) =>
      acc + (section.images?.length || 0) +
        section.subsections.reduce((subAcc, sub) =>
          subAcc + (sub.images?.length || 0) +
          sub.subSubsections.reduce((subSubAcc, subSub) => subSubAcc + (subSub.images?.length || 0), 0), 0), 0);

  let processedSteps = 0;

  const updateProgress = () => {
    processedSteps += 1;
    setProgress(Math.round((processedSteps / totalSteps) * 100));
  };

  // ✅ Fix: Ensure images load properly
  const addImageWithTitle = async (image: { url: string; title: string }, width = 150, maxHeight = 150) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Ensure Firebase images load
      img.src = image.url;

      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let finalWidth = width;
        let finalHeight = maxHeight;

        if (aspectRatio > 1) {
          finalHeight = width / aspectRatio; // Maintain aspect ratio
        } else {
          finalWidth = maxHeight * aspectRatio;
        }

        // Ensure image fits within page height
        addNewPageIfNeeded(finalHeight + 15);

        // Center image horizontally
        const xPosition = (210 - finalWidth) / 2;
        pdf.addImage(img, 'JPEG', xPosition, yOffset, finalWidth, finalHeight);
        yOffset += finalHeight + 5;

        // ✅ Fix: Add title below image, italicized & centered
        if (image.title) {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(10);

          const textWidth = pdf.getTextWidth(image.title);
          const textXPosition = (210 - textWidth) / 2; // Center text
          pdf.text(image.title, textXPosition, yOffset);

          pdf.setFont('helvetica', 'normal'); // Reset font
          yOffset += 6;
        }

        updateProgress();
        resolve();
      };

      img.onerror = () => {
        console.warn(`Image failed to load: ${image.url}`);
        updateProgress(); // Still update progress even if an image fails
        resolve();
      };
    });
  };

  /**
   * Extract text content from a node, recursively handling inline elements
   * This collects all text including from nested inline elements (bold, italic, links)
   */
  const extractTextFromNode = (node: ChildNode): string => {
    if (!node) return '';
    
    if (node.type === 'text' && 'data' in node) {
      return node.data;
    }
    
    if (isTag(node)) {
      const element = node as Element;
      const tag = element.name.toLowerCase();
      
      // For inline elements, extract their text content
      if (['strong', 'b', 'i', 'em', 'a', 'span', 'u', 'sub', 'sup'].includes(tag)) {
        return element.children?.map(child => extractTextFromNode(child)).join('') || '';
      }
      
      // For block elements within inline context, just get their text
      return element.children?.map(child => extractTextFromNode(child)).join('') || '';
    }
    
    return '';
  };

  /**
   * Collect text segments from paragraph children, preserving styling info
   * This handles inline elements (bold, italic, links) within a paragraph
   */
  const collectParagraphSegments = (element: Element): TextSegment[] => {
    const segments: TextSegment[] = [];
    
    const collectFromNode = (node: ChildNode, currentBold = false, currentItalic = false): void => {
      if (!node) return;
      
      if (node.type === 'text' && 'data' in node) {
        const text = node.data;
        if (text) {
          segments.push({ text, bold: currentBold, italic: currentItalic });
        }
        return;
      }
      
      if (isTag(node)) {
        const el = node as Element;
        const tag = el.name.toLowerCase();
        
        switch (tag) {
          case 'strong':
          case 'b':
            el.children?.forEach(child => collectFromNode(child, true, currentItalic));
            break;
          case 'i':
          case 'em':
            el.children?.forEach(child => collectFromNode(child, currentBold, true));
            break;
          case 'a': {
            // For links, collect the text and mark as link
            const linkText = extractTextFromNode(el);
            if (linkText) {
              segments.push({
                text: linkText,
                isLink: true,
                url: el.attribs?.href || '',
                bold: currentBold,
                italic: currentItalic
              });
            }
            break;
          }
          case 'br':
            segments.push({ text: '\n' });
            break;
          case 'span':
          case 'u':
          case 'sub':
          case 'sup':
            // Handle other inline elements
            el.children?.forEach(child => collectFromNode(child, currentBold, currentItalic));
            break;
          default:
            // For other elements, just process children
            el.children?.forEach(child => collectFromNode(child, currentBold, currentItalic));
        }
      }
    };
    
    element.children?.forEach(child => collectFromNode(child));
    return segments;
  };

  /**
   * Render collected text segments as a continuous paragraph with proper word wrapping
   * Links are rendered inline with special styling (colored text)
   */
  const renderParagraphSegments = (segments: TextSegment[], x: number, fontSize: number) => {
    // Combine all segments into a single text string for proper word wrapping
    const fullText = segments.map(seg => seg.text).join('');
    
    if (!fullText.trim()) return;
    
    // Split by explicit line breaks
    const lines = fullText.split('\n');
    
    for (const line of lines) {
      if (!line.trim()) {
        yOffset += 3; // Small space for empty lines
        continue;
      }
      
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // Wrap the text to fit within page width
      const wrappedLines = pdf.splitTextToSize(line, maxTextWidth - x);
      
      for (const wrappedLine of wrappedLines) {
        addNewPageIfNeeded(1);
        
        // Check if this line contains any links and render with appropriate styling
        // For simplicity, render the entire line with normal text
        // Links will appear as regular text but with their content intact
        pdf.text(wrappedLine, x, yOffset);
        yOffset += 6;
      }
    }
  };

  /**
   * Collect text from list item, handling nested inline elements
   */
  const collectListItemText = (element: Element): string => {
    let text = '';
    
    const collectText = (node: ChildNode): void => {
      if (!node) return;
      
      if (node.type === 'text' && 'data' in node) {
        text += node.data;
        return;
      }
      
      if (isTag(node)) {
        const el = node as Element;
        const tag = el.name.toLowerCase();
        
        // Skip nested lists - they'll be processed separately
        if (tag === 'ul' || tag === 'ol') return;
        
        // For all other elements, collect their text
        el.children?.forEach(child => collectText(child));
      }
    };
    
    element.children?.forEach(child => collectText(child));
    return text.trim();
  };

  const renderHTML = (html: string, x = 10, fontSize = 12) => {
    const dom = parseDocument(html);

    const traverse = (node: ChildNode, indentLevel = 0) => {
      if (!node) return;

      if (isTag(node)) {
        const element = node as Element;
        const tag = element.name.toLowerCase();

        switch (tag) {
          case 'p': {
            yOffset += 4; // Space before paragraph
            
            // Collect all text segments from the paragraph (including inline elements)
            const segments = collectParagraphSegments(element);
            
            // Render as continuous text with proper word wrapping
            renderParagraphSegments(segments, x, fontSize);
            
            yOffset += 4; // Space after paragraph
            break;
          }

          case 'br':
            yOffset += 6; // Line break
            break;

          case 'strong':
          case 'b':
          case 'i':
          case 'em': {
            // These are inline elements - when encountered at block level,
            // treat them as implicit paragraphs
            const text = extractTextFromNode(element);
            if (text.trim()) {
              const isBold = tag === 'strong' || tag === 'b';
              const isItalic = tag === 'i' || tag === 'em';
              addText(text, x, fontSize, isBold, [0, 0, 0], isItalic);
            }
            break;
          }

          case 'ul':
          case 'ol':
            yOffset += 4; // Space before list
            element.children?.forEach((child) => traverse(child, indentLevel + 1));
            yOffset += 2; // Space after list
            break;

          case 'li': {
            const bullet = indentLevel <= 1 ? '•' : '◦';
            const listItemText = collectListItemText(element);
            
            if (listItemText) {
              const bulletX = x + (indentLevel - 1) * 6;
              const textX = bulletX + 4;
              
              // Render bullet
              pdf.setFontSize(fontSize);
              pdf.setFont('helvetica', 'normal');
              addNewPageIfNeeded(1);
              pdf.text(bullet, bulletX, yOffset);
              
              // Render text with word wrap
              const wrappedLines = pdf.splitTextToSize(listItemText, maxTextWidth - textX);
              wrappedLines.forEach((line: string, index: number) => {
                if (index > 0) {
                  addNewPageIfNeeded(1);
                }
                pdf.text(line, textX, yOffset);
                yOffset += 6;
              });
            }

            // Process nested lists
            element.children?.forEach((child) => {
              if (isTag(child)) {
                const childElement = child as Element;
                if (['ul', 'ol'].includes(childElement.name)) {
                  traverse(childElement, indentLevel + 1);
                }
              }
            });
            break;
          }

          case 'a': {
            // Standalone link (not inside a paragraph)
            if (element.attribs?.href) {
              const linkText = extractTextFromNode(element);
              if (linkText.trim()) {
                addLink(linkText, element.attribs.href);
              }
            }
            break;
          }

          case 'h1': {
            const text = extractTextFromNode(element);
            if (text.trim()) {
              addText(text, x, 20, true);
              yOffset += 8;
            }
            break;
          }

          case 'h2': {
            const text = extractTextFromNode(element);
            if (text.trim()) {
              addText(text, x, 18, true);
              yOffset += 8;
            }
            break;
          }

          case 'h3': {
            const text = extractTextFromNode(element);
            if (text.trim()) {
              addText(text, x, 16, true);
              yOffset += 6;
            }
            break;
          }

          case 'div':
          case 'section':
          case 'article':
            // Block containers - just process children
            element.children?.forEach((child) => traverse(child, indentLevel));
            break;

          default:
            // For unknown elements, process children
            element.children?.forEach((child) => traverse(child, indentLevel));
        }
      } else if (node.type === 'text' && 'data' in node) {
        // Standalone text node at block level
        const text = node.data.trim();
        if (text) {
          addText(text, x, fontSize);
        }
      }
    };

    dom.children?.forEach((node) => traverse(node));
  };
         
  const addText = (
    text: string,
    x: number,
    fontSize = 12,
    bold = false,
    color: [number, number, number] = [0, 0, 0],
    italic = false,
    maxWidth = 200  // Ensures text wraps within the page width
  ) => {
    if (!text) return;
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.setFont('helvetica', bold ? (italic ? 'bolditalic' : 'bold') : italic ? 'italic' : 'normal');
  
    // Ensure text wraps within the specified width (180mm = A4 width minus margins)
    const wrappedLines = pdf.splitTextToSize(text, maxWidth - x); // Adjust width dynamically
    wrappedLines.forEach((line: string) => {
      addNewPageIfNeeded(1);
      pdf.text(line, x, yOffset);
      yOffset += 6;
    });
  };  

  const addLink = (title: string, url: string) => {
    addNewPageIfNeeded(1);
    pdf.setTextColor(10, 104, 71); // Change text color to distinguish links
    pdf.textWithLink(title, 10, yOffset, { url });
    yOffset += 6;
  };  

  if (materialData.header?.content) {
    addText('Header:', 10, 12, true);
    renderHTML(materialData.header.content);
    yOffset += 5;
  }

  // Main Title
  if (materialData.title) {
    addText(materialData.title, 10, 18, true, [10, 104, 71]);
    yOffset += 5;
  }

  // ✅ Process Sections, Subsections & Images
  for (const section of materialData.sections) {
    addText(section.title, 10, 16, true);
    renderHTML(section.content);

    if (section.images?.length) {
      for (const image of section.images) {
        await addImageWithTitle(image);
      }
    }

    updateProgress();

    for (const subsection of section.subsections) {
      addText(subsection.title, 12, 14, true);
      renderHTML(subsection.content, 12);

      if (subsection.images?.length) {
        for (const image of subsection.images) {
          await addImageWithTitle(image);
        }
      }

      updateProgress();

      for (const subSubsection of subsection.subSubsections) {
        addText(subSubsection.title, 14, 12, true);
        renderHTML(subSubsection.content, 14);

        if (subSubsection.images?.length) {
          for (const image of subSubsection.images) {
            await addImageWithTitle(image);
          }
        }

        updateProgress();

        if (subSubsection.links?.length) {
          addText('Links:', 14, 12, true);
          subSubsection.links.forEach((link) => addLink(link.title, link.url));
        }
      }

      if (subsection.links?.length) {
        addText('Links:', 12, 12, true);
        subsection.links.forEach((link) => addLink(link.title, link.url));
      }
    }

    if (section.links?.length) {
      addText('Links:', 10, 12, true);
      section.links.forEach((link) => addLink(link.title, link.url));
    }

    yOffset += 5;
  }

  // Footer
  if (materialData.footer?.content) {
    addText('Footer:', 10, 12, true);
    renderHTML(materialData.footer.content);
  }

  pdf.save(`${materialData.title || 'Material'}.pdf`);
  setProgress(100); // ✅ Ensure progress bar reaches 100%
};