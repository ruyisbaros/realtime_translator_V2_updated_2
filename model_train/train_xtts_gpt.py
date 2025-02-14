import os
import torch
from trainer import Trainer, TrainerArgs
from TTS.tts.datasets import load_tts_samples
from TTS.tts.configs.shared_configs import BaseDatasetConfig
from TTS.tts.layers.xtts.trainer.gpt_trainer import GPTArgs, GPTTrainer, GPTTrainerConfig, XttsAudioConfig
from TTS.utils.manage import ModelManager
# ✅ Required for PyTorch 2.6 fix
from TTS.tts.configs.xtts_config import XttsConfig

# ✅ Fix for PyTorch 2.6 Security Restrictions
torch.serialization.add_safe_globals([XttsConfig, XttsAudioConfig])

# ✅ Define Paths
OUTPUT_PATH = os.path.abspath("fine_tuning_output")  # 🔥 Ensure absolute path
DATASET_PATH = os.path.abspath("audio_dataset")  # 🔥 Ensure absolute path
METADATA_FILE = os.path.join(DATASET_PATH, "metadata.csv")

# ✅ Set XTTS Checkpoint Paths
CHECKPOINTS_OUT_PATH = os.path.abspath(
    "xtts_checkpoints")  # 🔥 Store downloaded files
os.makedirs(CHECKPOINTS_OUT_PATH, exist_ok=True)

DVAE_CHECKPOINT = os.path.join(CHECKPOINTS_OUT_PATH, "dvae.pth")
MEL_NORM_FILE = os.path.join(CHECKPOINTS_OUT_PATH, "mel_stats.pth")
TOKENIZER_FILE = os.path.join(CHECKPOINTS_OUT_PATH, "vocab.json")
XTTS_CHECKPOINT = os.path.join(CHECKPOINTS_OUT_PATH, "model.pth")

# ✅ Download Required Files if Missing
if not os.path.isfile(DVAE_CHECKPOINT) or not os.path.isfile(MEL_NORM_FILE):
    print("🚀 Downloading DVAE & MEL Stats files...")
    ModelManager._download_model_files([
        "https://coqui.gateway.scarf.sh/hf-coqui/XTTS-v2/main/dvae.pth",
        "https://coqui.gateway.scarf.sh/hf-coqui/XTTS-v2/main/mel_stats.pth"
    ], CHECKPOINTS_OUT_PATH, progress_bar=True)

if not os.path.isfile(TOKENIZER_FILE) or not os.path.isfile(XTTS_CHECKPOINT):
    print("🚀 Downloading XTTS Model files...")
    ModelManager._download_model_files([
        "https://coqui.gateway.scarf.sh/hf-coqui/XTTS-v2/main/vocab.json",
        "https://coqui.gateway.scarf.sh/hf-coqui/XTTS-v2/main/model.pth"
    ], CHECKPOINTS_OUT_PATH, progress_bar=True)

# ✅ Dataset Config (Ensure formatter="ljspeech" for correct format)
dataset_config = BaseDatasetConfig(
    formatter="ljspeech",  # 🔥 Ensure dataset follows LJSpeech format
    meta_file_train=METADATA_FILE,
    path=DATASET_PATH,
    language="de",  # 🔥 Adjust language as needed
)

# ✅ Load Training Samples
train_samples, eval_samples = load_tts_samples(
    dataset_config, eval_split=True, eval_split_size=0.02)

print(f"✅ Training Samples: {len(train_samples)}")
print(f"✅ Evaluation Samples: {len(eval_samples)}")

# ✅ Model Arguments for XTTS (GPT-Based)
model_args = GPTArgs(
    # 🔥 Ensure audio for conditioning latents is within this range
    max_conditioning_length=143677,
    min_conditioning_length=66150,  # 🔥 Ensure minimum length
    debug_loading_failures=True,  # 🔥 Print dataset errors
    max_wav_length=223997,
    max_text_length=200,
    mel_norm_file=MEL_NORM_FILE,
    dvae_checkpoint=DVAE_CHECKPOINT,
    xtts_checkpoint=XTTS_CHECKPOINT,
    tokenizer_file=TOKENIZER_FILE,
    gpt_num_audio_tokens=1026,
    gpt_start_audio_token=1024,
    gpt_stop_audio_token=1025,
    gpt_use_masking_gt_prompt_approach=True,
    gpt_use_perceiver_resampler=True,
)

# ✅ Audio Config (Ensure sampling rates match XTTS)
audio_config = XttsAudioConfig(
    sample_rate=22050, dvae_sample_rate=22050, output_sample_rate=24000
)

# ✅ Speaker Reference (Optional for Few-Shot Cloning)
SPEAKER_REFERENCE = os.path.join(DATASET_PATH, "wavs", "segment_001.wav")

# ✅ Training Config (Optimized for H100 GPU)
config = GPTTrainerConfig(
    dashboard_logger="tensorboard",
    run_eval=True,  # 🔥 Ensures evaluation runs
    epochs=1000,  # 🔥 High number, stop manually if needed
    output_path=OUTPUT_PATH,
    model_args=model_args,
    run_name="XTTS_v2_FT_CustomData",
    project_name="XTTS_Finetuning",
    logger_uri=None,
    audio=audio_config,
    batch_size=16,  # 🔥 Increased for H100 GPU
    batch_group_size=48,
    eval_batch_size=16,  # 🔥 Match batch size for stability
    num_loader_workers=8,  # 🔥 Maximize efficiency
    print_step=5,
    plot_step=100,
    log_model_step=500,
    save_step=100,  # 🔥 Save checkpoints frequently
    save_n_checkpoints=3,
    save_checkpoints=True,
    optimizer="AdamW",
    optimizer_params={"betas": [0.9, 0.96], "eps": 1e-8, "weight_decay": 1e-2},
    lr=5e-6,  # 🔥 Fine-tuning requires a lower LR
    lr_scheduler="MultiStepLR",
    lr_scheduler_params={"milestones": [50000, 150000, 300000], "gamma": 0.5},
    test_sentences=[
        {"text": "This is a test sentence for fine-tuned XTTS-v2.",
            "speaker_wav": SPEAKER_REFERENCE, "language": "en"},
        {"text": "Artificial intelligence is changing the world.",
            "speaker_wav": SPEAKER_REFERENCE, "language": "de"},
    ],
)

# ✅ Fix for PyTorch 2.6+ (Ensure XTTS Loads Correctly)
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🔥 Loading XTTS model on {device.upper()}")

# ✅ Load Model Checkpoint (Fix for PyTorch 2.6+)
try:
    with torch.serialization.safe_globals([XttsConfig, XttsAudioConfig]):
        model_state = torch.load(
            XTTS_CHECKPOINT, map_location=device, weights_only=True)
except Exception as e:
    raise ValueError(f"⚠️ XTTS-V2 Checkpoint loading failed: {e}")

# ✅ Initialize Model
print(f"🚀 Initializing GPT-Based XTTS Model...")
model = GPTTrainer.init_from_config(config)

# ✅ Load Checkpoint
try:
    model.load_checkpoint(config, XTTS_CHECKPOINT,
                          strict=False)
    print(f"✅ Loaded checkpoint from {XTTS_CHECKPOINT}")
except Exception as e:
    raise ValueError(f"⚠️ XTTS-V2 Checkpoint loading failed: {e}")

# ✅ Trainer Arguments
trainer_args = TrainerArgs(
    restore_path=None,
    skip_train_epoch=False,
    start_with_eval=True,
    grad_accum_steps=252,  # 🔥 Matches Kaggle’s fine-tuning method
)

# ✅ Initialize Trainer
trainer = Trainer(
    trainer_args, config, OUTPUT_PATH, model=model, train_samples=train_samples, eval_samples=eval_samples
)

# ✅ Start Fine-Tuning 🚀
print(f"🚀 Starting fine-tuning process...")
trainer.fit()

print(f"🎉 Fine-tuning completed! Output saved to: {OUTPUT_PATH}")
