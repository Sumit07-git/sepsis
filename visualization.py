"""
Sepsis Early Prediction System - Visualization Module
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA
import warnings
warnings.filterwarnings('ignore')

class SepsisVisualizer:
    def __init__(self, style='seaborn-v0_8-darkgrid'):
        plt.style.use('default')
        sns.set_palette("husl")
        self.colors = {'sepsis': '#e74c3c', 'non_sepsis': '#3498db'}
    
    def plot_class_distribution(self, y, save_path='static/plots/class_distribution.png'):
        """Plot sepsis vs non-sepsis distribution"""
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))
        
        # Count plot
        counts = y.value_counts()
        axes[0].bar(['Non-Sepsis', 'Sepsis'], counts.values, 
                    color=[self.colors['non_sepsis'], self.colors['sepsis']], alpha=0.7)
        axes[0].set_ylabel('Number of Records', fontsize=12)
        axes[0].set_title('Sepsis vs Non-Sepsis Distribution', fontsize=14, fontweight='bold')
        axes[0].grid(axis='y', alpha=0.3)
        
        # Add count labels
        for i, v in enumerate(counts.values):
            axes[0].text(i, v + 100, str(v), ha='center', va='bottom', fontweight='bold')
        
        # Pie chart
        axes[1].pie(counts.values, labels=['Non-Sepsis', 'Sepsis'], 
                    colors=[self.colors['non_sepsis'], self.colors['sepsis']],
                    autopct='%1.1f%%', startangle=90, textprops={'fontsize': 12})
        axes[1].set_title('Class Distribution Percentage', fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"Class distribution plot saved to {save_path}")
    
    def plot_feature_correlation(self, X, feature_names, save_path='static/plots/correlation_heatmap.png'):
        """Plot feature correlation heatmap"""
        # Select top features for better visualization
        if X.shape[1] > 30:
            # Calculate variance and select top 25 features
            variances = np.var(X, axis=0)
            top_indices = np.argsort(variances)[-25:]
            X_subset = X[:, top_indices]
            feature_subset = [feature_names[i] for i in top_indices]
        else:
            X_subset = X
            feature_subset = feature_names
        
        # Calculate correlation matrix
        corr_matrix = np.corrcoef(X_subset.T)
        
        # Create heatmap
        fig, ax = plt.subplots(figsize=(16, 14))
        sns.heatmap(corr_matrix, 
                    xticklabels=feature_subset,
                    yticklabels=feature_subset,
                    cmap='coolwarm', 
                    center=0,
                    vmin=-1, vmax=1,
                    square=True,
                    linewidths=0.5,
                    cbar_kws={"shrink": 0.8},
                    ax=ax)
        
        plt.title('Feature Correlation Heatmap (Top 25 Features)', fontsize=16, fontweight='bold', pad=20)
        plt.xticks(rotation=45, ha='right', fontsize=8)
        plt.yticks(rotation=0, fontsize=8)
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"Correlation heatmap saved to {save_path}")
    
    def plot_vitals_trends(self, df, save_path='static/plots/vitals_trends.png'):
        """Plot trends of vitals before sepsis onset"""
        # Get patients who developed sepsis
        sepsis_patients = df[df['SepsisLabel'] == 1]['PatientID'].unique()
        
        if len(sepsis_patients) == 0:
            print("No sepsis patients found for trend analysis")
            return
        
        # Sample up to 50 patients for visualization
        sample_patients = np.random.choice(sepsis_patients, min(50, len(sepsis_patients)), replace=False)
        
        vital_signs = ['HR', 'Temp', 'SBP', 'MAP', 'Resp', 'O2Sat']
        available_vitals = [v for v in vital_signs if v in df.columns]
        
        fig, axes = plt.subplots(2, 3, figsize=(18, 10))
        axes = axes.flatten()
        
        for idx, vital in enumerate(available_vitals):
            ax = axes[idx]
            
            for patient_id in sample_patients:
                patient_data = df[df['PatientID'] == patient_id].sort_values('Hour')
                sepsis_onset = patient_data[patient_data['SepsisLabel'] == 1]['Hour'].min()
                
                if not np.isnan(sepsis_onset) and sepsis_onset > 6:
                    # Get 12 hours before sepsis onset
                    window_data = patient_data[
                        (patient_data['Hour'] >= sepsis_onset - 12) & 
                        (patient_data['Hour'] <= sepsis_onset + 2)
                    ]
                    
                    if len(window_data) > 0:
                        relative_hours = window_data['Hour'] - sepsis_onset
                        ax.plot(relative_hours, window_data[vital], alpha=0.3, linewidth=0.8, color=self.colors['sepsis'])
            
            # Add vertical line at sepsis onset
            ax.axvline(x=0, color='red', linestyle='--', linewidth=2, label='Sepsis Onset', alpha=0.7)
            ax.set_xlabel('Hours Relative to Sepsis Onset', fontsize=10)
            ax.set_ylabel(vital, fontsize=10)
            ax.set_title(f'{vital} Trends Before Sepsis', fontsize=12, fontweight='bold')
            ax.grid(True, alpha=0.3)
            ax.legend()
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"Vitals trends plot saved to {save_path}")
    
    def plot_outlier_detection(self, X, feature_names, y=None, save_path='static/plots/outlier_detection.png'):
        """Plot outlier detection using multiple methods"""
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        
        # 1. Box plots for key features
        key_features_idx = [i for i, name in enumerate(feature_names) 
                            if any(x in name for x in ['HR', 'Temp', 'SBP', 'MAP'])][:4]
        
        if len(key_features_idx) >= 4:
            for idx, feat_idx in enumerate(key_features_idx):
                row, col = idx // 2, idx % 2
                ax = axes[row, col]
                
                if y is not None:
                    data_to_plot = [X[y == 0, feat_idx], X[y == 1, feat_idx]]
                    bp = ax.boxplot(data_to_plot, labels=['Non-Sepsis', 'Sepsis'],
                                    patch_artist=True, showfliers=True)
                    
                    for patch, color in zip(bp['boxes'], [self.colors['non_sepsis'], self.colors['sepsis']]):
                        patch.set_facecolor(color)
                        patch.set_alpha(0.6)
                else:
                    ax.boxplot(X[:, feat_idx], patch_artist=True, showfliers=True)
                
                ax.set_title(f'{feature_names[feat_idx]} - Outlier Detection', 
                            fontsize=12, fontweight='bold')
                ax.set_ylabel('Value', fontsize=10)
                ax.grid(True, alpha=0.3, axis='y')
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"Outlier detection plot saved to {save_path}")
    
    def plot_pca_analysis(self, X, y, save_path='static/plots/pca_analysis.png'):
        """Plot PCA analysis"""
        # Apply PCA
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X)
        
        fig, axes = plt.subplots(1, 2, figsize=(16, 6))
        
        # Scatter plot
        axes[0].scatter(X_pca[y == 0, 0], X_pca[y == 0, 1], 
                       c=self.colors['non_sepsis'], label='Non-Sepsis', alpha=0.5, s=20)
        axes[0].scatter(X_pca[y == 1, 0], X_pca[y == 1, 1], 
                       c=self.colors['sepsis'], label='Sepsis', alpha=0.7, s=20)
        axes[0].set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)', fontsize=12)
        axes[0].set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)', fontsize=12)
        axes[0].set_title('PCA: Sepsis vs Non-Sepsis', fontsize=14, fontweight='bold')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
        
        # Explained variance
        pca_full = PCA()
        pca_full.fit(X)
        cumsum = np.cumsum(pca_full.explained_variance_ratio_)[:20]
        
        axes[1].plot(range(1, len(cumsum) + 1), cumsum, marker='o', linewidth=2)
        axes[1].axhline(y=0.95, color='r', linestyle='--', label='95% Variance')
        axes[1].set_xlabel('Number of Components', fontsize=12)
        axes[1].set_ylabel('Cumulative Explained Variance', fontsize=12)
        axes[1].set_title('PCA Explained Variance', fontsize=14, fontweight='bold')
        axes[1].grid(True, alpha=0.3)
        axes[1].legend()
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"PCA analysis plot saved to {save_path}")
    
    def plot_feature_importance(self, feature_importance, feature_names, 
                                save_path='static/plots/feature_importance.png', top_n=20):
        """Plot feature importance"""
        # Get top N features
        indices = np.argsort(feature_importance)[-top_n:]
        
        fig, ax = plt.subplots(figsize=(12, 8))
        ax.barh(range(len(indices)), feature_importance[indices], 
                color='#2ecc71', alpha=0.7)
        ax.set_yticks(range(len(indices)))
        ax.set_yticklabels([feature_names[i] for i in indices], fontsize=10)
        ax.set_xlabel('Importance Score', fontsize=12)
        ax.set_title(f'Top {top_n} Most Important Features', fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3, axis='x')
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"Feature importance plot saved to {save_path}")
    
    def plot_model_comparison(self, results_df, save_path='static/plots/model_comparison.png'):
        """Plot model performance comparison"""
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        
        metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
        
        for idx, metric in enumerate(metrics):
            row, col = idx // 2, idx % 2
            ax = axes[row, col]
            
            models = results_df['Model']
            values = results_df[metric]
            
            bars = ax.bar(models, values, color=plt.cm.viridis(np.linspace(0.3, 0.9, len(models))), alpha=0.8)
            ax.set_ylabel(metric, fontsize=12)
            ax.set_title(f'{metric} Comparison', fontsize=14, fontweight='bold')
            ax.set_ylim([0, 1.1])
            ax.grid(True, alpha=0.3, axis='y')
            plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')
            
            # Add value labels on bars
            for bar in bars:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height,
                       f'{height:.3f}', ha='center', va='bottom', fontsize=9)
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"Model comparison plot saved to {save_path}")