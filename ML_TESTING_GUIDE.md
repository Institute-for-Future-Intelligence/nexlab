# ML Algorithms Testing Guide
**Test Plan for ml.js Integration**

---

## 🎯 **What Was Implemented**

### **New Algorithms:**
1. ✅ **Random Forest** - Ensemble method with 100+ trees
2. ✅ **Decision Tree** - Interpretable rules-based classifier
3. ✅ **K-Nearest Neighbors** - Distance-based classification

### **UI Enhancements:**
- Algorithm selection dropdown with 4 options
- Hyperparameter controls for each algorithm
- Algorithm-specific help text and recommendations
- Enhanced result summaries

---

## 🧪 **Testing Checklist**

### **Pre-Testing Setup:**

1. **Start the application:**
   ```bash
   cd /Users/andriy/nexlab
   npm run dev
   ```

2. **Navigate to:**
   - Laboratory Notebook
   - Create or select a Design/Build/Test node
   - Go to "Data Analysis" tab

---

## 📊 **Test 1: Basic Random Forest**

### **Test Data:**
Download Iris dataset or use this sample:

```csv
sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
7.0,3.2,4.7,1.4,versicolor
6.4,3.2,4.5,1.5,versicolor
6.3,3.3,6.0,2.5,virginica
5.8,2.7,5.1,1.9,virginica
```

### **Steps:**
1. ✅ Upload CSV file
2. ✅ Click "Run Analysis" tab
3. ✅ Select dataset
4. ✅ Choose "ML: Classification - Random Forest ⭐"
5. ✅ Select features: sepal_length, sepal_width, petal_length, petal_width
6. ✅ Select target: species
7. ✅ Verify hyperparameters show:
   - Number of Trees: 100 (default)
8. ✅ Set train/test split: 80%
9. ✅ Click "Run Analysis"

### **Expected Results:**
- ✅ Analysis completes in < 5 seconds
- ✅ Accuracy > 85%
- ✅ Confusion matrix displays correctly
- ✅ Feature importance chart appears
- ✅ Summary says "Random Forest (100 trees)"
- ✅ No errors in browser console

---

## 📊 **Test 2: Decision Tree with Hyperparameters**

### **Steps:**
1. ✅ Use same dataset as Test 1
2. ✅ Choose "ML: Classification - Decision Tree"
3. ✅ Adjust hyperparameters:
   - Max Tree Depth: 5
   - Min Samples per Leaf: 2
4. ✅ Same features and target
5. ✅ Click "Run Analysis"

### **Expected Results:**
- ✅ Analysis completes in < 3 seconds
- ✅ Accuracy > 80%
- ✅ Summary says "Decision Tree (max depth: 5)"
- ✅ Recommendation mentions "adjusting max depth"

---

## 📊 **Test 3: K-Nearest Neighbors**

### **Steps:**
1. ✅ Use same dataset
2. ✅ Choose "ML: Classification - K-Nearest Neighbors"
3. ✅ Set k=3
4. ✅ Click "Run Analysis"

### **Expected Results:**
- ✅ Analysis completes in < 2 seconds
- ✅ Accuracy > 85%
- ✅ Summary says "K-Nearest Neighbors (k=3)"
- ✅ Recommendation mentions "Try different k values"

---

## 📊 **Test 4: Logistic Regression (Existing)**

### **Steps:**
1. ✅ Choose "ML: Classification - Logistic Regression"
2. ✅ Use binary classification data (e.g., cancer diagnosis)
3. ✅ Click "Run Analysis"

### **Expected Results:**
- ✅ Still works as before
- ✅ Uses gradient descent
- ✅ Feature normalization applied

---

## 📊 **Test 5: Algorithm Comparison**

### **Objective:** Compare all 3 new algorithms on the same dataset

### **Steps:**
1. ✅ Run Random Forest → Save analysis as "RF_Test1"
2. ✅ Run Decision Tree → Save analysis as "DT_Test1"
3. ✅ Run KNN → Save analysis as "KNN_Test1"
4. ✅ Go to "Saved Analyses" tab
5. ✅ Click each saved analysis to view results

### **Expected Results:**
- ✅ All 3 analyses saved successfully
- ✅ Can reload and view each one
- ✅ Accuracy differs slightly between algorithms
- ✅ Feature importance shows different rankings

---

## 📊 **Test 6: Edge Cases**

### **Test 6a: Very Small Dataset (10 rows)**
- ✅ Should work but may warn about overfitting
- ✅ Accuracy might be 100% (overfitting)

### **Test 6b: Large Dataset (10,000 rows)**
- ✅ Should complete in < 10 seconds
- ✅ Random Forest might be slower (~5-10 seconds)
- ✅ No browser crashes

### **Test 6c: Many Features (20+ columns)**
- ✅ All algorithms should handle it
- ✅ Feature importance chart might be cramped

### **Test 6d: Imbalanced Classes (90% class A, 10% class B)**
- ✅ Should complete successfully
- ✅ May show low recall for minority class
- ✅ Recommendation should mention class balancing

---

## 🐛 **Known Issues / Expected Behavior**

### **Issue 1: Pre-existing TypeScript Errors**
- ✅ lines 230, 346 in dataAnalysisService.ts
- ✅ These are OLD errors, not caused by new code
- ✅ Application still compiles and runs

### **Issue 2: Random Forest is Slower**
- ✅ 100 trees take longer than 1 tree
- ✅ This is expected (trade-off for accuracy)
- ✅ Can reduce trees to 50 for speed

### **Issue 3: Multi-class with Many Classes**
- ✅ Works for 2-50 classes
- ✅ Confusion matrix gets crowded with 10+ classes
- ✅ This is a visualization issue, not algorithm issue

---

## ✅ **Success Criteria**

### **Must Pass:**
- [ ] All 3 new algorithms run without errors
- [ ] Hyperparameter controls update the UI
- [ ] Results are saved and can be reloaded
- [ ] No new TypeScript errors introduced
- [ ] No browser console errors
- [ ] Accuracy is reasonable (> 70% on Iris dataset)

### **Nice to Have:**
- [ ] Performance is acceptable (< 10 seconds)
- [ ] UI is intuitive (no user confusion)
- [ ] Recommendations are helpful

---

## 📝 **Bug Reporting Template**

If you find issues, report them with:

```
**Bug:** [Brief description]
**Algorithm:** [Random Forest / Decision Tree / KNN]
**Dataset:** [File name, size]
**Steps to Reproduce:**
1. ...
2. ...
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Console Errors:** [Copy from browser console]
**Screenshot:** [If relevant]
```

---

## 🚀 **Performance Benchmarks**

### **Target Performance:**

| Dataset Size | Random Forest | Decision Tree | KNN |
|--------------|---------------|---------------|-----|
| 100 rows | < 1 second | < 1 second | < 1 second |
| 1,000 rows | < 3 seconds | < 1 second | < 1 second |
| 10,000 rows | < 10 seconds | < 3 seconds | < 2 seconds |

### **Accuracy Targets (Iris Dataset):**

| Algorithm | Min Accuracy | Target Accuracy |
|-----------|--------------|-----------------|
| Random Forest | 90% | 95%+ |
| Decision Tree | 85% | 90%+ |
| KNN | 85% | 93%+ |
| Logistic Regression | 85% | 95%+ |

---

## 🎓 **Educational Testing**

### **For Students/Educators:**

**Test Scenario 1: Algorithm Comparison Lesson**
1. Upload the Iris dataset
2. Run all 4 algorithms with default settings
3. Compare accuracies
4. Question: "Which algorithm performs best? Why?"

**Test Scenario 2: Hyperparameter Tuning**
1. Start with Decision Tree, depth=1
2. Gradually increase depth: 2, 5, 10, 20
3. Observe accuracy changes
4. Question: "At what depth do we see diminishing returns?"

**Test Scenario 3: Overfitting Detection**
1. Use Decision Tree with depth=50 on small dataset
2. Compare training vs testing accuracy
3. Question: "Is the model overfitting? How can you tell?"

---

## 📞 **Support**

If you encounter issues:
1. Check browser console for errors
2. Try with a smaller dataset
3. Try with default hyperparameters
4. Refer to `ML_INTEGRATION_QUICKSTART.md` for troubleshooting

---

**Testing Completed:** [ ] Yes [ ] No  
**Date Tested:** ________________  
**Tested By:** ________________  
**Overall Status:** [ ] Pass [ ] Fail [ ] Partial  
**Notes:** ________________________________
