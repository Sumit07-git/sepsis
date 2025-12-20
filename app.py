"""
Sepsis Early Prediction System - Flask Web Application
Enhanced version with gender, age, and mobile-responsive design
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import numpy as np
import os
import joblib
from data_preprocessing import SepsisDataPreprocessor
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'sepsis_prediction_secret_key_2024'  # Change this in production

# Load pre-trained model
MODEL_PATH = 'models/sepsis_model.pkl'
SCALER_PATH = 'models/scaler.pkl'
FEATURES_PATH = 'models/features.pkl'

model = None
scaler = None
features = None
preprocessor = SepsisDataPreprocessor()

def load_model():
    """Load the pre-trained model"""
    global model, scaler, features
    
    if not os.path.exists(MODEL_PATH):
        print("\n" + "="*60)
        print("WARNING: Pre-trained model not found!")
        print("Please run 'python model_trainer.py' first to train the model.")
        print("="*60 + "\n")
        return False
    
    try:
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        features = joblib.load(FEATURES_PATH)
        print("✓ Pre-trained model loaded successfully")
        return True
    except Exception as e:
        print(f"✗ Error loading model: {str(e)}")
        return False



@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    """Prediction page"""
    if request.method == 'POST':
        try:
            if model is None:
                return jsonify({
                    'status': 'error',
                    'message': 'Model not loaded. Please run model_trainer.py first.'
                }), 500
            
            # Get patient data from form including gender and age
            patient_data = {
                'Age': int(request.form.get('Age', 50)),
                'Gender': int(request.form.get('Gender', 1)),  # 1=Male, 0=Female
                'HR': float(request.form.get('HR', 80)),
                'O2Sat': float(request.form.get('O2Sat', 95)),
                'Temp': float(request.form.get('Temp', 37)),
                'SBP': float(request.form.get('SBP', 120)),
                'MAP': float(request.form.get('MAP', 80)),
                'DBP': float(request.form.get('DBP', 70)),
                'Resp': float(request.form.get('Resp', 16)),
                'WBC': float(request.form.get('WBC', 8)),
                'Platelets': float(request.form.get('Platelets', 200)),
                'Creatinine': float(request.form.get('Creatinine', 1.0)),
                'Lactate': float(request.form.get('Lactate', 1.5))
            }
            
            # Prepare features
            X, feature_names = preprocessor.prepare_for_prediction(patient_data)
            
            # Scale features
            X_scaled = scaler.transform(X)
            
            # Make prediction
            prediction = model.predict(X_scaled)[0]
            probability = model.predict_proba(X_scaled)[0, 1]
            
            # Determine risk level
            if probability >= 0.7:
                risk_level = 'VERY HIGH'
                risk_class = 'very-high'
            elif probability >= 0.5:
                risk_level = 'HIGH'
                risk_class = 'high'
            elif probability >= 0.3:
                risk_level = 'MODERATE'
                risk_class = 'moderate'
            else:
                risk_level = 'LOW'
                risk_class = 'low'
            
            # Calculate clinical scores
            sofa = preprocessor.create_smart_features(patient_data)['SOFA_approx'].values[0]
            sirs = preprocessor.create_smart_features(patient_data)['SIRS_count'].values[0]
            
            # Generate clinical alerts
            alerts = []
            if patient_data['HR'] > 100:
                alerts.append('Tachycardia detected (HR > 100)')
            if patient_data['SBP'] < 90:
                alerts.append('Hypotension detected (SBP < 90)')
            if patient_data['Temp'] > 38 or patient_data['Temp'] < 36:
                alerts.append('Temperature abnormal')
            if patient_data['Lactate'] > 2.0:
                alerts.append('Elevated lactate (> 2.0)')
            if patient_data['WBC'] > 12 or patient_data['WBC'] < 4:
                alerts.append('Abnormal WBC count')
            if patient_data['O2Sat'] < 92:
                alerts.append('Low oxygen saturation')
            if patient_data['Platelets'] < 150:
                alerts.append('Thrombocytopenia detected')
            if patient_data['Creatinine'] > 1.2:
                alerts.append('Elevated creatinine')
            
            # Add age-specific alerts
            if patient_data['Age'] >= 65:
                alerts.append('Elderly patient - increased sepsis risk')
            
            # Store results in session for results page
            session['prediction_results'] = {
                'patient_data': patient_data,
                'prediction': int(prediction),
                'probability': float(probability),
                'risk_level': risk_level,
                'risk_class': risk_class,
                'sofa_score': int(sofa),
                'sirs_count': int(sirs),
                'alerts': alerts,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # Return JSON for AJAX or redirect for form submission
            if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'status': 'success',
                    'redirect': url_for('results')
                })
            else:
                return redirect(url_for('results'))
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Prediction failed: {str(e)}'
            }), 500
    
    return render_template('predict.html')

@app.route('/results')
def results():
    """Results page with detailed recommendations"""
    prediction_results = session.get('prediction_results')
    
    if not prediction_results:
        return redirect(url_for('predict'))
    
    return render_template('result.html', results=prediction_results)

@app.route('/about')
def about():
    """About page"""
    return render_template('about.html')

@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("SEPSIS EARLY PREDICTION SYSTEM")
    print("="*60)
    
    # Load model
    model_loaded = load_model()
    
    if not model_loaded:
        print("\nPlease train the model first:")
        print("  python model_trainer.py")
        print("\nThen start the application:")
        print("  python app.py")
    else:
        print("\nStarting Flask application...")
        print("Access the application at: http://127.0.0.1:5000")
        print("\nFeatures:")
        print("- Real-time sepsis risk prediction")
        print("- Age and gender-based assessment")
        print("- SOFA & SIRS score calculation")
        print("- Clinical alerts and recommendations")
        print("- Mobile-responsive design")
        print("- Pre-trained Random Forest model")
        print("="*60 + "\n")
        
        app.run(debug=True, host='0.0.0.0', port=5000)