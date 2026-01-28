// src/services/dataAnalysisService.ts

import Papa from 'papaparse';
import {
  mean,
  median,
  standardDeviation,
  variance,
  quantile,
  min,
  max,
  sampleCorrelation,
  linearRegression,
  linearRegressionLine,
} from 'simple-statistics';
import {
  Dataset,
  DatasetMetadata,
  DataPoint,
  DataColumn,
  ColumnStatistics,
  LinearRegressionResult,
  DescriptiveStatsResult,
  CorrelationResult,
  DataValidationResult,
  DataValidationError,
  MLClassificationResult,
  MLRegressionResult,
  AnalysisOptions,
} from '../types/dataAnalysis';

/**
 * Data Analysis Service
 * Handles CSV parsing, statistical analysis, and data transformations
 */

class DataAnalysisService {
  /**
   * Load dataset from Firebase Storage URL
   * Used to reload data for analysis without storing in Firestore
   */
  async loadDatasetFromURL(metadata: DatasetMetadata): Promise<Dataset> {
    try {
      const response = await fetch(metadata.fileUrl);
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as DataPoint[];
            
            // Reconstruct full dataset with data
            const dataset: Dataset = {
              ...metadata,
              data,
            };
            
            resolve(dataset);
          },
          error: (error) => {
            reject(new Error(`Failed to parse CSV from URL: ${error.message}`));
          },
        });
      });
    } catch (error) {
      throw new Error(`Failed to load CSV from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse CSV file and create a Dataset
   */
  async parseCSV(
    file: File,
    userId: string,
    description: string = ''
  ): Promise<{ dataset: Dataset; errors: string[] }> {
    return new Promise((resolve, reject) => {
      const errors: string[] = [];

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              results.errors.forEach((error) => {
                errors.push(`Row ${error.row}: ${error.message}`);
              });
            }

            const data = results.data as DataPoint[];
            const columns = this.detectColumns(data);
            
            const dataset: Dataset = {
              id: crypto.randomUUID(),
              name: file.name.replace('.csv', ''),
              description,
              uploadedAt: new Date(),
              uploadedBy: userId,
              fileUrl: '', // Will be set after upload to Firebase Storage
              filePath: '', // Will be set after upload to Firebase Storage
              fileName: file.name,
              fileSize: file.size,
              rowCount: data.length,
              columnCount: columns.length,
              columns,
              data,
              tags: [],
            };

            resolve({ dataset, errors });
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        },
      });
    });
  }

  /**
   * Detect column types and calculate statistics
   */
  private detectColumns(data: DataPoint[]): DataColumn[] {
    if (data.length === 0) return [];

    const keys = Object.keys(data[0]);
    return keys.map((key) => {
      const values = data.map((row) => row[key]).filter((v) => v !== null && v !== undefined);
      const isNumeric = values.every((v) => typeof v === 'number' || !isNaN(Number(v)));
      
      const column: DataColumn = {
        key,
        name: key,
        type: isNumeric ? 'numeric' : 'text',
        stats: isNumeric ? this.calculateColumnStats(values.map(Number)) : null,
      };

      return column;
    });
  }

  /**
   * Calculate statistics for a numeric column
   */
  private calculateColumnStats(values: number[]): ColumnStatistics {
    const cleanValues = values.filter((v) => !isNaN(v) && isFinite(v));
    
    if (cleanValues.length === 0) {
      return {
        count: 0,
        nullCount: values.length,
        mean: 0,
        median: 0,
        std: 0,
        min: 0,
        max: 0,
      };
    }

    return {
      count: cleanValues.length,
      nullCount: values.length - cleanValues.length,
      mean: mean(cleanValues),
      median: median(cleanValues),
      std: standardDeviation(cleanValues),
      min: min(cleanValues),
      max: max(cleanValues),
    };
  }

  /**
   * Perform linear regression analysis
   */
  performLinearRegression(
    dataset: Dataset,
    xVariable: string,
    yVariable: string
  ): LinearRegressionResult {
    // Extract and clean data
    const points = dataset.data
      .map((row) => ({
        x: Number(row[xVariable]),
        y: Number(row[yVariable]),
      }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y));

    if (points.length < 2) {
      throw new Error('Insufficient data points for regression analysis (minimum 2 required)');
    }

    // Perform regression
    const xValues = points.map((p) => p.x);
    const yValues = points.map((p) => p.y);
    
    const regressionData = points.map((p) => [p.x, p.y] as [number, number]);
    const { m: slope, b: intercept } = linearRegression(regressionData);
    const predict = linearRegressionLine({ m: slope, b: intercept });

    // Calculate R-squared and correlation
    const correlation = sampleCorrelation(xValues, yValues);
    const rSquared = correlation * correlation;

    // Calculate predictions and residuals
    const predictions = points.map((p) => ({
      x: p.x,
      y: p.y,
      yPredicted: predict(p.x),
      residual: p.y - predict(p.x),
    }));

    const residuals = predictions.map((p) => p.residual);
    
    // Calculate standard error
    const sumSquaredResiduals = residuals.reduce((sum, r) => sum + r * r, 0);
    const standardError = Math.sqrt(sumSquaredResiduals / (points.length - 2));

    // Estimate p-value (simplified)
    const tStatistic = Math.abs(correlation * Math.sqrt(points.length - 2) / Math.sqrt(1 - rSquared));
    const pValue = this.estimatePValue(tStatistic, points.length - 2);

    // Determine significance
    let significanceLevel: 'highly_significant' | 'significant' | 'not_significant';
    if (pValue < 0.01) {
      significanceLevel = 'highly_significant';
    } else if (pValue < 0.05) {
      significanceLevel = 'significant';
    } else {
      significanceLevel = 'not_significant';
    }

    // Create equation string
    const equation = `y = ${slope.toFixed(4)}x ${intercept >= 0 ? '+' : ''} ${intercept.toFixed(4)}`;

    // Generate summary
    const summary = this.generateRegressionSummary(
      xVariable,
      yVariable,
      slope,
      intercept,
      rSquared,
      correlation,
      pValue,
      significanceLevel,
      points.length
    );

    return {
      type: 'linear_regression',
      equation,
      slope,
      intercept,
      rSquared,
      correlation,
      pValue,
      standardError,
      predictions,
      residuals,
      summary,
      significanceLevel,
    };
  }

  /**
   * Calculate descriptive statistics for specified variables
   */
  calculateDescriptiveStats(
    dataset: Dataset,
    variables: string[]
  ): DescriptiveStatsResult {
    const results = variables.map((varName) => {
      const values = dataset.data
        .map((row) => Number(row[varName]))
        .filter((v) => !isNaN(v) && isFinite(v));

      if (values.length === 0) {
        throw new Error(`No valid numeric data for variable: ${varName}`);
      }

      const sortedValues = [...values].sort((a, b) => a - b);
      const q1 = quantile(sortedValues, 0.25);
      const q3 = quantile(sortedValues, 0.75);
      const meanValue = mean(values);
      const medianValue = median(values);
      const stdValue = standardDeviation(values);

      return {
        name: varName,
        count: values.length,
        mean: meanValue,
        median: medianValue,
        std: stdValue,
        variance: variance(values),
        min: min(values),
        max: max(values),
        range: max(values) - min(values),
        q1,
        q3,
        iqr: q3 - q1,
      };
    });

    const summary = this.generateDescriptiveStatsSummary(results);

    return {
      type: 'descriptive_stats',
      variables: results,
      summary,
    };
  }

  /**
   * Calculate correlation matrix for multiple variables
   */
  calculateCorrelations(
    dataset: Dataset,
    variables: string[]
  ): CorrelationResult {
    const correlationMatrix: Array<{ var1: string; var2: string; correlation: number; pValue: number }> = [];
    const heatmapData: Array<{ x: string; y: string; value: number }> = [];
    const strongCorrelations: Array<{ pair: string; correlation: number; interpretation: string }> = [];

    for (let i = 0; i < variables.length; i++) {
      for (let j = i; j < variables.length; j++) {
        const var1 = variables[i];
        const var2 = variables[j];

        const values1 = dataset.data.map((row) => Number(row[var1])).filter((v) => !isNaN(v) && isFinite(v));
        const values2 = dataset.data.map((row) => Number(row[var2])).filter((v) => !isNaN(v) && isFinite(v));

        const minLength = Math.min(values1.length, values2.length);
        const correlation = i === j ? 1 : sampleCorrelation(values1.slice(0, minLength), values2.slice(0, minLength));
        
        // Simplified p-value estimation
        const tStat = Math.abs(correlation * Math.sqrt(minLength - 2) / Math.sqrt(1 - correlation * correlation));
        const pValue = this.estimatePValue(tStat, minLength - 2);

        correlationMatrix.push({ var1, var2, correlation, pValue });
        heatmapData.push({ x: var1, y: var2, value: correlation });

        // Identify strong correlations (excluding self-correlation)
        if (i !== j && Math.abs(correlation) > 0.7) {
          const interpretation = this.interpretCorrelation(correlation);
          strongCorrelations.push({
            pair: `${var1} vs ${var2}`,
            correlation,
            interpretation,
          });
        }
      }
    }

    const summary = this.generateCorrelationSummary(strongCorrelations);

    return {
      type: 'correlation',
      correlationMatrix,
      heatmapData,
      strongCorrelations,
      summary,
    };
  }

  /**
   * Validate dataset for analysis
   */
  validateDataset(dataset: Dataset, requiredColumns: string[]): DataValidationResult {
    const errors: DataValidationError[] = [];
    const warnings: DataValidationError[] = [];

    // Check for required columns
    requiredColumns.forEach((col) => {
      if (!dataset.columns.find((c) => c.key === col)) {
        errors.push({
          column: col,
          message: `Required column '${col}' not found in dataset`,
          severity: 'error',
        });
      }
    });

    // Check for missing values
    dataset.columns.forEach((col) => {
      if (col.type === 'numeric' && col.stats) {
        const missingPercent = (col.stats.nullCount / dataset.rowCount) * 100;
        if (missingPercent > 50) {
          warnings.push({
            column: col.key,
            message: `Column '${col.key}' has ${missingPercent.toFixed(1)}% missing values`,
            severity: 'warning',
          });
        }
      }
    });

    // Check for sufficient data
    if (dataset.rowCount < 10) {
      warnings.push({
        message: `Dataset has only ${dataset.rowCount} rows. Statistical analyses may not be reliable with small sample sizes.`,
        severity: 'warning',
      });
    }

    const isValid = errors.length === 0;
    const summary = `Validation ${isValid ? 'passed' : 'failed'}. ${errors.length} error(s), ${warnings.length} warning(s).`;

    return {
      isValid,
      errors,
      warnings,
      summary,
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Estimate p-value from t-statistic (simplified)
   */
  private estimatePValue(tStat: number): number {
    // Simplified p-value estimation
    // For more accurate results, use a proper t-distribution library
    if (tStat > 3.5) return 0.001;
    if (tStat > 2.5) return 0.01;
    if (tStat > 2.0) return 0.05;
    if (tStat > 1.5) return 0.1;
    return 0.2;
  }

  /**
   * Interpret correlation coefficient
   */
  private interpretCorrelation(r: number): string {
    const absR = Math.abs(r);
    const direction = r > 0 ? 'positive' : 'negative';
    
    if (absR >= 0.9) return `Very strong ${direction} correlation`;
    if (absR >= 0.7) return `Strong ${direction} correlation`;
    if (absR >= 0.5) return `Moderate ${direction} correlation`;
    if (absR >= 0.3) return `Weak ${direction} correlation`;
    return `Very weak ${direction} correlation`;
  }

  /**
   * Generate regression summary text
   */
  private generateRegressionSummary(
    xVar: string,
    yVar: string,
    slope: number,
    intercept: number,
    rSquared: number,
    correlation: number,
    pValue: number,
    significance: string,
    n: number
  ): string {
    const direction = slope > 0 ? 'positive' : 'negative';
    const strength = Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak';
    
    return `Linear regression analysis of ${yVar} vs ${xVar} (n=${n}) shows a ${strength} ${direction} relationship ` +
      `(r=${correlation.toFixed(3)}, R²=${rSquared.toFixed(3)}). ` +
      `For each unit increase in ${xVar}, ${yVar} ${slope > 0 ? 'increases' : 'decreases'} by ${Math.abs(slope).toFixed(4)} units. ` +
      `The model is ${significance.replace('_', ' ')} (p=${pValue < 0.001 ? '<0.001' : pValue.toFixed(3)}), ` +
      `explaining ${(rSquared * 100).toFixed(1)}% of the variance in ${yVar}.`;
  }

  /**
   * Generate descriptive statistics summary
   */
  private generateDescriptiveStatsSummary(
    results: Array<{ name: string; mean: number; std: number; min: number; max: number }>
  ): string {
    return `Descriptive statistics calculated for ${results.length} variable(s). ` +
      results.map((r) => `${r.name}: M=${r.mean.toFixed(2)}, SD=${r.std.toFixed(2)}, range=[${r.min.toFixed(2)}, ${r.max.toFixed(2)}]`).join('; ') + '.';
  }

  /**
   * Generate correlation summary
   */
  private generateCorrelationSummary(
    strongCorrelations: Array<{ pair: string; correlation: number; interpretation: string }>
  ): string {
    if (strongCorrelations.length === 0) {
      return 'No strong correlations (|r| > 0.7) detected between variables.';
    }
    return `Found ${strongCorrelations.length} strong correlation(s): ` +
      strongCorrelations.map((c) => `${c.pair} (r=${c.correlation.toFixed(3)}, ${c.interpretation})`).join('; ') + '.';
  }

  /**
   * Export dataset to CSV string
   */
  exportToCSV(dataset: Dataset): string {
    return Papa.unparse(dataset.data);
  }

  /**
   * Remove outliers using IQR method
   */
  removeOutliers(data: number[]): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return data.filter((v) => v >= lowerBound && v <= upperBound);
  }

  /**
   * Normalize data to 0-1 range
   */
  normalizeData(data: number[]): number[] {
    const minVal = min(data);
    const maxVal = max(data);
    const range = maxVal - minVal;
    
    if (range === 0) return data.map(() => 0);
    return data.map((v) => (v - minVal) / range);
  }

  /**
   * Calculate feature importance based on correlation with target
   */
  calculateFeatureImportance(
    dataset: Dataset,
    featureVariables: string[],
    targetVariable: string
  ): Array<{ feature: string; importance: number }> {
    // First, encode target variable if categorical
    const uniqueTargetValues = Array.from(new Set(dataset.data.map((row) => row[targetVariable])));
    const isCategorical = uniqueTargetValues.some((v) => typeof v === 'string');
    
    // Create encoding map for categorical variables (e.g., M=1, B=0)
    const targetEncoding = new Map(uniqueTargetValues.map((val, idx) => [String(val), idx]));
    
    return featureVariables
      .map((feature) => {
        // Build aligned arrays (same indices for feature and target)
        const alignedPairs: Array<{ feature: number; target: number }> = [];
        
        for (let i = 0; i < dataset.data.length; i++) {
          const row = dataset.data[i];
          const featureVal = Number(row[feature]);
          
          // Handle categorical or numeric target
          let targetVal: number;
          if (isCategorical) {
            const rawTarget = row[targetVariable];
            targetVal = targetEncoding.get(String(rawTarget)) ?? NaN;
          } else {
            targetVal = Number(row[targetVariable]);
          }
          
          // Only include if both values are valid
          if (!isNaN(featureVal) && isFinite(featureVal) && !isNaN(targetVal) && isFinite(targetVal)) {
            alignedPairs.push({ feature: featureVal, target: targetVal });
          }
        }
        
        // Calculate correlation if we have enough data
        if (alignedPairs.length < 2) {
          return { feature, importance: 0 };
        }
        
        const featureValues = alignedPairs.map((p) => p.feature);
        const targetValues = alignedPairs.map((p) => p.target);
        
        const correlation = Math.abs(sampleCorrelation(featureValues, targetValues));

        return {
          feature,
          importance: correlation,
        };
      })
      .sort((a, b) => b.importance - a.importance);
  }

  /**
   * Perform K-Fold Cross-Validation for regression
   */
  performCrossValidation(
    data: DataPoint[],
    featureVariable: string,
    targetVariable: string,
    kFolds: number = 5
  ): { folds: number; scores: number[]; meanScore: number; stdScore: number } {
    const n = data.length;
    const foldSize = Math.floor(n / kFolds);
    const scores: number[] = [];

    for (let fold = 0; fold < kFolds; fold++) {
      // Split into train and validation for this fold
      const validationStart = fold * foldSize;
      const validationEnd = (fold + 1) * foldSize;
      
      const validationData = data.slice(validationStart, validationEnd);
      const trainData = [...data.slice(0, validationStart), ...data.slice(validationEnd)];

      // Extract and clean training data
      const trainPoints = trainData
        .map((row) => [Number(row[featureVariable]), Number(row[targetVariable])])
        .filter((p) => !isNaN(p[0]) && !isNaN(p[1]) && isFinite(p[0]) && isFinite(p[1])) as [number, number][];

      if (trainPoints.length < 2) continue;

      // Train model on this fold
      const { m: slope, b: intercept } = linearRegression(trainPoints);
      const predict = linearRegressionLine({ m: slope, b: intercept });

      // Evaluate on validation set
      const validationPoints = validationData
        .map((row) => ({
          x: Number(row[featureVariable]),
          y: Number(row[targetVariable]),
        }))
        .filter((p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y));

      if (validationPoints.length === 0) continue;

      // Calculate R² for this fold
      const predictions = validationPoints.map((p) => predict(p.x));
      const actual = validationPoints.map((p) => p.y);
      const meanActual = mean(actual);

      const ss_res = actual.reduce((sum, val, i) => sum + Math.pow(val - predictions[i], 2), 0);
      const ss_tot = actual.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
      const r2 = 1 - ss_res / ss_tot;

      scores.push(r2);
    }

    return {
      folds: kFolds,
      scores,
      meanScore: scores.length > 0 ? mean(scores) : 0,
      stdScore: scores.length > 1 ? standardDeviation(scores) : 0,
    };
  }

  // ============================================================================
  // Machine Learning Methods
  // ============================================================================

  /**
   * Split dataset into training and testing sets
   */
  trainTestSplit(
    dataset: Dataset,
    options: {
      splitRatio?: number;
      randomSeed?: number;
      stratify?: boolean;
      targetVariable?: string;
    } = {}
  ): {
    training: DataPoint[];
    testing: DataPoint[];
    trainingIndices: number[];
    testingIndices: number[];
  } {
    const { splitRatio = 0.8, randomSeed } = options;
    const data = dataset.data;
    const n = data.length;
    const trainSize = Math.floor(n * splitRatio);

    // Generate indices
    const indices = Array.from({ length: n }, (_, i) => i);

    // Simple shuffle with optional seed
    if (randomSeed !== undefined) {
      // Seeded random for reproducibility
      let seed = randomSeed;
      const seededRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
    } else {
      // Regular shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
    }

    // TODO: Implement stratified splitting for classification
    // For now, use simple random split

    const trainingIndices = indices.slice(0, trainSize);
    const testingIndices = indices.slice(trainSize);

    return {
      training: trainingIndices.map((i) => data[i]),
      testing: testingIndices.map((i) => data[i]),
      trainingIndices,
      testingIndices,
    };
  }

  /**
   * Perform ML Classification
   * Simple implementation using logistic regression for binary classification
   */
  performMLClassification(
    dataset: Dataset,
    featureVariables: string[],
    targetVariable: string,
    options: AnalysisOptions = {}
  ): MLClassificationResult {
    const { splitRatio = 0.8, randomSeed, mlAlgorithm = 'logistic' } = options;

    // Split data
    const split = this.trainTestSplit(dataset, {
      splitRatio,
      randomSeed,
      stratify: true,
      targetVariable,
    });

    // Extract features and labels
    const extractFeaturesAndLabels = (data: DataPoint[]) => {
      const features: number[][] = [];
      const labels: (string | number)[] = [];

      for (const row of data) {
        const feature: number[] = [];
        let hasNull = false;

        for (const varName of featureVariables) {
          const val = row[varName];
          if (val === null || val === undefined) {
            hasNull = true;
            break;
          }
          feature.push(typeof val === 'number' ? val : parseFloat(String(val)));
        }

        const label = row[targetVariable];
        if (!hasNull && label !== null && label !== undefined) {
          features.push(feature);
          labels.push(label);
        }
      }

      return { features, labels };
    };

    const trainData = extractFeaturesAndLabels(split.training);
    const testData = extractFeaturesAndLabels(split.testing);

    // Get unique classes
    const uniqueClasses = Array.from(new Set([...trainData.labels, ...testData.labels]));
    const classToIndex = new Map(uniqueClasses.map((c, i) => [String(c), i]));
    const indexToClass = new Map(uniqueClasses.map((c, i) => [i, String(c)]));

    // Declare predictions variables
    let trainPredictions: string[];
    let testPredictions: string[];

    // For binary classification, use simple logistic regression with gradient descent
    if (uniqueClasses.length === 2) {
      // Encode labels as 0 and 1
      const trainY = trainData.labels.map((label) => (classToIndex.get(String(label)) || 0));
      
      // Normalize features for better convergence
      const normalizeFeatures = (features: number[][]): { normalized: number[][]; means: number[]; stds: number[] } => {
        const numFeatures = features[0].length;
        const means: number[] = [];
        const stds: number[] = [];
        
        for (let f = 0; f < numFeatures; f++) {
          const values = features.map((row) => row[f]);
          const meanVal = mean(values);
          const stdVal = standardDeviation(values);
          means.push(meanVal);
          stds.push(stdVal || 1); // Avoid division by zero
        }
        
        const normalized = features.map((row) =>
          row.map((val, f) => (val - means[f]) / stds[f])
        );
        
        return { normalized, means, stds };
      };
      
      const { normalized: trainX, means: featureMeans, stds: featureStds } = normalizeFeatures(trainData.features);
      const testX = testData.features.map((row) =>
        row.map((val, f) => (val - featureMeans[f]) / featureStds[f])
      );
      
      // Train logistic regression using gradient descent
      const trainLogisticRegression = (X: number[][], y: number[], iterations = 1000, learningRate = 0.1) => {
        const numFeatures = X[0].length;
        const weights = Array(numFeatures).fill(0);
        let bias = 0;
        
        const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
        
        for (let iter = 0; iter < iterations; iter++) {
          // Calculate predictions
          const predictions = X.map((x) => {
            const z = x.reduce((sum, val, i) => sum + val * weights[i], 0) + bias;
            return sigmoid(z);
          });
          
          // Calculate gradients
          const dWeights = Array(numFeatures).fill(0);
          let dBias = 0;
          
          for (let i = 0; i < X.length; i++) {
            const error = predictions[i] - y[i];
            for (let j = 0; j < numFeatures; j++) {
              dWeights[j] += error * X[i][j];
            }
            dBias += error;
          }
          
          // Update weights
          for (let j = 0; j < numFeatures; j++) {
            weights[j] -= (learningRate / X.length) * dWeights[j];
          }
          bias -= (learningRate / X.length) * dBias;
        }
        
        return { weights, bias };
      };
      
      const { weights, bias } = trainLogisticRegression(trainX, trainY);
      
      // Make predictions
      const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
      const predict = (x: number[]) => {
        const z = x.reduce((sum, val, i) => sum + val * weights[i], 0) + bias;
        const prob = sigmoid(z);
        return prob >= 0.5 ? 1 : 0;
      };
      
      trainPredictions = trainX.map((x) => indexToClass.get(predict(x)) || uniqueClasses[0]);
      testPredictions = testX.map((x) => indexToClass.get(predict(x)) || uniqueClasses[0]);
    } else {
      // Fallback to majority class for multi-class (>2 classes)
      const classCounts = new Map<string, number>();
      trainData.labels.forEach((label) => {
        const key = String(label);
        classCounts.set(key, (classCounts.get(key) || 0) + 1);
      });

      const majorityClass = Array.from(classCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
      trainPredictions = trainData.labels.map(() => majorityClass);
      testPredictions = testData.labels.map(() => majorityClass);
    }

    // Calculate metrics
    const calculateMetrics = (actual: (string | number)[], predicted: string[]) => {
      const n = actual.length;
      let correct = 0;
      const confusionMatrix = Array(uniqueClasses.length)
        .fill(0)
        .map(() => Array(uniqueClasses.length).fill(0));

      for (let i = 0; i < n; i++) {
        const actualClass = String(actual[i]);
        const predClass = predicted[i];
        const actualIdx = classToIndex.get(actualClass) || 0;
        const predIdx = classToIndex.get(predClass) || 0;

        confusionMatrix[actualIdx][predIdx]++;
        if (actualClass === predClass) correct++;
      }

      const accuracy = correct / n;

      // Calculate per-class metrics
      const classReport = uniqueClasses.map((cls, idx) => {
        const tp = confusionMatrix[idx][idx];
        const fp = confusionMatrix.reduce((sum, row, i) => (i !== idx ? sum + row[idx] : sum), 0);
        const fn = confusionMatrix[idx].reduce((sum, val, i) => (i !== idx ? sum + val : sum), 0);
        const support = confusionMatrix[idx].reduce((sum, val) => sum + val, 0);

        const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
        const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
        const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

        return {
          class: String(cls),
          precision,
          recall,
          f1Score: f1,
          support,
        };
      });

      // Weighted averages
      const totalSupport = classReport.reduce((sum, r) => sum + r.support, 0);
      const precision = classReport.reduce((sum, r) => sum + r.precision * r.support, 0) / totalSupport;
      const recall = classReport.reduce((sum, r) => sum + r.recall * r.support, 0) / totalSupport;
      const f1Score = classReport.reduce((sum, r) => sum + r.f1Score * r.support, 0) / totalSupport;

      return { accuracy, precision, recall, f1Score, confusionMatrix, classReport };
    };

    const testMetrics = calculateMetrics(testData.labels, testPredictions);

    // Calculate feature importance
    const featureImportance = this.calculateFeatureImportance(dataset, featureVariables, targetVariable);

    const result: MLClassificationResult = {
      type: 'ml_classification',
      algorithm: uniqueClasses.length === 2 
        ? 'Logistic Regression (Gradient Descent)'
        : mlAlgorithm === 'logistic' ? 'Logistic Regression (Baseline)' : 'Decision Tree',
      trainingSize: trainData.labels.length,
      testSize: testData.labels.length,
      splitRatio,
      accuracy: testMetrics.accuracy,
      precision: testMetrics.precision,
      recall: testMetrics.recall,
      f1Score: testMetrics.f1Score,
      confusionMatrix: {
        matrix: testMetrics.confusionMatrix,
        labels: uniqueClasses.map(String),
      },
      classificationReport: testMetrics.classReport,
      featureImportance,
      predictions: {
        training: trainData.labels.map((actual, i) => ({
          actual,
          predicted: trainPredictions[i],
        })),
        testing: testData.labels.map((actual, i) => ({
          actual,
          predicted: testPredictions[i],
        })),
      },
      summary: uniqueClasses.length === 2
        ? `Trained logistic regression classifier with gradient descent (1000 iterations) on ${trainData.labels.length} samples (${(splitRatio * 100).toFixed(0)}% split). Test accuracy: ${(testMetrics.accuracy * 100).toFixed(2)}%. Model uses normalized features and sigmoid activation for binary classification.`
        : `Trained ${mlAlgorithm} model on ${trainData.labels.length} samples (${(splitRatio * 100).toFixed(0)}% split). Test accuracy: ${(testMetrics.accuracy * 100).toFixed(2)}%. This is a baseline implementation - for production use, integrate with TensorFlow.js or ml.js for advanced algorithms.`,
      recommendations: [
        testMetrics.accuracy < 0.6 
          ? '⚠️ Low accuracy - consider more features or different algorithm' 
          : testMetrics.accuracy > 0.9
          ? '🎉 Excellent accuracy! Model performs very well.'
          : '✓ Good accuracy - model is performing well',
        featureImportance.length > 0
          ? `Top feature: ${featureImportance[0].feature} (importance: ${featureImportance[0].importance.toFixed(3)})`
          : '',
        testMetrics.accuracy > 0.85 && testMetrics.recall < 0.8
          ? '⚠️ Low recall - model is missing positive cases. Consider class balancing.'
          : '',
        testMetrics.accuracy > 0.85 && testMetrics.precision < 0.8
          ? '⚠️ Low precision - model has many false positives. Consider adjusting threshold.'
          : '',
        'Try different feature combinations to optimize performance',
        uniqueClasses.length === 2 ? 'Model uses gradient descent with 1000 iterations' : 'Consider enabling cross-validation for more robust evaluation',
      ].filter(Boolean),
    };

    return result;
  }

  /**
   * Perform ML Regression with train/test split
   */
  performMLRegression(
    dataset: Dataset,
    featureVariables: string[],
    targetVariable: string,
    options: AnalysisOptions = {}
  ): MLRegressionResult {
    const { splitRatio = 0.8, randomSeed, crossValidationFolds } = options;

    // Split data
    const split = this.trainTestSplit(dataset, { splitRatio, randomSeed });

    // Helper to calculate R², MSE, RMSE, MAE
    const evaluateRegression = (actual: number[], predicted: number[]) => {
      const n = actual.length;
      const meanActual = mean(actual);

      const ss_res = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
      const ss_tot = actual.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);

      const rSquared = 1 - ss_res / ss_tot;
      const mse = ss_res / n;
      const rmse = Math.sqrt(mse);
      const mae = actual.reduce((sum, val, i) => sum + Math.abs(val - predicted[i]), 0) / n;

      return { rSquared, mse, rmse, mae };
    };

    // Extract features and target (ALL features, not just first one!)
    const extractFeaturesAndTarget = (data: DataPoint[]) => {
      const X: number[][] = [];
      const y: number[] = [];

      for (const row of data) {
        const features: number[] = [];
        let hasNull = false;

        // Extract ALL feature variables
        for (const varName of featureVariables) {
          const val = row[varName];
          if (val === null || val === undefined) {
            hasNull = true;
            break;
          }
          features.push(typeof val === 'number' ? val : parseFloat(String(val)));
        }

        const target = row[targetVariable];
        if (!hasNull && target !== null && target !== undefined) {
          X.push(features);
          y.push(typeof target === 'number' ? target : parseFloat(String(target)));
        }
      }

      return { X, y };
    };

    const trainData = extractFeaturesAndTarget(split.training);
    const testData = extractFeaturesAndTarget(split.testing);

    // Multivariate Linear Regression using Normal Equation
    // β = (X^T X)^(-1) X^T y
    const trainMultivariateRegression = (X: number[][], y: number[]) => {
      const n = X.length;
      const m = X[0].length;

      // Add intercept column (column of 1s) to X
      const X_with_intercept = X.map(row => [1, ...row]);

      // X^T (transpose)
      const XT: number[][] = [];
      for (let j = 0; j < m + 1; j++) {
        const col: number[] = [];
        for (let i = 0; i < n; i++) {
          col.push(X_with_intercept[i][j]);
        }
        XT.push(col);
      }

      // X^T * X
      const XTX: number[][] = [];
      for (let i = 0; i < m + 1; i++) {
        const row: number[] = [];
        for (let j = 0; j < m + 1; j++) {
          let sum = 0;
          for (let k = 0; k < n; k++) {
            sum += XT[i][k] * XT[j][k];
          }
          row.push(sum);
        }
        XTX.push(row);
      }

      // X^T * y
      const XTy: number[] = [];
      for (let i = 0; i < m + 1; i++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += XT[i][k] * y[k];
        }
        XTy.push(sum);
      }

      // Solve (X^T X) β = X^T y using Gaussian elimination
      const coefficients = this.solveLinearSystem(XTX, XTy);

      return {
        intercept: coefficients[0],
        weights: coefficients.slice(1),
      };
    };

    // Train model
    const model = trainMultivariateRegression(trainData.X, trainData.y);

    // Prediction function
    const predict = (X: number[][]) => {
      return X.map(features => {
        let prediction = model.intercept;
        for (let i = 0; i < features.length; i++) {
          prediction += model.weights[i] * features[i];
        }
        return prediction;
      });
    };

    // Evaluate on training set
    const trainPredicted = predict(trainData.X);
    const trainMetrics = evaluateRegression(trainData.y, trainPredicted);

    // Evaluate on test set
    const testPredicted = predict(testData.X);
    const testMetrics = evaluateRegression(testData.y, testPredicted);

    // Calculate feature importance
    const featureImportance = this.calculateFeatureImportance(dataset, featureVariables, targetVariable);

    // Perform cross-validation if requested (multivariate version)
    let crossValidation;
    if (crossValidationFolds && crossValidationFolds > 1) {
      crossValidation = this.performMultivariateCrossValidation(
        dataset.data,
        featureVariables,
        targetVariable,
        crossValidationFolds
      );
    }

    // Determine algorithm name based on number of features
    const algorithmName = featureVariables.length === 1 
      ? 'Linear Regression (Univariate)'
      : `Multivariate Linear Regression (${featureVariables.length} features)`;

    const result: MLRegressionResult = {
      type: 'ml_regression',
      algorithm: algorithmName,
      trainingSize: trainData.y.length,
      testSize: testData.y.length,
      splitRatio,
      rSquared: {
        training: trainMetrics.rSquared,
        testing: testMetrics.rSquared,
      },
      mse: {
        training: trainMetrics.mse,
        testing: testMetrics.mse,
      },
      rmse: {
        training: trainMetrics.rmse,
        testing: testMetrics.rmse,
      },
      mae: {
        training: trainMetrics.mae,
        testing: testMetrics.mae,
      },
      featureImportance,
      predictions: {
        training: trainData.y.map((actual, i) => ({
          actual,
          predicted: trainPredicted[i],
          residual: actual - trainPredicted[i],
        })),
        testing: testData.y.map((actual, i) => ({
          actual,
          predicted: testPredicted[i],
          residual: actual - testPredicted[i],
        })),
      },
      residualPlots: {
        training: trainPredicted.map((pred, i) => ({
          predicted: pred,
          residual: trainData.y[i] - pred,
        })),
        testing: testPredicted.map((pred, i) => ({
          predicted: pred,
          residual: testData.y[i] - pred,
        })),
      },
      crossValidation,
      summary: `${algorithmName} trained on ${trainData.y.length} samples (${(splitRatio * 100).toFixed(0)}% split). Training R²: ${trainMetrics.rSquared.toFixed(4)}, Test R²: ${testMetrics.rSquared.toFixed(4)}. ${Math.abs(trainMetrics.rSquared - testMetrics.rSquared) > 0.1 ? 'Significant difference between training and test performance may indicate overfitting.' : 'Model generalizes well to test data.'}${crossValidation ? ` Cross-validation (${crossValidation.folds}-fold): Mean R² = ${crossValidation.meanScore.toFixed(4)} ± ${crossValidation.stdScore.toFixed(4)}` : ''}`,
      recommendations: [
        testMetrics.rSquared < 0.5
          ? '⚠️ Low R² - model may not fit data well. Consider polynomial features or different model.'
          : '✓ Model explains a good portion of variance',
        Math.abs(trainMetrics.rSquared - testMetrics.rSquared) > 0.2
          ? '⚠️ Large train/test gap suggests overfitting'
          : '✓ Model generalizes well',
        crossValidation && crossValidation.stdScore > 0.1
          ? '⚠️ High CV variance suggests unstable model'
          : crossValidation
          ? '✓ Cross-validation shows consistent performance'
          : 'Consider enabling cross-validation for more robust evaluation',
        'Visualize residual plots to check for patterns',
        featureImportance.length > 1
          ? `Top feature: ${featureImportance[0].feature} (importance: ${featureImportance[0].importance.toFixed(3)})`
          : '',
      ].filter(Boolean),
    };

    return result;
  }

  /**
   * Helper function to solve linear system Ax = b using Gaussian elimination
   */
  private solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;
    const augmented: number[][] = A.map((row, i) => [...row, b[i]]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Make all rows below this one 0 in current column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Back substitution
    const x: number[] = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j];
      }
      x[i] /= augmented[i][i];
    }

    return x;
  }

  /**
   * Perform K-Fold Cross-Validation for multivariate regression
   */
  private performMultivariateCrossValidation(
    data: DataPoint[],
    featureVariables: string[],
    targetVariable: string,
    kFolds: number = 5
  ): { folds: number; scores: number[]; meanScore: number; stdScore: number } {
    // Extract all valid data points
    const validData: Array<{ features: number[]; target: number }> = [];
    
    for (const row of data) {
      const features: number[] = [];
      let hasNull = false;

      for (const varName of featureVariables) {
        const val = row[varName];
        if (val === null || val === undefined) {
          hasNull = true;
          break;
        }
        const numVal = typeof val === 'number' ? val : parseFloat(String(val));
        if (isNaN(numVal) || !isFinite(numVal)) {
          hasNull = true;
          break;
        }
        features.push(numVal);
      }

      const target = row[targetVariable];
      if (!hasNull && target !== null && target !== undefined) {
        const numTarget = typeof target === 'number' ? target : parseFloat(String(target));
        if (!isNaN(numTarget) && isFinite(numTarget)) {
          validData.push({ features, target: numTarget });
        }
      }
    }

    const n = validData.length;
    const foldSize = Math.floor(n / kFolds);
    const scores: number[] = [];

    for (let fold = 0; fold < kFolds; fold++) {
      const testStart = fold * foldSize;
      const testEnd = fold === kFolds - 1 ? n : testStart + foldSize;

      const trainData = validData.filter((_, i) => i < testStart || i >= testEnd);
      const testData = validData.slice(testStart, testEnd);

      if (trainData.length < 2 || testData.length < 1) continue;

      // Train multivariate model
      const trainX = trainData.map(d => d.features);
      const trainY = trainData.map(d => d.target);

      // Add intercept and solve normal equation
      const X_with_intercept = trainX.map(row => [1, ...row]);
      const m = trainX[0].length;
      
      // X^T
      const XT: number[][] = [];
      for (let j = 0; j < m + 1; j++) {
        const col: number[] = [];
        for (let i = 0; i < trainX.length; i++) {
          col.push(X_with_intercept[i][j]);
        }
        XT.push(col);
      }

      // X^T * X
      const XTX: number[][] = [];
      for (let i = 0; i < m + 1; i++) {
        const row: number[] = [];
        for (let j = 0; j < m + 1; j++) {
          let sum = 0;
          for (let k = 0; k < trainX.length; k++) {
            sum += XT[i][k] * XT[j][k];
          }
          row.push(sum);
        }
        XTX.push(row);
      }

      // X^T * y
      const XTy: number[] = [];
      for (let i = 0; i < m + 1; i++) {
        let sum = 0;
        for (let k = 0; k < trainX.length; k++) {
          sum += XT[i][k] * trainY[k];
        }
        XTy.push(sum);
      }

      // Solve for coefficients
      const coefficients = this.solveLinearSystem(XTX, XTy);
      const intercept = coefficients[0];
      const weights = coefficients.slice(1);

      // Test on fold
      const testX = testData.map(d => d.features);
      const testY = testData.map(d => d.target);

      const predictions = testX.map(features => {
        let pred = intercept;
        for (let i = 0; i < features.length; i++) {
          pred += weights[i] * features[i];
        }
        return pred;
      });

      // Calculate R² for this fold
      const meanY = mean(testY);
      const ss_res = testY.reduce((sum, val, i) => sum + Math.pow(val - predictions[i], 2), 0);
      const ss_tot = testY.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
      const rSquared = 1 - ss_res / ss_tot;

      scores.push(rSquared);
    }

    const meanScore = mean(scores);
    const stdScore = standardDeviation(scores);

    return {
      folds: kFolds,
      scores,
      meanScore,
      stdScore,
    };
  }
}

export const dataAnalysisService = new DataAnalysisService();
