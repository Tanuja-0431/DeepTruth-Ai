import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import sys
import numpy as np

sys.path.append(r"e:\deepfakedetection\backend")
from model_loader import get_model

def run():
    model, preprocess = get_model()
    lines = []
    lines.append("--- 1. VERIFY MODEL LOADING ---")
    lines.append(f"Preprocess mapping: {preprocess.__module__}.{preprocess.__name__}")
    lines.append(f"Input shape: {model.input_shape}")
    lines.append(f"Output shape: {model.output_shape}")
    
    layer_info = [f"{l.name} ({l.__class__.__name__})" for l in model.layers[:5]]
    lines.append(f"Layers: {', '.join(layer_info)}")
    
    dummy = np.random.randint(0, 256, (1, 224, 224, 3)).astype(np.float32)
    
    # Scen A: Only preprocess input
    scen_a = preprocess(dummy.copy())
    p_a = model.predict(scen_a, verbose=0)[0][0]
    lines.append(f"Scen A (Raw 0-255 + preprocess): Min={scen_a.min():.4f}, Max={scen_a.max():.4f} -> Pred={p_a:.4f}")
    
    # Scen B: / 255.0 + preprocess input
    scen_b = preprocess((dummy.copy()) / 255.0)
    p_b = model.predict(scen_b, verbose=0)[0][0]
    lines.append(f"Scen B (/ 255 + preprocess): Min={scen_b.min():.4f}, Max={scen_b.max():.4f} -> Pred={p_b:.4f}")
    
    # Edge Cases
    blank = preprocess(np.zeros((1, 224, 224, 3), dtype=np.float32))
    p_blank = model.predict(blank, verbose=0)[0][0]
    lines.append(f"Blank (0s) -> Pred: {p_blank:.4f}")
    
    white = preprocess(np.ones((1, 224, 224, 3), dtype=np.float32) * 255.0)
    p_white = model.predict(white, verbose=0)[0][0]
    lines.append(f"White (255s) -> Pred: {p_white:.4f}")
    
    with open("debug_results.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

if __name__ == "__main__":
    run()
