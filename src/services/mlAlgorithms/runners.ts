// src/services/mlAlgorithms/runners.ts

/**
 * Algorithm runners - bridge between ml.js and our data analysis service.
 * Handles data format conversion, train/predict flow, and metric computation.
 */

import {
  DecisionTreeClassifier,
  DecisionTreeRegression,
  RandomForestClassifier,
  RandomForestRegression,
  KNN,
  KMeans,
} from 'ml';
import type {
  MLClassificationAlgorithm,
  MLRegressionAlgorithm,
  DecisionTreeOptions,
  RandomForestOptions,
  KNNOptions,
  KMeansOptions,
} from './types';

// ---------------------------------------------------------------------------
// Data extraction helpers (pure, reusable)
// ---------------------------------------------------------------------------

export interface ExtractedData {
  X: number[][];
  y: (string | number)[];
  classLabels?: string[];
}

/**
 * Extract feature matrix X and target vector y from dataset rows.
 * Filters out rows with missing/invalid values.
 */
export function extractFeaturesAndTarget(
  data: Array<Record<string, string | number | null>>,
  featureKeys: string[],
  targetKey: string,
  isClassification: boolean
): ExtractedData {
  const X: number[][] = [];
  const y: (string | number)[] = [];
  const classLabelsSet = new Set<string>();

  for (const row of data) {
    const features: number[] = [];
    let hasInvalid = false;

    for (const key of featureKeys) {
      const val = row[key];
      const num = typeof val === 'number' ? val : parseFloat(String(val ?? ''));
      if (val === null || val === undefined || isNaN(num) || !isFinite(num)) {
        hasInvalid = true;
        break;
      }
      features.push(num);
    }

    const target = row[targetKey];
    if (hasInvalid || target === null || target === undefined) continue;

    if (isClassification) {
      const label = String(target);
      classLabelsSet.add(label);
      X.push(features);
      y.push(label);
    } else {
      const numTarget = typeof target === 'number' ? target : parseFloat(String(target));
      if (isNaN(numTarget) || !isFinite(numTarget)) continue;
      X.push(features);
      y.push(numTarget);
    }
  }

  return {
    X,
    y,
    classLabels: isClassification ? Array.from(classLabelsSet) : undefined,
  };
}

/**
 * Extract feature matrix only (for clustering - no target).
 */
export function extractFeatures(
  data: Array<Record<string, string | number | null>>,
  featureKeys: string[]
): number[][] {
  const X: number[][] = [];

  for (const row of data) {
    const features: number[] = [];
    let hasInvalid = false;

    for (const key of featureKeys) {
      const val = row[key];
      const num = typeof val === 'number' ? val : parseFloat(String(val ?? ''));
      if (val === null || val === undefined || isNaN(num) || !isFinite(num)) {
        hasInvalid = true;
        break;
      }
      features.push(num);
    }

    if (!hasInvalid) X.push(features);
  }

  return X;
}

// ---------------------------------------------------------------------------
// Classification runners
// ---------------------------------------------------------------------------

export interface ClassificationResult {
  trainPredictions: (string | number)[];
  testPredictions: (string | number)[];
  classLabels: string[];
}

/**
 * Run classification with the specified algorithm.
 */
export function runClassification(
  algorithm: MLClassificationAlgorithm,
  trainX: number[][],
  trainY: (string | number)[],
  testX: number[][],
  classLabels: string[],
  options?: DecisionTreeOptions | RandomForestOptions | KNNOptions
): ClassificationResult {
  const labelToIndex = new Map(classLabels.map((l, i) => [l, i]));
  const indexToLabel = new Map(classLabels.map((l, i) => [i, l]));
  const trainYEncoded = trainY.map((l) => labelToIndex.get(String(l)) ?? 0);

  let trainPredEncoded: number[];
  let testPredEncoded: number[];

  switch (algorithm) {
    case 'decision_tree': {
      const opts = options as DecisionTreeOptions | undefined;
      const model = new DecisionTreeClassifier({
        maxDepth: opts?.maxDepth ?? 10,
        minNumSamples: opts?.minNumSamples ?? 3,
      });
      model.train(trainX, trainYEncoded);
      trainPredEncoded = model.predict(trainX);
      testPredEncoded = model.predict(testX);
      break;
    }
    case 'random_forest': {
      const opts = options as RandomForestOptions | undefined;
      const model = new RandomForestClassifier({
        nEstimators: opts?.nEstimators ?? 50,
        seed: opts?.seed ?? 42,
        treeOptions: { maxDepth: opts?.maxDepth ?? 10 },
      });
      model.train(trainX, trainYEncoded);
      trainPredEncoded = model.predict(trainX);
      testPredEncoded = model.predict(testX);
      break;
    }
    case 'knn': {
      const opts = options as KNNOptions | undefined;
      const k = opts?.k ?? Math.min(classLabels.length + 1, Math.floor(Math.sqrt(trainX.length)));
      const model = new KNN(trainX, trainYEncoded, { k });
      trainPredEncoded = model.predict(trainX);
      testPredEncoded = model.predict(testX);
      break;
    }
    case 'logistic':
      // Logistic is handled by dataAnalysisService (existing implementation)
      throw new Error('Logistic regression should be handled by dataAnalysisService');
    default:
      throw new Error(`Unsupported classification algorithm: ${algorithm}`);
  }

  const decode = (idx: number) => indexToLabel.get(idx) ?? classLabels[0];
  return {
    trainPredictions: trainPredEncoded.map(decode),
    testPredictions: testPredEncoded.map(decode),
    classLabels,
  };
}

// ---------------------------------------------------------------------------
// Regression runners
// ---------------------------------------------------------------------------

export interface RegressionResult {
  trainPredictions: number[];
  testPredictions: number[];
}

/**
 * Run regression with the specified algorithm.
 */
export function runRegression(
  algorithm: MLRegressionAlgorithm,
  trainX: number[][],
  trainY: number[],
  testX: number[][],
  options?: DecisionTreeOptions | RandomForestOptions | KNNOptions
): RegressionResult {
  let trainPred: number[];
  let testPred: number[];

  switch (algorithm) {
    case 'decision_tree': {
      const opts = options as DecisionTreeOptions | undefined;
      const model = new DecisionTreeRegression({
        maxDepth: opts?.maxDepth ?? 10,
        minNumSamples: opts?.minNumSamples ?? 3,
      });
      model.train(trainX, trainY);
      trainPred = model.predict(trainX);
      testPred = model.predict(testX);
      break;
    }
    case 'random_forest': {
      const opts = options as RandomForestOptions | undefined;
      const model = new RandomForestRegression({
        nEstimators: opts?.nEstimators ?? 50,
        seed: opts?.seed ?? 42,
        treeOptions: { maxDepth: opts?.maxDepth ?? 10 },
      });
      model.train(trainX, trainY);
      trainPred = model.predict(trainX);
      testPred = model.predict(testX);
      break;
    }
    case 'knn': {
      const opts = options as KNNOptions | undefined;
      const k = opts?.k ?? Math.max(1, Math.floor(Math.sqrt(trainX.length)));
      trainPred = knnRegressionPredict(trainX, trainY, trainX, k);
      testPred = knnRegressionPredict(trainX, trainY, testX, k);
      break;
    }
    case 'linear':
      throw new Error('Linear regression should be handled by dataAnalysisService');
    default:
      throw new Error(`Unsupported regression algorithm: ${algorithm}`);
  }

  return { trainPredictions: trainPred, testPredictions: testPred };
}

/**
 * KNN regression: predict as mean of k nearest neighbors' target values.
 */
function knnRegressionPredict(
  trainX: number[][],
  trainY: number[],
  testX: number[][],
  k: number
): number[] {
  const n = testX.length;
  const predictions: number[] = new Array(n);

  for (let i = 0; i < n; i++) {
    const point = testX[i];
    const distances = trainX.map((trainPoint, j) => ({
      dist: euclideanDistance(point, trainPoint),
      y: trainY[j],
    }));
    distances.sort((a, b) => a.dist - b.dist);
    const kNearest = distances.slice(0, k);
    const sum = kNearest.reduce((s, d) => s + d.y, 0);
    predictions[i] = sum / kNearest.length;
  }

  return predictions;
}

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

// ---------------------------------------------------------------------------
// Clustering runners
// ---------------------------------------------------------------------------

export interface ClusteringResult {
  clusterIds: number[];
  centroids: number[][];
  iterations: number;
}

/**
 * Run K-Means clustering.
 */
export function runClustering(
  X: number[][],
  options: KMeansOptions
): ClusteringResult {
  const { k, maxIterations = 100, seed } = options;

  if (X.length < k) {
    throw new Error(`Not enough data points (${X.length}) for ${k} clusters. Need at least ${k} points.`);
  }

  const result = KMeans.kmeans(X, k, {
    maxIterations,
    seed,
    initialization: 'kmeans++',
  });

  return {
    clusterIds: result.clusters,
    centroids: result.centroids,
    iterations: result.iterations,
  };
}
