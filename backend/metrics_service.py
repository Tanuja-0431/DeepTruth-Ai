"""Metrics: store predictions, generate ROC, AUC, confusion matrix, distribution."""
import os
import base64
import numpy as np
from io import BytesIO
from threading import Lock

try:
    from sklearn.metrics import roc_curve, auc, confusion_matrix
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    METRICS_AVAILABLE = True
except ImportError:
    METRICS_AVAILABLE = False

from config import METRICS_CACHE_DIR

_lock = Lock()
_probs = []
_labels_pred = []


def record_prediction(prob, predicted_fake):
    with _lock:
        _probs.append(prob)
        _labels_pred.append(1 if predicted_fake else 0)


def get_metrics_data():
    with _lock:
        probs = list(_probs)
        preds = list(_labels_pred)

    if not METRICS_AVAILABLE or len(probs) < 2:
        return {
            "roc_base64": None,
            "confusion_base64": None,
            "distribution_base64": _plot_distribution(probs) if probs else None,
            "auc_score": None,
            "confusion_matrix": None,
            "n_samples": len(probs),
            "real_count": sum(1 for p in preds if p == 0),
            "fake_count": sum(1 for p in preds if p == 1),
        }

    probs_arr = np.array(probs)
    preds_arr = np.array(preds)

    if len(np.unique(preds_arr)) < 2:
        auc_score = 0.5
        fpr, tpr = np.array([0., 1.]), np.array([0., 1.])
    else:
        fpr, tpr, _ = roc_curve(preds_arr, probs_arr)
        auc_score = float(auc(fpr, tpr))

    roc_b64 = _plot_roc(fpr, tpr, auc_score)
    cm_b64 = _plot_confusion(preds_arr, (probs_arr > 0.5).astype(int))
    dist_b64 = _plot_distribution(probs)

    cm = confusion_matrix(preds_arr, (probs_arr > 0.5).astype(int))
    if cm.size < 4:
        cm = np.array([[0, 0], [0, 0]])

    return {
        "roc_base64": roc_b64,
        "confusion_base64": cm_b64,
        "distribution_base64": dist_b64,
        "auc_score": auc_score,
        "confusion_matrix": cm.tolist(),
        "n_samples": len(probs),
        "real_count": int((preds_arr == 0).sum()),
        "fake_count": int((preds_arr == 1).sum()),
    }


def _plot_roc(fpr, tpr, auc_score):
    fig, ax = plt.subplots(figsize=(6, 5))
    ax.plot(fpr, tpr, color="#22c55e", lw=2, label=f"AUC = {auc_score:.3f}")
    ax.plot([0, 1], [0, 1], "k--", lw=1)
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curve")
    ax.legend()
    ax.set_facecolor("#1a1a2e")
    fig.patch.set_facecolor("#1a1a2e")
    ax.tick_params(colors="white")
    ax.xaxis.label.set_color("white")
    ax.yaxis.label.set_color("white")
    ax.title.set_color("white")
    buf = BytesIO()
    plt.savefig(buf, format="png", dpi=100, bbox_inches="tight", facecolor="#1a1a2e")
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode()


def _plot_confusion(y_true, y_pred):
    cm = confusion_matrix(y_true, y_pred)
    if cm.size < 4:
        cm = np.array([[0, 0], [0, 0]])
    fig, ax = plt.subplots(figsize=(5, 4))
    ax.imshow(cm, cmap="Blues")
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(["Real", "Fake"])
    ax.set_yticklabels(["Real", "Fake"])
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    for i in range(2):
        for j in range(2):
            ax.text(j, i, str(cm[i, j]), ha="center", va="center", color="white", fontsize=16)
    ax.set_facecolor("#1a1a2e")
    fig.patch.set_facecolor("#1a1a2e")
    ax.tick_params(colors="white")
    ax.xaxis.label.set_color("white")
    ax.yaxis.label.set_color("white")
    buf = BytesIO()
    plt.savefig(buf, format="png", dpi=100, bbox_inches="tight", facecolor="#1a1a2e")
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode()


def _plot_distribution(probs):
    if not probs:
        return None
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.hist(probs, bins=20, color="#22c55e", alpha=0.7, edgecolor="white")
    ax.axvline(0.5, color="red", linestyle="--", lw=2)
    ax.set_xlabel("Fake Probability")
    ax.set_ylabel("Count")
    ax.set_title("Prediction Distribution")
    ax.set_facecolor("#1a1a2e")
    fig.patch.set_facecolor("#1a1a2e")
    ax.tick_params(colors="white")
    ax.xaxis.label.set_color("white")
    ax.yaxis.label.set_color("white")
    ax.title.set_color("white")
    buf = BytesIO()
    plt.savefig(buf, format="png", dpi=100, bbox_inches="tight", facecolor="#1a1a2e")
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode()
