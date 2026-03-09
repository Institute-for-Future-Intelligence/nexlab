// src/services/mlAlgorithms/index.ts

/**
 * ML.js algorithm wrappers for Data Analysis.
 * Modular, efficient wrappers around ml.js for classification, regression, and clustering.
 *
 * Each module is lazy-loaded only when the algorithm is selected to minimize bundle impact.
 */

export type {
  MLClassificationAlgorithm,
  MLRegressionAlgorithm,
  DecisionTreeOptions,
  RandomForestOptions,
  KNNOptions,
  KMeansOptions,
} from './types';

export {
  runClassification,
  runRegression,
  runClustering,
  extractFeatures,
} from './runners';
