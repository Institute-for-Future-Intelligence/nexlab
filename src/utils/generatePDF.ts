// src/utils/generatePDF.ts
import jsPDF from 'jspdf';
import { Material } from '../types/Material';
import { parseDocument } from 'htmlparser2';
import type { ChildNode, Element } from 'domhandler';
import { isTag } from 'domelementtype';
import * as DomUtils from 'domutils';

export const handleDownloadPDF = (materialData: Material | null) => {
  if (!materialData) return;

  const pdf = new jsPDF('p', 'mm', 'a4', true); // Enable page margins
  let yOffset = 10;
  const pageHeight = 297;

  const addNewPageIfNeeded = (linesCount: number) => {
    if (yOffset + linesCount * 6 > pageHeight - 20) {
      pdf.addPage();
      yOffset = 10;
    }
  };

  const renderHTML = (html: string, x = 10, fontSize = 12) => {
    const dom = parseDocument(html);

    const traverse = (node: ChildNode, indentLevel = 0, insideList = false) => {
        if (!node) return;

        if (isTag(node)) {
            const element = node as Element;
            const tag = element.name.toLowerCase();

            switch (tag) {
                case 'p':
                    yOffset += 6; // Space before paragraph
                    element.children?.forEach((child) => traverse(child, indentLevel));
                    yOffset += 6; // Space after paragraph
                    break;

                case 'br':
                    yOffset += 6; // Line break
                    break;

                case 'strong':
                case 'b':
                case 'i':
                case 'em':
                    pdf.setFont('helvetica', tag === 'strong' || tag === 'b' ? 'bold' : 'italic');
                    element.children?.forEach((child) => traverse(child, indentLevel));
                    pdf.setFont('helvetica', 'normal'); // Reset font
                    break;

                case 'ul':
                case 'ol':
                    yOffset += 4; // Space before list
                    element.children?.forEach((child) => traverse(child, indentLevel + 1, true));
                    break;

                case 'li':
                    const bullet = indentLevel === 1 ? '-' : '--';

                    // **Fix: Extract only direct text while preserving <strong> and <b>**
                    let listItemText = '';
                    element.children?.forEach((child) => {
                        if (isTag(child)) {
                            const childElement = child as Element;
                            if (childElement.name === 'strong' || childElement.name === 'b') {
                                pdf.setFont('helvetica', 'bold');
                                listItemText += ` ${DomUtils.getText(childElement)}`;
                                pdf.setFont('helvetica', 'normal'); // Reset font
                            } else if (childElement.name !== 'ul' && childElement.name !== 'ol') {
                                listItemText += ` ${DomUtils.getText(childElement)}`;
                            }
                        } 
                        // **Fix: Ensure `child` is a text node before accessing `.data`**
                        else if (child.type === 'text' && 'data' in child) {
                            listItemText += ` ${child.data.trim()}`;
                        }
                    });

                    listItemText = listItemText.trim();
                    if (listItemText) {
                        // **Apply larger font size for top-level list headers**
                        if (indentLevel === 0) {
                            addText(`${bullet} ${listItemText}`, x, fontSize + 2, true); // Make headers stand out
                        } else {
                            addText(`${bullet} ${listItemText}`, x + indentLevel * 8, fontSize);
                        }
                        yOffset += 6;
                    }

                    // **Fix: Process only `<ul>` and `<ol>` inside `<li>`**
                    element.children?.forEach((child) => {
                        if (isTag(child)) {
                            const childElement = child as Element;
                            if (['ul', 'ol'].includes(childElement.name)) {
                                traverse(childElement, indentLevel + 1, true);
                            }
                        }
                    });
                    break;

                case 'a':
                    if (element.attribs?.href) {
                        addLink(DomUtils.getText(element), element.attribs.href);
                    }
                    break;

                case 'h1':
                    addText(DomUtils.getText(element), x, 20, true);
                    yOffset += 8;
                    break;

                case 'h2':
                    addText(DomUtils.getText(element), x, 18, true);
                    yOffset += 8;
                    break;

                case 'h3':
                    addText(DomUtils.getText(element), x, 16, true);
                    yOffset += 6;
                    break;

                default:
                    element.children?.forEach((child) => traverse(child, indentLevel));
            }
        } else if (node.type === 'text' && 'data' in node) {
            const text = node.data.trim();
            if (text) addText(text, x + indentLevel * 8, fontSize);
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

  const addImage = (url: string, width = 50, height = 50) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      addNewPageIfNeeded(height);
      pdf.addImage(img, 'JPEG', 10, yOffset, width, height);
      yOffset += height + 5;
    };
    img.onerror = () => console.warn(`Image failed to load: ${url}`);
  };

  const addLink = (title: string, url: string) => {
    addNewPageIfNeeded(1);
    pdf.setTextColor(10, 104, 71);
    pdf.textWithLink(title, 10, yOffset, { url });
    yOffset += 6;
  };

  const addImageWithTitle = (image: { url: string; title: string }, x = 10, width = 100, height = 80) => {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Ensure images from Firebase Storage are loaded correctly
    img.src = image.url;

    img.onload = () => {
      // Ensure image fits within the page height
      if (yOffset + height > pageHeight - 20) {
        pdf.addPage();
        yOffset = 10;
      }

      pdf.addImage(img, 'JPEG', x, yOffset, width, height);
      yOffset += height + 5;

      // Add Image Title
      if (image.title) {
        addText(image.title, x, 10, false, [0, 0, 0], true);
        yOffset += 6;
      }

      resolve();
    };

    img.onerror = () => {
      console.warn(`Image failed to load: ${image.url}`);
      resolve();
    };
  });
};

  // Header
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

  // Sections
  materialData.sections.forEach((section, sectionIndex) => {
    addText(`${sectionIndex + 1}. ${section.title}`, 10, 16, true);
    renderHTML(section.content);

    section.images?.forEach((image) => addImage(image.url));

    section.subsections.forEach((subsection, subIndex) => {
      addText(`${sectionIndex + 1}.${subIndex + 1} ${subsection.title}`, 12, 14, true);
      renderHTML(subsection.content, 12);

      subsection.images?.forEach((image) => addImage(image.url));

      subsection.subSubsections.forEach((subSubsection, subSubIndex) => {
        addText(`${sectionIndex + 1}.${subIndex + 1}.${subSubIndex + 1} ${subSubsection.title}`, 14, 12, true);
        renderHTML(subSubsection.content, 14);

        subSubsection.images?.forEach((image) => addImage(image.url));

        if (subSubsection.links?.length) {
          addText('Links:', 14, 12, true);
          subSubsection.links.forEach((link) => addLink(link.title, link.url));
        }
      });

      if (subsection.links?.length) {
        addText('Links:', 12, 12, true);
        subsection.links.forEach((link) => addLink(link.title, link.url));
      }
    });

    if (section.links?.length) {
      addText('Links:', 10, 12, true);
      section.links.forEach((link) => addLink(link.title, link.url));
    }

    yOffset += 5;
  });

  // Footer
  if (materialData.footer?.content) {
    addText('Footer:', 10, 12, true);
    renderHTML(materialData.footer.content);
  }

  pdf.save(`${materialData.title || 'Material'}.pdf`);
};