from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.neural_network import MLPClassifier
import joblib, numpy as np

data = load_breast_cancer()
X, y = data.data, data.target
feature_names = list(data.feature_names)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)

svm = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True, random_state=42)
rf  = RandomForestClassifier(n_estimators=100, random_state=42)
gb  = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
ann = MLPClassifier(hidden_layer_sizes=(64,32), activation='relu', max_iter=1000, random_state=42, early_stopping=True)
ens = VotingClassifier(estimators=[('svm',svm),('rf',rf),('gb',gb),('ann',ann)], voting='soft')

for name, m in [('SVM',svm),('RF',rf),('GB',gb),('ANN',ann),('Ensemble',ens)]:
    m.fit(X_train_s, y_train)
    print(f'{name}: {m.score(X_test_s, y_test):.4f}')

rf_temp = RandomForestClassifier(n_estimators=200, random_state=42)
rf_temp.fit(X_train_s, y_train)
top10_idx   = np.argsort(rf_temp.feature_importances_)[::-1][:10].tolist()
top10_names = [feature_names[i] for i in top10_idx]
feature_ranges = {name: {'min': float(X[:,i].min()), 'max': float(X[:,i].max()), 'mean': float(X[:,i].mean())} for i, name in enumerate(feature_names)}

joblib.dump(scaler,         'models/scaler.pkl')
joblib.dump(svm,            'models/svm_model.pkl')
joblib.dump(rf,             'models/rf_model.pkl')
joblib.dump(gb,             'models/gb_model.pkl')
joblib.dump(ann,            'models/ann_model.pkl')
joblib.dump(ens,            'models/ensemble_model.pkl')
joblib.dump(top10_idx,      'models/top10_idx.pkl')
joblib.dump(top10_names,    'models/top10_names.pkl')
joblib.dump(feature_names,  'models/feature_names.pkl')
joblib.dump(feature_ranges, 'models/feature_ranges.pkl')
print('All models retrained and saved locally.')