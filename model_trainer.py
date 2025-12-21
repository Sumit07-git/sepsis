import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
import joblib
import os
from data_preprocessing import SepsisDataPreprocessor, generate_pretrained_model_data

def train_pretrained_model():
    """Train the model that will be used for predictions"""
    
    print("="*60)
    print("TRAINING SEPSIS PREDICTION MODEL")
    print("With Age and Gender Demographics")
    print("="*60)
    

    if not os.path.exists('sepsis_training_data.csv'):
        print("\n[1/7] Generating training dataset with demographics...")
        df = generate_pretrained_model_data()
    else:
        print("\n[1/7] Loading training dataset...")
        df = pd.read_csv('sepsis_training_data.csv')
    
    print(f"Dataset: {df.shape[0]} patients, {df.shape[1]} features")
    print(f"Sepsis prevalence: {df['SepsisLabel'].mean()*100:.1f}%")
    print(f"Age range: {df['Age'].min():.0f}-{df['Age'].max():.0f} years")
    print(f"Gender: {df['Gender'].mean()*100:.1f}% male, {(1-df['Gender'].mean())*100:.1f}% female")
    

    print("\n[2/7] Creating features with age and gender...")
    preprocessor = SepsisDataPreprocessor()
    

    X_list = []
    y_list = []
    
    for idx, row in df.iterrows():
        patient_data = row.to_dict()
        X, features = preprocessor.prepare_for_prediction(patient_data)
        X_list.append(X[0])
        y_list.append(patient_data['SepsisLabel'])
    
    X = np.array(X_list)
    y = np.array(y_list)
    
    print(f"Feature matrix shape: {X.shape}")
    print(f"Total features: {len(features)}")
    print(f"Feature categories:")
    print(f"  - Base features: 13 (including Age, Gender)")
    print(f"  - Demographic features: 5 (age/gender interactions)")
    print(f"  - Clinical scores: 22 (SOFA, SIRS, risk flags)")
    

    print("\n[3/7] Splitting data (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    

    train_indices = [i for i in range(len(y)) if i < len(y_train)]
    test_indices = [i for i in range(len(y)) if i >= len(y_train)]
    
    print(f"Training set demographics:")
    print(f"  - Sepsis cases: {sum(y_train == 1)} ({sum(y_train == 1)/len(y_train)*100:.1f}%)")
    print(f"Test set demographics:")
    print(f"  - Sepsis cases: {sum(y_test == 1)} ({sum(y_test == 1)/len(y_test)*100:.1f}%)")
    

    print("\n[4/7] Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    

    print("\n[5/7] Handling class imbalance with SMOTE...")
    print(f"Before SMOTE - Class 0: {sum(y_train == 0)}, Class 1: {sum(y_train == 1)}")
    
    smote = SMOTE(random_state=42, k_neighbors=5)
    X_train_balanced, y_train_balanced = smote.fit_resample(X_train_scaled, y_train)
    
    print(f"After SMOTE - Class 0: {sum(y_train_balanced == 0)}, Class 1: {sum(y_train_balanced == 1)}")
    

    print("\n[6/7] Training Random Forest model...")
    print("Model configuration:")
    print("  - n_estimators: 200")
    print("  - max_depth: 20")
    print("  - min_samples_split: 5")
    print("  - min_samples_leaf: 2")
    print("  - class_weight: balanced")
    
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train_balanced, y_train_balanced)
    print("✓ Model trained successfully!")
    

    print("\n[7/7] Evaluating model performance...")
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
    
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    
    print(f"\n{'='*50}")
    print(f"Test Set Performance:")
    print(f"{'='*50}")
    print(f"  Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"  Precision: {precision:.4f} ({precision*100:.2f}%)")
    print(f"  Recall:    {recall:.4f} ({recall*100:.2f}%)")
    print(f"  F1-Score:  {f1:.4f}")
    print(f"  ROC-AUC:   {roc_auc:.4f}")
    print(f"{'='*50}")
    

    cm = confusion_matrix(y_test, y_pred)
    print(f"\nConfusion Matrix:")
    print(f"  True Negatives:  {cm[0][0]}")
    print(f"  False Positives: {cm[0][1]}")
    print(f"  False Negatives: {cm[1][0]}")
    print(f"  True Positives:  {cm[1][1]}")
    

    print(f"\n{'='*50}")
    print(f"Top 15 Most Important Features:")
    print(f"{'='*50}")
    feature_importance = pd.DataFrame({
        'feature': features,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head(15).iterrows():
        print(f"  {row['feature']:25s} {row['importance']:.4f}")
    

    age_importance = feature_importance[feature_importance['feature'] == 'Age']['importance'].values
    gender_importance = feature_importance[feature_importance['feature'] == 'Gender']['importance'].values
    
    if len(age_importance) > 0:
        print(f"\n  Age importance: {age_importance[0]:.4f} (Rank: {list(feature_importance['feature']).index('Age') + 1})")
    if len(gender_importance) > 0:
        print(f"  Gender importance: {gender_importance[0]:.4f} (Rank: {list(feature_importance['feature']).index('Gender') + 1})")
    

    print(f"\n{'='*50}")
    print("[SAVING] Saving model, scaler, and features...")
    print(f"{'='*50}")
    os.makedirs('models', exist_ok=True)
    
    joblib.dump(model, 'models/sepsis_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    joblib.dump(features, 'models/features.pkl')
    
    print("✓ Model saved to: models/sepsis_model.pkl")
    print("✓ Scaler saved to: models/scaler.pkl")
    print("✓ Features saved to: models/features.pkl")
    

    feature_importance.to_csv('models/feature_importance.csv', index=False)
    print("✓ Feature importance saved to: models/feature_importance.csv")
    
    print("\n" + "="*60)
    print("MODEL TRAINING COMPLETED SUCCESSFULLY!")
    print("="*60)
    print(f"\nModel includes {len(features)} features:")
    print("  ✓ Age and Gender demographics")
    print("  ✓ 11 Vital signs and lab values")
    print("  ✓ SOFA and SIRS clinical scores")
    print("  ✓ Age-adjusted risk indicators")
    print("  ✓ Binary risk flags")
    print(f"\nModel ready for deployment!")
    print("="*60 + "\n")
    
    return model, scaler, features

if __name__ == "__main__":
    train_pretrained_model()