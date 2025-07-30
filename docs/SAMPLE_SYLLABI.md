# 📚 Sample Syllabus Files for Testing

This directory contains sample syllabus files in multiple formats to test the syllabus import functionality of NexLAB.

## 🧪 **Available Sample Files**

### **BIOL 301: Advanced Molecular Biology and Biotechnology**
- **File**: `public/test-samples/sample-syllabus.txt`
- **Format**: Plain Text (.txt)
- **Content**: 15-week Biology course with laboratory components
- **Features**: 
  - Course info extraction (number, title, description)
  - 6 learning objectives with numbered list
  - 15-week detailed schedule
  - Prerequisites and grading information
  - Contact details and textbook info

### **CS 350: Introduction to Artificial Intelligence and Machine Learning**
- **File**: `public/test-samples/cs-syllabus.txt`
- **Format**: Plain Text (.txt)
- **Content**: 16-week Computer Science course with programming focus
- **Features**:
  - Comprehensive course description
  - 7 learning objectives with detailed outcomes
  - 16-week schedule covering AI/ML topics
  - Programming assignments and project requirements
  - Academic policies and software requirements

## 🎯 **Expected Parsing Results**

### **BIOL 301 Sample**
When imported, should generate:
- **Course Number**: `BIOL 301`
- **Course Title**: `Advanced Molecular Biology and Biotechnology`
- **Generated Materials**: 7 materials (1 overview + 6 weekly)
- **Objectives**: 6 learning objectives extracted
- **Schedule**: 15 weeks of content

### **CS 350 Sample**
When imported, should generate:
- **Course Number**: `CS 350`
- **Course Title**: `Introduction to Artificial Intelligence and Machine Learning`
- **Generated Materials**: 7 materials (1 overview + 6 weekly)
- **Objectives**: 7 learning objectives extracted
- **Schedule**: 16 weeks of content

## 🔧 **File Format Testing**

### **Supported Formats**
- ✅ **Plain Text (.txt)** - Direct text processing
- ✅ **PDF (.pdf)** - Text extraction using PDF.js
- ✅ **Word Document (.docx)** - Text extraction using Mammoth

### **Testing Different Formats**
1. **Create PDF versions**: Save TXT files as PDF using any word processor
2. **Create DOCX versions**: Copy content into Microsoft Word and save as .docx
3. **Test extraction**: Upload each format and verify identical parsing results

## 📝 **Creating Additional Samples**

### **Template Structure**
For consistent parsing, include these elements:

```
[COURSE NUMBER]: [COURSE TITLE]

Course Title: [Full Title]  
Course Number: [Number]
Instructor: [Name]
Institution: [Institution Name]

Course Description:
[2-3 paragraph description]

Learning Objectives:
By the end of this course, students will be able to:
1. [Objective 1]
2. [Objective 2]
...

Course Schedule:

Week 1: [Topic]
[Description of week 1 content]

Week 2: [Topic]  
[Description of week 2 content]
...

Prerequisites: [List]
Required Textbook: [Book info]
Grading Policy: [Breakdown]
Contact Information: [Details]
```

### **Parser-Friendly Patterns**
- **Course numbers**: Use format like "CS 350", "BIOL 301", "MATH 101"
- **Objectives**: Use numbered lists (1., 2., 3.) or bullet points (-, •)
- **Weekly content**: Start with "Week N:" followed by topic and description
- **Clear headers**: Use consistent labels like "Course Description:", "Learning Objectives:"

## 🧪 **Testing Workflow**

1. **Upload Sample**: Use course creation form with "Import from Syllabus"
2. **Verify Extraction**: Check course info preview for accuracy
3. **Review Materials**: Confirm auto-generated materials match expectations
4. **Submit Request**: Test complete workflow including admin approval
5. **Check Results**: Verify materials appear in course after approval

## 📊 **Success Metrics**

### **Parsing Accuracy**
- Course number and title extracted correctly
- Description captures main content  
- Objectives properly identified and formatted
- Weekly schedule generates appropriate materials

### **Material Generation**
- Overview material with course info and objectives
- Weekly materials for first 6 weeks
- Proper HTML formatting in generated content
- Published/draft status handling

### **End-to-End Workflow**
- Smooth upload and processing experience
- Admin sees syllabus data in approval interface
- Materials created successfully in Firestore
- Educator receives confirmation with material count

---

**💡 Tip**: Test with different file formats of the same content to verify text extraction consistency across PDF, DOCX, and TXT formats. 