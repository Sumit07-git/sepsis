# Sepsis Early Prediction System

An AI-powered clinical decision support system for early prediction of sepsis in ICU patients using machine learning.

## Overview

Sepsis is a life-threatening condition causing 11 million deaths annually. This system uses Random Forest machine learning to predict sepsis risk up to 6 hours in advance, analyzing patient vital signs and laboratory values to enable early intervention.

## Features

- **AI-Powered Prediction**: Random Forest classifier with 32 engineered features
- **Clinical Scoring**: Automated SOFA, SIRS, and qSOFA calculations
- **Risk Stratification**: Four-level risk classification (Very High, High, Moderate, Low)
- **Real-time Alerts**: Automated detection of abnormal vitals and lab values
- **Detailed Results**: Comprehensive recommendations and intervention timelines
- **Export Options**: Print reports, copy summaries, PDF export
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Installation

### Prerequisites
- Python 3.8+
- pip

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/sepsis-prediction-system.git
cd sepsis-prediction-system

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the model
python model_trainer.py

# Run application
python app.py
```

Access at: https://sepsis-prediction-7ofu.onrender.com

## Usage

1. Navigate to the prediction page
2. Enter patient vitals (HR, Temp, BP, etc.)
3. Enter lab values (WBC, Platelets, Creatinine, Lactate)
4. Click "Calculate Risk"
5. Review comprehensive results and recommendations

### Example Data

**Normal Patient:**
```
HR: 75, Temp: 36.8°C, Resp: 14, O2Sat: 98%
SBP/DBP: 125/75, MAP: 92
WBC: 7.2, Platelets: 240, Creatinine: 0.9, Lactate: 1.1
Result: LOW RISK (~15-20%)
```

**Septic Patient:**
```
HR: 118, Temp: 38.8°C, Resp: 26, O2Sat: 89%
SBP/DBP: 85/52, MAP: 63
WBC: 16.5, Platelets: 95, Creatinine: 2.3, Lactate: 4.2
Result: VERY HIGH RISK (~75-85%)
```

## Project Structure

```
sepsis-prediction-system/
├── app.py                      # Flask application
├── model_trainer.py            # Model training script
├── data_preprocessing.py       # Feature engineering
├── requirements.txt            # Dependencies
├── models/                     # Trained models (generated)
│   ├── sepsis_model.pkl
│   ├── scaler.pkl
│   └── features.pkl
├── static/
│   ├── css/
│   │   ├── style.css
│   │   └── result_page.css
│   └── js/
│       ├── script.js
│       └── result_page.js
└── templates/
    ├── index.html
    ├── predict.html
    ├── result_page.html
    └── about.html
```

## Model Information

### Algorithm
- **Type**: Random Forest Classifier
- **Trees**: 200 estimators
- **Features**: 32 (11 base + 21 engineered)
- **Balancing**: SMOTE

### Performance Metrics
| Metric | Score |
|--------|-------|
| Accuracy | ~93% |
| Precision | ~91% |
| Recall | ~94% |
| F1-Score | ~92% |
| ROC-AUC | ~96% |

### Features
**Base (11):** HR, O2Sat, Temp, SBP, MAP, DBP, Resp, WBC, Platelets, Creatinine, Lactate

**Engineered (21):** SOFA components, SIRS criteria, qSOFA score, binary risk flags, composite risk scores

## Clinical Scoring

### SOFA Score (0-8+)
- Respiratory, Cardiovascular, Coagulation, Renal components
- ≥2 suggests organ dysfunction

### SIRS Count (0-4)
- Temperature, Heart Rate, Respiratory Rate, WBC criteria
- ≥2 suggests systemic inflammation

### qSOFA (0-3)
- Rapid bedside assessment
- ≥2 indicates sepsis risk

## Technologies

**Backend:** Python, Flask, scikit-learn, imbalanced-learn, NumPy, Pandas

**Frontend:** HTML5, CSS3, JavaScript, Font Awesome, Google Fonts

**ML:** Random Forest, SMOTE, StandardScaler, Cross-validation

## API Documentation

### Health Check
```http
GET /api/health
```

### Prediction
```http
POST /predict
Content-Type: application/x-www-form-urlencoded

Parameters: HR, Temp, Resp, O2Sat, SBP, DBP, MAP, WBC, Platelets, Creatinine, Lactate
```

### Results
```http
GET /results
```

## Configuration

Create `config.py` for custom settings:

```python
class Config:
    SECRET_KEY = 'your-secret-key-here'
    MODEL_PATH = 'models/sepsis_model.pkl'
    DEBUG = False
    PORT = 5000
```

## Testing

```bash
# Run tests
python -m pytest tests/

# Test model
python model_trainer.py --test

# Test prediction
python -c "from app import model; print('Model loaded:', model is not None)"
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

## Disclaimer

⚠️ **FOR EDUCATIONAL AND RESEARCH PURPOSES ONLY**

This system is NOT FDA approved or clinically validated. It should NOT be used for actual clinical decision-making without:
- Proper regulatory approval
- Clinical validation studies
- Integration with hospital systems
- Oversight by qualified healthcare professionals

Always follow established sepsis protocols and consult healthcare providers.

## License

MIT License - see LICENSE file for details

## References

1. Singer, M., et al. (2016). "Sepsis-3 Definitions." *JAMA*, 315(8), 801-810.
2. Vincent, J.L., et al. (1996). "SOFA Score." *Intensive Care Medicine*, 22(7), 707-710.
3. Reyna, M.A., et al. (2019). "PhysioNet/Computing in Cardiology Challenge 2019."
4. Chawla, N.V., et al. (2002). "SMOTE Technique." *JAIR*, 16, 321-357.

## Contact
- **Email**: sumitsamal08@gmail.com
- **GitHub**: [@Sumit07-git](https://github.com/Sumit07-git)

---

Made with ❤️ for Healthcare Innovation