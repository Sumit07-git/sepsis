"""
Sepsis Early Prediction System - Data Preprocessing Module
Enhanced with age and gender features
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

class SepsisDataPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = []
        
    def create_smart_features(self, patient_data):
        """Create advanced clinical features from patient data including age and gender"""
        df = pd.DataFrame([patient_data])
        
        # Extract demographics
        age = patient_data.get('Age', 50)
        gender = patient_data.get('Gender', 1)  # 1=Male, 0=Female
        
        # Age-based risk factors
        df['age_high_risk'] = 1 if age >= 65 else 0
        df['age_very_high_risk'] = 1 if age >= 75 else 0
        df['age_pediatric'] = 1 if age < 18 else 0
        
        # Gender-based features (males have slightly higher sepsis risk)
        df['gender_male'] = gender
        
        # Age-gender interaction
        df['elderly_male'] = 1 if (age >= 65 and gender == 1) else 0
        
        # 1. SOFA-inspired indicators
        # Respiratory score
        o2sat = patient_data.get('O2Sat', 95)
        df['resp_score'] = 0
        if o2sat < 92:
            df['resp_score'] = 1
        if o2sat < 88:
            df['resp_score'] = 2
        
        # Cardiovascular score
        map_val = patient_data.get('MAP', 80)
        df['cardio_score'] = 0
        if map_val < 70:
            df['cardio_score'] = 1
        if map_val < 60:
            df['cardio_score'] = 2
        
        # Coagulation score
        platelets = patient_data.get('Platelets', 200)
        df['coag_score'] = 0
        if platelets < 150:
            df['coag_score'] = 1
        if platelets < 100:
            df['coag_score'] = 2
        
        # Renal score (adjusted for age)
        creatinine = patient_data.get('Creatinine', 1.0)
        creat_threshold = 1.2 if age < 65 else 1.4  # Higher threshold for elderly
        df['renal_score'] = 0
        if creatinine > creat_threshold:
            df['renal_score'] = 1
        if creatinine > 2.0:
            df['renal_score'] = 2
        
        # SOFA total
        df['SOFA_approx'] = df['resp_score'] + df['cardio_score'] + df['coag_score'] + df['renal_score']
        
        # 2. Binary risk flags
        hr = patient_data.get('HR', 80)
        df['high_HR_flag'] = 1 if hr > 100 else 0
        df['very_high_HR_flag'] = 1 if hr > 120 else 0
        
        sbp = patient_data.get('SBP', 120)
        df['low_SBP_flag'] = 1 if sbp < 90 else 0
        df['very_low_SBP_flag'] = 1 if sbp < 80 else 0
        
        temp = patient_data.get('Temp', 37)
        df['fever_flag'] = 1 if temp > 38 else 0
        df['hypothermia_flag'] = 1 if temp < 36 else 0
        
        resp = patient_data.get('Resp', 16)
        df['high_resp_flag'] = 1 if resp > 22 else 0
        
        wbc = patient_data.get('WBC', 8)
        df['high_WBC_flag'] = 1 if wbc > 12 else 0
        df['low_WBC_flag'] = 1 if wbc < 4 else 0
        
        # 3. Clinical composite scores
        # qSOFA approximation
        df['qSOFA_approx'] = 0
        if resp >= 22:
            df['qSOFA_approx'] += 1
        if sbp <= 100:
            df['qSOFA_approx'] += 1
        
        # SIRS criteria count
        df['SIRS_count'] = 0
        if hr > 90:
            df['SIRS_count'] += 1
        if resp > 20:
            df['SIRS_count'] += 1
        if temp < 36 or temp > 38:
            df['SIRS_count'] += 1
        if wbc < 4 or wbc > 12:
            df['SIRS_count'] += 1
        
        # 4. Risk intensity scores
        df['cardio_risk'] = (sbp < 90) * 2 + (map_val < 65) * 2 + (hr > 110) * 1
        df['resp_risk'] = (o2sat < 90) * 3 + (resp > 25) * 1
        df['metabolic_risk'] = (patient_data.get('Lactate', 1.5) > 2.0) * 2
        
        # 5. Organ dysfunction indicators
        df['multi_organ_risk'] = (df['SOFA_approx'] >= 2).astype(int)
        df['severe_risk'] = (df['SIRS_count'] >= 3).astype(int)
        
        # 6. Age-adjusted risk scores
        age_factor = 1.2 if age >= 65 else 1.0
        age_factor = age_factor * 1.3 if age >= 75 else age_factor
        
        df['age_adjusted_sofa'] = df['SOFA_approx'] * age_factor
        df['age_adjusted_sirs'] = df['SIRS_count'] * age_factor
        
        return df
    
    def prepare_for_prediction(self, patient_data):
        """Prepare patient data for model prediction"""
        # Create features
        df = self.create_smart_features(patient_data)
        
        # Define expected features (must match training)
        base_features = ['Age', 'Gender', 'HR', 'O2Sat', 'Temp', 'SBP', 'MAP', 'DBP', 'Resp', 
                        'WBC', 'Platelets', 'Creatinine', 'Lactate']
        
        engineered_features = [
            'age_high_risk', 'age_very_high_risk', 'age_pediatric',
            'gender_male', 'elderly_male',
            'resp_score', 'cardio_score', 'coag_score', 'renal_score',
            'SOFA_approx', 'high_HR_flag', 'very_high_HR_flag',
            'low_SBP_flag', 'very_low_SBP_flag', 'fever_flag',
            'hypothermia_flag', 'high_resp_flag', 'high_WBC_flag',
            'low_WBC_flag', 'qSOFA_approx', 'SIRS_count',
            'cardio_risk', 'resp_risk', 'metabolic_risk',
            'multi_organ_risk', 'severe_risk',
            'age_adjusted_sofa', 'age_adjusted_sirs'
        ]
        
        all_features = base_features + engineered_features
        
        # Ensure all features are present
        for feature in all_features:
            if feature not in df.columns:
                if feature in base_features:
                    df[feature] = patient_data.get(feature, 0)
                else:
                    df[feature] = 0
        
        # Select features in correct order
        X = df[all_features].values
        
        return X, all_features

def generate_pretrained_model_data():
    """Generate training data for the pre-trained model with age and gender"""
    np.random.seed(42)
    
    data = []
    n_patients = 2000
    
    for patient_id in range(1, n_patients + 1):
        # 35% develop sepsis
        develops_sepsis = np.random.random() < 0.35
        
        # Generate age (more elderly patients tend to develop sepsis)
        if develops_sepsis:
            age = int(np.random.normal(68, 15))  # Older mean age for sepsis
        else:
            age = int(np.random.normal(55, 18))  # Younger mean age for non-sepsis
        age = max(18, min(95, age))  # Clamp between 18-95
        
        # Generate gender (slightly more males develop sepsis)
        if develops_sepsis:
            gender = 1 if np.random.random() < 0.55 else 0  # 55% male
        else:
            gender = 1 if np.random.random() < 0.48 else 0  # 48% male
        
        if develops_sepsis:
            # Septic patient characteristics
            hr = np.random.normal(110, 20)
            temp = np.random.normal(38.5, 1.5)
            resp = np.random.normal(24, 5)
            sbp = np.random.normal(92, 15)
            map_val = np.random.normal(65, 10)
            wbc = np.random.normal(14, 4)
            lactate = np.random.normal(3.5, 1.5)
            platelets = np.random.normal(120, 40)
            creatinine = np.random.normal(1.8, 0.8)
            o2sat = np.random.normal(92, 4)
        else:
            # Normal patient characteristics
            hr = np.random.normal(80, 15)
            temp = np.random.normal(37, 0.8)
            resp = np.random.normal(16, 3)
            sbp = np.random.normal(120, 15)
            map_val = np.random.normal(80, 10)
            wbc = np.random.normal(8, 2)
            lactate = np.random.normal(1.2, 0.5)
            platelets = np.random.normal(220, 60)
            creatinine = np.random.normal(0.9, 0.3)
            o2sat = np.random.normal(97, 2)
        
        row = {
            'PatientID': patient_id,
            'Age': age,
            'Gender': gender,
            'HR': max(40, min(180, hr)),
            'O2Sat': max(70, min(100, o2sat)),
            'Temp': max(34, min(42, temp)),
            'SBP': max(60, min(200, sbp)),
            'MAP': max(40, min(140, map_val)),
            'DBP': max(30, min(120, sbp - 40)),
            'Resp': max(8, min(40, resp)),
            'WBC': max(1, min(30, wbc)),
            'Platelets': max(20, min(500, platelets)),
            'Creatinine': max(0.3, min(8, creatinine)),
            'Lactate': max(0.5, min(10, lactate)),
            'SepsisLabel': 1 if develops_sepsis else 0
        }
        
        data.append(row)
    
    df = pd.DataFrame(data)
    df.to_csv('sepsis_training_data.csv', index=False)
    print(f"Generated training dataset: {len(df)} patients")
    print(f"Sepsis cases: {df['SepsisLabel'].sum()} ({df['SepsisLabel'].mean()*100:.1f}%)")
    print(f"Age range: {df['Age'].min()}-{df['Age'].max()} years")
    print(f"Gender distribution: {df['Gender'].mean()*100:.1f}% male")
    
    return df