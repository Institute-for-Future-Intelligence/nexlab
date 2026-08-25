// src/services/mlAlgorithms/types.ts

/**
 * Shared types for ml.js algorithm wrappers.
 * Keeps algorithm-specific types separate from core data analysis types.
 */

/** Supported ML algorithms for classification */
export type MLClassificationAlgorithm = 'logistic' | 'decision_tree' | 'random_forest' | 'knn';

/** Supported ML algorithms for regression */
export type MLRegressionAlgorithm = 'linear' | 'decision_tree' | 'random_forest' | 'knn';

/** Options for Decision Tree (classification & regression) */
export interface DecisionTreeOptions {
  maxDepth?: number;
  minNumSamples?: number;
}

/** Options for Random Forest */
export interface RandomForestOptions {
  nEstimators?: number;
  maxDepth?: number;
  seed?: number;
}

/** Options for K-Nearest Neighbors */
export interface KNNOptions {
  k?: number;
}

/** Options for K-Means clustering */
export interface KMeansOptions {
  k: number;
  maxIterations?: number;
  seed?: number;
}
