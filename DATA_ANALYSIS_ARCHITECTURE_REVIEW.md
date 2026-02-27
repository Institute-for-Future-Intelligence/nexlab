# Data Analysis Architecture Review & Roadmap
**Lab Notebook Data Analysis Feature**  
**Date:** January 28, 2026

---

## 📊 **Current Capabilities Summary**

### **What Users Can Do:**

1. **📂 Upload CSV Datasets**
   - Drag-and-drop or browse for CSV files
   - Client-side parsing with PapaParse
   - Automatic column type detection (numeric/categorical)
   - Storage in Firebase Storage
   - Metadata in Firestore (to avoid 1MB document limit)

2. **📈 Statistical Analysis**
   - **Descriptive Statistics**: Mean, median, std dev, variance, min/max, Q1/Q3, IQR
   - **Correlation Analysis**: Pearson correlation matrix for multiple variables
   - **Simple Linear Regression**: 2-variable regression with R², p-value, residuals

3. **🤖 Machine Learning (Basic)**
   - **ML Regression**: Multivariate linear regression with train/test split
     - Uses Normal Equation (OLS): `β = (X^T X)^(-1) X^T y`
     - K-fold cross-validation support
     - Metrics: R², MSE, RMSE, MAE
   - **ML Classification**: Binary logistic regression
     - Gradient descent (1000 iterations, learning rate 0.1)
     - Z-score normalization
     - Metrics: Accuracy, precision, recall, F1, confusion matrix
     - Feature importance (correlation-based)

4. **💾 Save & Recall Analyses**
   - Save analyses with custom names/descriptions
   - View previous analyses
   - Analysis results stored in Firestore

5. **📊 Visualizations**
   - Scatter plots with regression lines
   - Bar charts for descriptive stats
   - Correlation heatmaps
   - Residual plots
   - Confusion matrices
   - Feature importance charts

---

## 🏗️ **Current Architecture**

### **Technology Stack:**

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
├─────────────────────────────────────────────────────────┤
│  Components:                                             │
│  • DataAnalysisPanel.tsx       (Main UI, tabs)          │
│  • CSVUploadSection.tsx        (Drag & drop upload)     │
│  • AnalysisVisualization.tsx   (Charts & results)       │
│                                                          │
│  Services:                                               │
│  • dataAnalysisService.ts      (All analysis logic)     │
│    - PapaParse (CSV parsing)                            │
│    - simple-statistics (mean, correlation, etc.)        │
│    - Custom implementations (logistic regression, OLS)  │
│                                                          │
│  State Management:                                       │
│  • Zustand (Lab Notebook state)                         │
│  • Local React state (analysis results, UI)             │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                  FIREBASE BACKEND                        │
├─────────────────────────────────────────────────────────┤
│  Firebase Storage:                                       │
│  • Raw CSV files at:                                     │
│    /dataAnalysis/{userId}/{nodeType}/{nodeId}/{file}    │
│                                                          │
│  Firestore:                                              │
│  • Design/Build/Test nodes contain:                     │
│    - dataAnalysis.datasets[] (metadata only, no rows)   │
│    - dataAnalysis.analyses[] (saved results)            │
└─────────────────────────────────────────────────────────┘
```

### **Key Design Decisions:**

1. **Client-Side Processing**: All analysis runs in the browser
   - ✅ **Pros**: No backend costs, instant results, no server load
   - ⚠️ **Cons**: Limited to browser memory (~2GB), no advanced ML libraries, slow for large datasets

2. **Firestore for Metadata Only**: 
   - Raw CSV data stored in Storage (bypass 1MB Firestore limit)
   - Only metadata (columns, row count, URL) in Firestore
   - Data loaded on-demand for analysis

3. **Pure JavaScript Algorithms**:
   - `simple-statistics` for basic stats
   - Custom implementations for ML (gradient descent, Normal Equation)
   - No Python, no scikit-learn, no TensorFlow

---

## 🔬 **Data Flow: End-to-End**

### **Upload Flow:**
```
1. User drags CSV → CSVUploadSection
2. PapaParse reads file → Dataset object created
3. File uploaded to Firebase Storage → Download URL generated
4. Dataset metadata saved to Firestore (node.data.dataAnalysis.datasets[])
5. Full dataset cached in memory (Map<datasetId, Dataset>)
```

### **Analysis Flow:**
```
1. User selects dataset from dropdown
2. If not cached → fetch from Storage URL → parse again
3. User configures analysis (type, variables, train/test split)
4. dataAnalysisService runs computation in browser
5. Results displayed in AnalysisVisualization
6. User optionally saves analysis → Firestore
```

### **Limitations Observed:**

| Issue | Impact | Severity |
|-------|--------|----------|
| **Browser memory limit** | Can't handle datasets > ~50MB | 🔴 HIGH |
| **No GPU acceleration** | Slow ML training for large datasets | 🟡 MEDIUM |
| **Basic ML algorithms** | Only logistic regression & OLS available | 🟡 MEDIUM |
| **No Python ecosystem** | Can't use scikit-learn, pandas, matplotlib | 🟡 MEDIUM |
| **Client-side only** | No distributed computing for big data | 🟠 LOW |

---

## 🚀 **Recommendations for Advanced ML**

### **Option 1: Python Backend API (⭐ RECOMMENDED)**

**Architecture:**
```
┌──────────────┐       HTTPS      ┌──────────────────┐
│   React UI   │ ←─────────────→ │ Python Backend   │
│              │  (JSON API)      │ (Cloud Run)      │
│  • Upload    │                  │ • Flask/FastAPI  │
│  • Configure │                  │ • scikit-learn   │
│  • Display   │                  │ • pandas         │
└──────────────┘                  │ • joblib         │
                                  └──────────────────┘
                                          ↕
                                  ┌──────────────────┐
                                  │ Firebase Storage │
                                  │ • CSV files      │
                                  │ • Trained models │
                                  └──────────────────┘
```

**Pros:**
- ✅ Access to full Python ecosystem (scikit-learn, XGBoost, etc.)
- ✅ Handle large datasets (server memory)
- ✅ Save trained models (pickle/joblib)
- ✅ Async processing with job queues

**Cons:**
- ❌ Backend infrastructure costs (~$20-50/month)
- ❌ Requires maintaining Python service
- ❌ Latency for API calls

**Implementation Steps:**
1. Create Python Flask API in `/functions/ml-api/`
2. Add endpoints: `/train`, `/predict`, `/evaluate`
3. Deploy to Google Cloud Run (serverless)
4. Frontend calls API via `mlAnalysisService.ts`
5. Stream progress updates via WebSockets or polling

**Estimated Effort:** 2-3 weeks (1 developer)

---

### **Option 2: TensorFlow.js (⭐ GOOD FOR NEURAL NETWORKS)**

**Architecture:**
```
┌────────────────────────────────────────────┐
│          React Component                   │
│  • Import @tensorflow/tfjs                 │
│  • Train models in browser                 │
│  • Use Web Workers for parallelism         │
└────────────────────────────────────────────┘
```

**Pros:**
- ✅ Client-side (no backend)
- ✅ Neural networks supported
- ✅ GPU acceleration (WebGL)
- ✅ Pre-trained models available

**Cons:**
- ❌ Limited to neural networks (no random forests, XGBoost)
- ❌ Still browser memory constraints
- ❌ Slower than native Python

**Best For:** Image classification, time series prediction, deep learning

**Estimated Effort:** 1-2 weeks (1 developer)

---

### **Option 3: ml.js (⭐ LIGHTWEIGHT ADDITION)**

**Architecture:**
```
┌────────────────────────────────────────────┐
│       dataAnalysisService.ts               │
│  • import { RandomForest } from 'ml.js'    │
│  • Extend performMLClassification()        │
└────────────────────────────────────────────┘
```

**Pros:**
- ✅ Easy to integrate (just npm install)
- ✅ Random Forest, Decision Trees, KNN, SVM
- ✅ No backend required
- ✅ Lightweight (~200KB)

**Cons:**
- ❌ Not as mature as scikit-learn
- ❌ Limited documentation
- ❌ Still browser memory limits

**Best For:** Quick wins (add 5-10 algorithms with minimal effort)

**Estimated Effort:** 3-5 days (1 developer)

---

### **Option 4: Hybrid (Python + TensorFlow.js)** (⭐ BEST LONG-TERM)

**Strategy:**
- **Client-side (TensorFlow.js)**: Neural networks, real-time inference
- **Server-side (Python API)**: Traditional ML (random forest, XGBoost, ensemble methods)
- **User chooses**: "Run in browser" vs "Run on server"

**Pros:**
- ✅ Best of both worlds
- ✅ User control over cost/speed tradeoffs
- ✅ Scales to advanced use cases

**Cons:**
- ❌ Most complex to implement
- ❌ Requires maintaining 2 systems

**Estimated Effort:** 4-6 weeks (1-2 developers)

---

## 🎯 **Recommended Roadmap**

### **Phase 1: Quick Wins (1-2 weeks)**
1. **Add ml.js** for immediate algorithm expansion:
   - Random Forest
   - Decision Trees
   - K-Nearest Neighbors
   - Support Vector Machines
2. **Update UI** to show algorithm dropdown
3. **Add hyperparameter controls** (e.g., tree depth, number of estimators)

**Code Changes:**
```typescript
// dataAnalysisService.ts
import { RandomForestClassifier } from 'ml-random-forest';
import { DecisionTreeClassifier } from 'ml-cart';

performMLClassification(..., options) {
  if (options.mlAlgorithm === 'random_forest') {
    const rf = new RandomForestClassifier({
      nEstimators: options.nEstimators || 100,
      maxDepth: options.maxDepth || 10,
    });
    rf.train(trainX, trainY);
    // ...
  }
}
```

**Deliverables:**
- 5+ new ML algorithms available
- Hyperparameter tuning UI
- Updated documentation

---

### **Phase 2: Backend ML API (3-4 weeks)**
1. **Create Python service** (`/functions/ml-api/`)
   ```python
   # app.py
   from flask import Flask, request, jsonify
   from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
   from sklearn.model_selection import train_test_split
   import pandas as pd
   
   @app.route('/train', methods=['POST'])
   def train_model():
       data = request.json
       df = pd.DataFrame(data['dataset'])
       # ... sklearn training logic
       return jsonify({'model_id': model_id, 'metrics': metrics})
   ```
2. **Deploy to Cloud Run**
3. **Add frontend service**:
   ```typescript
   // mlApiService.ts
   export async function trainModelOnServer(
     dataset: Dataset,
     config: MLConfig
   ): Promise<MLResult> {
     const response = await fetch('https://ml-api.run.app/train', {
       method: 'POST',
       body: JSON.stringify({ dataset, config }),
     });
     return response.json();
   }
   ```
4. **Add "Run on Server" toggle** in UI

**Deliverables:**
- Python ML API (Flask + scikit-learn)
- Cloud Run deployment
- Frontend integration
- Cost estimation per analysis

---

### **Phase 3: Advanced Features (4-6 weeks)**
1. **Neural Networks** (TensorFlow.js for time series, images)
2. **AutoML** (automated hyperparameter search)
3. **Model Comparison** (compare 3+ models side-by-side)
4. **Feature Engineering** (automatic feature selection, PCA)
5. **Explainability** (SHAP values, LIME)

**Deliverables:**
- Deep learning support
- Automated model selection
- Explainability dashboards

---

## 💰 **Cost Analysis**

### **Current (Client-Side Only):**
- Firebase Storage: ~$0.026/GB/month
- Firestore: ~$0.18/100K reads
- **Monthly Cost**: ~$5-10 (low usage)

### **With Python Backend (Cloud Run):**
- Cloud Run: $0.00002400/vCPU-second
- Average analysis: 10 seconds @ 1 vCPU = $0.00024
- 1000 analyses/month = **$0.24/month**
- Storage for models: +$1-5/month
- **Total Monthly Cost**: ~$10-20 (low-medium usage)

### **Recommendation:**
**Start with ml.js (Phase 1)** for zero additional cost. Evaluate user demand, then add Python backend if needed.

---

## 🧪 **Testing Strategy**

### **Test Datasets Needed:**
1. **Small** (100 rows, 5 columns) - cancer diagnosis
2. **Medium** (10K rows, 20 columns) - customer churn
3. **Large** (100K rows, 50 columns) - sensor data
4. **Edge Cases**:
   - Missing values
   - Categorical features
   - Imbalanced classes
   - High dimensionality

### **Performance Benchmarks:**
| Dataset Size | Current (Browser) | Target (Backend) |
|--------------|-------------------|------------------|
| 1K rows | <1 second | <0.5 seconds |
| 10K rows | 3-5 seconds | <2 seconds |
| 100K rows | 30-60 seconds | <10 seconds |
| 1M rows | ❌ (crashes) | <60 seconds |

---

## 📚 **Brainstormed Advanced ML Methods**

### **Classification:**
- [x] Logistic Regression (current)
- [ ] Random Forest ⭐ (ml.js or backend)
- [ ] Gradient Boosting (XGBoost, LightGBM) ⭐
- [ ] Support Vector Machines (SVM)
- [ ] K-Nearest Neighbors (KNN)
- [ ] Naive Bayes
- [ ] Neural Networks (TensorFlow.js)
- [ ] Ensemble Methods (voting, stacking)

### **Regression:**
- [x] Linear Regression (current)
- [ ] Ridge Regression
- [ ] Lasso Regression
- [ ] Elastic Net
- [ ] Random Forest Regressor ⭐
- [ ] Gradient Boosting Regressor ⭐
- [ ] Neural Networks (TensorFlow.js)

### **Clustering (Unsupervised):**
- [ ] K-Means ⭐
- [ ] DBSCAN
- [ ] Hierarchical Clustering
- [ ] Gaussian Mixture Models

### **Dimensionality Reduction:**
- [ ] PCA (Principal Component Analysis) ⭐
- [ ] t-SNE
- [ ] UMAP

### **Time Series:**
- [ ] ARIMA
- [ ] LSTM (TensorFlow.js)
- [ ] Prophet (backend only)

### **Anomaly Detection:**
- [ ] Isolation Forest ⭐
- [ ] One-Class SVM
- [ ] Autoencoders (TensorFlow.js)

⭐ = High priority / High educational value

---

## 🎓 **Educational Value Assessment**

### **Current System (Good for):**
✅ Teaching statistics fundamentals  
✅ Understanding train/test splits  
✅ Visualizing correlations  
✅ Introducing ML concepts

### **Advanced ML (Unlocks):**
🚀 **Comparing algorithms** (which is best for this data?)  
🚀 **Hyperparameter tuning** (model optimization)  
🚀 **Feature engineering** (creative problem-solving)  
🚀 **Real-world workflows** (mimics industry practices)  
🚀 **Explainability** (understanding model decisions)

---

## ✅ **Action Items (Next Steps)**

### **Immediate (This Week):**
1. ✅ Complete this architecture review
2. [ ] **Decide on Phase 1 approach** (ml.js vs backend vs both)
3. [ ] **Gather test datasets** (create `/test-data/` folder)
4. [ ] **Document current API** (what functions exist)

### **Short-Term (Next 2 Weeks):**
1. [ ] **Implement ml.js integration** (if chosen)
   - Add Random Forest classifier
   - Add Decision Tree
   - Update UI for algorithm selection
2. [ ] **Add hyperparameter controls** to UI
3. [ ] **Create unit tests** for existing ML functions
4. [ ] **Benchmark performance** with test datasets

### **Medium-Term (Next Month):**
1. [ ] **Build Python ML API** (if backend chosen)
2. [ ] **Deploy to Cloud Run**
3. [ ] **Add cost tracking** (log API calls, estimate costs)
4. [ ] **User testing** with educators/students

---

## 📞 **Questions to Resolve**

1. **Budget**: What's the acceptable monthly cost for ML API?
2. **Scale**: How many users/analyses per day do you expect?
3. **Priority**: Education (explainability) vs Performance (speed)?
4. **Dataset Size**: What's the largest CSV users might upload?
5. **Algorithms**: Which specific algorithms are most important for your curriculum?

---

## 📖 **References**

- **ml.js**: https://github.com/mljs/ml
- **TensorFlow.js**: https://www.tensorflow.org/js
- **scikit-learn**: https://scikit-learn.org
- **Cloud Run Pricing**: https://cloud.google.com/run/pricing
- **PapaParse**: https://www.papaparse.com
- **simple-statistics**: https://simplestatistics.org

---

**End of Review** • Generated: Jan 28, 2026
