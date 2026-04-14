"""
Deepfake Detection Pipeline - TensorFlow/Keras
Binary classifier with EfficientNetB0, Xception, or ResNet50
"""

import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import (
    EfficientNetB0,
    Xception,
    ResNet50,
)
# =============================================================================
# CONFIGURATION - Change these to customize
# =============================================================================

# Paths - Use /content/frames for Colab, or your local path
REAL_DIR = "/content/frames/train/real"
FAKE_DIR = "/content/frames/train/fake"

# For local: E:/deepfakedetection/dataset/frames/train
# REAL_DIR = "E:/deepfakedetection/dataset/frames/train/real"
# FAKE_DIR = "E:/deepfakedetection/dataset/frames/train/fake"

# Model choice: "efficientnetb0", "xception", or "resnet50"
MODEL_NAME = "efficientnetb0"

# Training - Phase 1 (frozen base)
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 1e-4
VAL_SPLIT = 0.2
SEED = 42

# Fine-tuning - Phase 2 (unfreeze top layers)
FINE_TUNE_EPOCHS = 15
FINE_TUNE_LR = 1e-5  # Very low LR for fine-tuning
UNFREEZE_TOP_LAYERS = 30  # Number of top layers in base model to unfreeze

# Output
SAVE_DIR = "./saved_models"
CHECKPOINT_PATH = os.path.join(SAVE_DIR, f"best_{MODEL_NAME}_checkpoint.keras")
MODEL_SAVE_PATH = os.path.join(SAVE_DIR, f"deepfake_{MODEL_NAME}_finetuned.keras")

# =============================================================================
# MODEL BUILDER
# =============================================================================

def get_preprocess_input(model_name):
    """Get the correct preprocessing function for each architecture."""
    if model_name == "efficientnetb0":
        return tf.keras.applications.efficientnet.preprocess_input
    elif model_name == "xception":
        return tf.keras.applications.xception.preprocess_input
    elif model_name == "resnet50":
        return tf.keras.applications.resnet50.preprocess_input
    else:
        raise ValueError(f"Unknown model: {model_name}")

def build_model(model_name, img_size=224, num_classes=1):
    """
    Build binary classifier with transfer learning.
    Switch model by changing model_name: "efficientnetb0", "xception", "resnet50"
    """
    model_name = model_name.lower()

    # Base model configs
    if model_name == "efficientnetb0":
        base_model = EfficientNetB0(
            include_top=False,
            weights="imagenet",
            input_shape=(img_size, img_size, 3),
            pooling="avg",
        )
    elif model_name == "xception":
        base_model = Xception(
            include_top=False,
            weights="imagenet",
            input_shape=(img_size, img_size, 3),
            pooling="avg",
        )
    elif model_name == "resnet50":
        base_model = ResNet50(
            include_top=False,
            weights="imagenet",
            input_shape=(img_size, img_size, 3),
            pooling="avg",
        )
    else:
        raise ValueError(f"Unknown model: {model_name}. Use efficientnetb0, xception, or resnet50.")

    base_model.trainable = False

    inputs = keras.Input(shape=(img_size, img_size, 3))
    x = base_model(inputs, training=False)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(num_classes, activation="sigmoid")(x)

    model = keras.Model(inputs, outputs)
    return model


def unfreeze_top_layers(model, num_layers=30):
    """
    Unfreeze the top layers of the base (pretrained) model for fine-tuning.
    Keeps early layers frozen to preserve learned features.
    """
    base_model = None
    for layer in model.layers:
        if isinstance(layer, keras.Model) and len(layer.layers) > 10:
            base_model = layer
            break
    if base_model is None:
        raise ValueError("Could not find base model in architecture")
    base_model.trainable = True
    # Freeze all but last num_layers
    for layer in base_model.layers[:-num_layers]:
        layer.trainable = False
    trainable = sum(int(w.shape.num_elements()) for w in base_model.trainable_weights)
    total = sum(int(w.shape.num_elements()) for w in base_model.weights)
    print(f"Unfroze top {num_layers} layers: {trainable:,} / {total:,} params trainable")
    return model


# =============================================================================
# DATA PIPELINE
# =============================================================================

def create_data_generators(real_dir, fake_dir, img_size, batch_size, val_split, seed):
    """
    Create train and validation generators.
    Expects: real_dir and fake_dir each containing .jpg images.
    Structure: .../train/real/*.jpg and .../train/fake/*.jpg
    """
    parent_dir = os.path.dirname(real_dir)  # .../train (contains real/ and fake/)
    if not os.path.exists(real_dir) or not os.path.exists(fake_dir):
        raise FileNotFoundError(
            f"Paths not found. real: {real_dir}\nfake: {fake_dir}\n"
            "Update REAL_DIR and FAKE_DIR in config."
        )

    # Use image_dataset_from_directory - expects parent with subdirs 'real' and 'fake'
    train_ds = keras.utils.image_dataset_from_directory(
        parent_dir,
        labels="inferred",
        label_mode="binary",
        class_names=["real", "fake"],
        color_mode="rgb",
        batch_size=batch_size,
        image_size=(img_size, img_size),
        shuffle=True,
        seed=seed,
        validation_split=val_split,
        subset="training",
    )

    val_ds = keras.utils.image_dataset_from_directory(
        parent_dir,
        labels="inferred",
        label_mode="binary",
        class_names=["real", "fake"],
        color_mode="rgb",
        batch_size=batch_size,
        image_size=(img_size, img_size),
        shuffle=True,
        seed=seed,
        validation_split=val_split,
        subset="validation",
    )

    return train_ds, val_ds


def preprocess_dataset(dataset, preprocess_fn):
    """Apply model-specific preprocessing to dataset."""
    def _preprocess(image, label):
        image = tf.cast(image, tf.float32)
        image = preprocess_fn(image)
        return image, label

    return dataset.map(_preprocess, num_parallel_calls=tf.data.AUTOTUNE)


def augment_dataset(dataset):
    """Add augmentation to training data."""
    augmentation = keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
    ])

    def _augment(image, label):
        image = augmentation(image, training=True)
        return image, label

    return dataset.map(_augment, num_parallel_calls=tf.data.AUTOTUNE)


# =============================================================================
# TRAINING
# =============================================================================

def main():
    print(f"TensorFlow version: {tf.__version__}")
    print(f"GPU available: {tf.config.list_physical_devices('GPU')}")

    # Resolve paths - handle both Colab (/content) and local
    real_dir = REAL_DIR
    fake_dir = FAKE_DIR

    # If Colab paths don't exist, try local paths
    if not os.path.exists(real_dir):
        real_dir = "E:/deepfakedetection/dataset/frames/train/real"
        fake_dir = "E:/deepfakedetection/dataset/frames/train/fake"
        print(f"Using local paths: {real_dir}")

    # Create datasets - parent (train/) must contain 'real' and 'fake' subdirs
    train_ds, val_ds = create_data_generators(
        real_dir, fake_dir, IMG_SIZE, BATCH_SIZE, VAL_SPLIT, SEED
    )

    preprocess_fn = get_preprocess_input(MODEL_NAME)
    train_ds = preprocess_dataset(train_ds, preprocess_fn)
    train_ds = augment_dataset(train_ds)
    val_ds = preprocess_dataset(val_ds, preprocess_fn)

    train_ds = train_ds.prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(tf.data.AUTOTUNE)

    # Build model
    model = build_model(MODEL_NAME, IMG_SIZE)
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss="binary_crossentropy",
        metrics=["accuracy", keras.metrics.AUC(name="auc")],
    )
    model.summary()

    os.makedirs(SAVE_DIR, exist_ok=True)

    # Callbacks - Phase 1 & 2
    early_stopping = keras.callbacks.EarlyStopping(
        monitor="val_auc",
        mode="max",
        patience=5,
        restore_best_weights=True,
        verbose=1,
    )
    reduce_lr = keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=3,
        min_lr=1e-7,
        verbose=1,
    )
    checkpoint = keras.callbacks.ModelCheckpoint(
        CHECKPOINT_PATH,
        monitor="val_auc",
        mode="max",
        save_best_only=True,
        verbose=1,
    )

    # ========== Phase 1: Train with frozen base ==========
    print("\n" + "=" * 60)
    print("PHASE 1: Training with frozen base model")
    print("=" * 60)
    history1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[early_stopping, reduce_lr, checkpoint],
    )

    # ========== Phase 2: Fine-tune top layers ==========
    print("\n" + "=" * 60)
    print("PHASE 2: Fine-tuning top layers (unfrozen)")
    print("=" * 60)
    unfreeze_top_layers(model, UNFREEZE_TOP_LAYERS)
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=FINE_TUNE_LR),
        loss="binary_crossentropy",
        metrics=["accuracy", keras.metrics.AUC(name="auc")],
    )
    # Reset early stopping for Phase 2
    early_stopping_finetune = keras.callbacks.EarlyStopping(
        monitor="val_auc",
        mode="max",
        patience=5,
        restore_best_weights=True,
        verbose=1,
    )
    history2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=FINE_TUNE_EPOCHS,
        callbacks=[early_stopping_finetune, checkpoint],
    )

    # Load best checkpoint (best val_auc across both phases) and save as final
    if os.path.exists(CHECKPOINT_PATH):
        model = keras.models.load_model(CHECKPOINT_PATH)
        print(f"\nLoaded best checkpoint from {CHECKPOINT_PATH}")
    model.save(MODEL_SAVE_PATH)
    print(f"Final model saved to {MODEL_SAVE_PATH}")

    return model, (history1, history2)


if __name__ == "__main__":
    model, history = main()
