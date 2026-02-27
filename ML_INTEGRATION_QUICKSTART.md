# ML Integration Quick Start Guide
**Adding Advanced ML Algorithms with ml.js**

---

## 🎯 **Goal**
Add 5+ machine learning algorithms to the Data Analysis tab in **3-5 days** with zero backend infrastructure.

---

## 📦 **Step 1: Install ml.js (5 minutes)**

```bash
cd /Users/andriy/nexlab
npm install ml-random-forest ml-cart ml-knn ml-naivebayes
```

**Packages:**
- `ml-random-forest` - Random Forest classifier/regressor
- `ml-cart` - Decision Trees (CART algorithm)
- `ml-knn` - K-Nearest Neighbors
- `ml-naivebayes` - Naive Bayes classifier

---

## 🔧 **Step 2: Update Types (10 minutes)**

**File:** `src/types/dataAnalysis.ts`

```typescript
// Line 112: Update mlAlgorithm options
mlAlgorithm?: 
  | 'logistic'           // Current
  | 'random_forest'      // NEW
  | 'decision_tree'      // NEW
  | 'naive_bayes'        // NEW
  | 'knn';               // NEW

// Add new options
nEstimators?: number;       // For random forest (default: 100)
maxDepth?: number;          // For trees (default: 10)
kNeighbors?: number;        // For KNN (default: 5)
minSamplesLeaf?: number;    // For trees (default: 1)
```

---

## 💻 **Step 3: Implement Random Forest (2 hours)**

**File:** `src/services/dataAnalysisService.ts`

Add import:
```typescript
import { RandomForestClassifier } from 'ml-random-forest';
```

Update `performMLClassification()` around line 775:

```typescript
// After the logistic regression block (line 774), add:

} else if (uniqueClasses.length >= 2 && mlAlgorithm === 'random_forest') {
  // Random Forest Classifier
  const RF = new RandomForestClassifier({
    nEstimators: options.nEstimators || 100,
    maxDepth: options.maxDepth || 10,
    minNumSamples: options.minSamplesLeaf || 1,
    seed: randomSeed,
  });

  // Train on all features (Random Forest handles multiclass)
  RF.train(trainData.features, trainData.labels.map(String));

  // Predictions
  trainPredictions = RF.predict(trainData.features).map(String);
  testPredictions = RF.predict(testData.features).map(String);

  // Feature importance (from Random Forest)
  const importanceScores = RF.featureImportance();
  featureImportance = featureVariables.map((feature, idx) => ({
    feature,
    importance: importanceScores[idx] || 0,
  })).sort((a, b) => b.importance - a.importance);
```

---

## 🎨 **Step 4: Add UI Controls (1 hour)**

**File:** `src/components/LaboratoryNotebookV2/DataAnalysis/DataAnalysisPanel.tsx`

**A. Add state for hyperparameters (line 101):**

```typescript
// ML algorithm hyperparameters
const [nEstimators, setNEstimators] = useState<number>(100);
const [maxDepth, setMaxDepth] = useState<number>(10);
const [kNeighbors, setKNeighbors] = useState<number>(5);
const [selectedMLAlgorithm, setSelectedMLAlgorithm] = useState<string>('logistic');
```

**B. Update the analysis type dropdown (line 479):**

```typescript
<MenuItem value="ml_classification">ML: Classification with Train/Test</MenuItem>
```

Change to submenu:
```typescript
<MenuItem value="ml_classification" disabled sx={{ fontWeight: 600 }}>
  ML: Classification Methods
</MenuItem>
<MenuItem 
  value="ml_classification_logistic"
  onClick={() => {
    setAnalysisType('ml_classification');
    setSelectedMLAlgorithm('logistic');
  }}
>
  &nbsp;&nbsp;• Logistic Regression
</MenuItem>
<MenuItem 
  value="ml_classification_rf"
  onClick={() => {
    setAnalysisType('ml_classification');
    setSelectedMLAlgorithm('random_forest');
  }}
>
  &nbsp;&nbsp;• Random Forest ⭐
</MenuItem>
<MenuItem 
  value="ml_classification_dt"
  onClick={() => {
    setAnalysisType('ml_classification');
    setSelectedMLAlgorithm('decision_tree');
  }}
>
  &nbsp;&nbsp;• Decision Tree
</MenuItem>
<MenuItem 
  value="ml_classification_knn"
  onClick={() => {
    setAnalysisType('ml_classification');
    setSelectedMLAlgorithm('knn');
  }}
>
  &nbsp;&nbsp;• K-Nearest Neighbors
</MenuItem>
```

**C. Add hyperparameter controls (after line 696):**

```typescript
{/* Hyperparameter Controls */}
{analysisType === 'ml_classification' && (
  <Paper sx={{ p: 2, backgroundColor: colors.neutral[50], borderRadius: borderRadius.sm }}>
    <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
      Algorithm: {selectedMLAlgorithm.replace('_', ' ').toUpperCase()}
    </Typography>

    {/* Random Forest specific */}
    {selectedMLAlgorithm === 'random_forest' && (
      <Stack spacing={2}>
        <TextField
          label="Number of Trees"
          type="number"
          value={nEstimators}
          onChange={(e) => setNEstimators(Number(e.target.value))}
          inputProps={{ min: 10, max: 500, step: 10 }}
          helperText="More trees = better accuracy but slower (default: 100)"
          fullWidth
          size="small"
        />
        <TextField
          label="Max Tree Depth"
          type="number"
          value={maxDepth}
          onChange={(e) => setMaxDepth(Number(e.target.value))}
          inputProps={{ min: 1, max: 50 }}
          helperText="Deeper trees = more complex model (default: 10)"
          fullWidth
          size="small"
        />
      </Stack>
    )}

    {/* KNN specific */}
    {selectedMLAlgorithm === 'knn' && (
      <TextField
        label="Number of Neighbors (K)"
        type="number"
        value={kNeighbors}
        onChange={(e) => setKNeighbors(Number(e.target.value))}
        inputProps={{ min: 1, max: 50 }}
        helperText="Higher K = smoother decision boundary (default: 5)"
        fullWidth
        size="small"
      />
    )}
  </Paper>
)}
```

**D. Pass hyperparameters to analysis function (line 308):**

```typescript
result = dataAnalysisService.performMLClassification(dataset, featureVariables, targetVariable, {
  splitRatio: trainTestSplit / 100,
  randomSeed,
  mlAlgorithm: selectedMLAlgorithm as any,
  nEstimators,        // NEW
  maxDepth,          // NEW
  kNeighbors,        // NEW
});
```

---

## 🧪 **Step 5: Test with Sample Data (30 minutes)**

**Test Dataset:** Iris (classic ML dataset)

```csv
sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
6.3,3.3,6.0,2.5,virginica
5.8,2.7,5.1,1.9,virginica
```

**Test Steps:**
1. Upload `iris.csv` to Lab Notebook
2. Select "ML: Classification"
3. Choose "Random Forest"
4. Set hyperparameters: Trees=100, Depth=5
5. Features: sepal_length, sepal_width, petal_length, petal_width
6. Target: species
7. Run analysis
8. Verify accuracy > 90%

---

## 📊 **Step 6: Add Visualization Enhancements (1 hour)**

**File:** `src/components/LaboratoryNotebookV2/DataAnalysis/AnalysisVisualization.tsx`

Add "Algorithm Used" badge (line 950):

```typescript
<Chip 
  label={result.algorithm} 
  color="primary" 
  size="small"
  icon={<ScienceIcon />}
  sx={{ mr: 1 }}
/>
```

Add hyperparameter display:
```typescript
{result.algorithm === 'Random Forest' && (
  <Typography variant="caption" color="text.secondary">
    Trees: {result.hyperparameters?.nEstimators || 100} | 
    Depth: {result.hyperparameters?.maxDepth || 10}
  </Typography>
)}
```

---

## 🎯 **Step 7: Implement Decision Tree (1 hour)**

**File:** `src/services/dataAnalysisService.ts`

Add import:
```typescript
import { DecisionTreeClassifier } from 'ml-cart';
```

Add case in `performMLClassification()`:

```typescript
} else if (mlAlgorithm === 'decision_tree') {
  const DT = new DecisionTreeClassifier({
    maxDepth: options.maxDepth || 10,
    minNumSamples: options.minSamplesLeaf || 1,
  });

  // Convert labels to indices for CART
  const labelIndices = trainData.labels.map((label) => 
    classToIndex.get(String(label)) || 0
  );

  DT.train(trainData.features, labelIndices);

  trainPredictions = DT.predict(trainData.features).map((idx: number) => 
    indexToClass.get(idx) || uniqueClasses[0]
  );
  testPredictions = DT.predict(testData.features).map((idx: number) => 
    indexToClass.get(idx) || uniqueClasses[0]
  );
}
```

---

## 🚀 **Step 8: Implement KNN (45 minutes)**

Add import:
```typescript
import KNN from 'ml-knn';
```

Add case:
```typescript
} else if (mlAlgorithm === 'knn') {
  const knn = new KNN(trainData.features, trainData.labels.map((label) => 
    classToIndex.get(String(label)) || 0
  ), { k: options.kNeighbors || 5 });

  trainPredictions = knn.predict(trainData.features).map((idx: number) => 
    indexToClass.get(idx) || uniqueClasses[0]
  );
  testPredictions = knn.predict(testData.features).map((idx: number) => 
    indexToClass.get(idx) || uniqueClasses[0]
  );
}
```

---

## 📝 **Step 9: Update Documentation (30 minutes)**

**File:** `src/components/LaboratoryNotebookV2/DataAnalysis/DataAnalysisPanel.tsx`

Update description (line 373):
```typescript
<Typography variant="body2" sx={{ color: colors.text.secondary }}>
  Upload CSV datasets and perform statistical analyses including linear regression,
  descriptive statistics, correlation, and machine learning (Random Forest, Decision Trees, KNN, etc.).
</Typography>
```

---

## ✅ **Step 10: Testing Checklist**

- [ ] Install all npm packages successfully
- [ ] TypeScript compiles without errors
- [ ] Random Forest trains and predicts correctly
- [ ] Decision Tree works for binary classification
- [ ] KNN handles multi-class problems
- [ ] Hyperparameter controls update the UI
- [ ] Feature importance displays for Random Forest
- [ ] Confusion matrix renders correctly
- [ ] Saved analyses can be reloaded
- [ ] Performance acceptable for 10K row dataset

---

## 🐛 **Common Issues & Fixes**

### **Issue 1: "Cannot find module 'ml-random-forest'"**
```bash
npm install --save ml-random-forest
# If still failing:
rm -rf node_modules package-lock.json
npm install
```

### **Issue 2: "TypeError: RF.train is not a function"**
Check import style:
```typescript
// ❌ Wrong:
import RandomForestClassifier from 'ml-random-forest';

// ✅ Correct:
import { RandomForestClassifier } from 'ml-random-forest';
```

### **Issue 3: Predictions are all the same class**
- Check label encoding (should be strings or numbers, consistent)
- Verify features are normalized if needed
- Increase `maxDepth` or `nEstimators`

### **Issue 4: Slow performance on large datasets**
- Use Web Workers (advanced, see below)
- Reduce `nEstimators` (100 → 50)
- Sample data (use 10K rows max for training)

---

## 🔮 **Future Enhancements**

### **Web Workers for Parallelism:**
```typescript
// mlWorker.ts
self.onmessage = (e) => {
  const { algorithm, data, options } = e.data;
  const model = trainModel(algorithm, data, options);
  self.postMessage(model);
};

// Usage:
const worker = new Worker(new URL('./mlWorker.ts', import.meta.url));
worker.postMessage({ algorithm: 'random_forest', data, options });
worker.onmessage = (e) => {
  const result = e.data;
  // Update UI
};
```

### **Model Persistence:**
```typescript
// Save trained model
const modelJSON = RF.toJSON();
localStorage.setItem('trained_model', JSON.stringify(modelJSON));

// Load later
const loadedModel = RandomForestClassifier.load(
  JSON.parse(localStorage.getItem('trained_model'))
);
```

---

## 📊 **Expected Performance**

| Algorithm | Training Time (10K rows) | Accuracy (Iris) |
|-----------|--------------------------|-----------------|
| Logistic Regression | <1 second | 95% |
| Random Forest (100 trees) | 2-3 seconds | 97% |
| Decision Tree | <1 second | 93% |
| KNN (k=5) | <1 second | 96% |

---

## 🎓 **Educational Benefits**

Students will learn:
1. **Algorithm comparison** - Which performs best for their data?
2. **Hyperparameter tuning** - How settings affect accuracy
3. **Overfitting** - Compare train vs test accuracy
4. **Feature importance** - Which variables matter most?
5. **Ensemble methods** - Why Random Forest > single Decision Tree

---

## 📞 **Need Help?**

- **ml.js Docs**: https://github.com/mljs/ml
- **Random Forest Paper**: https://www.stat.berkeley.edu/~breiman/randomforest2001.pdf
- **CART Algorithm**: https://en.wikipedia.org/wiki/Decision_tree_learning

---

**Ready to start?** Follow steps 1-10 in order. Estimated total time: **3-5 days** (1 developer).
