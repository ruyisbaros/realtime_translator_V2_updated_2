import os
import torch
from trainer import Trainer, TrainerArgs
from TTS.tts.datasets import load_tts_samples
from TTS.tts.configs.shared_configs import BaseDatasetConfig
from TTS.tts.layers.xtts.trainer.gpt_trainer import GPTArgs, GPTTrainer, GPTTrainerConfig, XttsAudioConfig
from TTS.utils.manage import ModelManager
from TTS.tts.configs.xtts_config import XttsConfig


# ✅ Define Paths
OUTPUT_PATH = os.path.abspath("fine_tuning_output_2")
DATASET_PATH = os.path.abspath("audio_dataset")
METADATA_FILE = os.path.join(DATASET_PATH, "metadata.csv")

# ✅ Set XTTS Checkpoint Paths
CHECKPOINTS_OUT_PATH = os.path.abspath("xtts_checkpoints")
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

# ✅ Dataset Config
dataset_config = BaseDatasetConfig(
    formatter="ljspeech",
    meta_file_train=METADATA_FILE,
    path=DATASET_PATH,
    language="de",
)

# ✅ Load Training Samples
train_samples, eval_samples = load_tts_samples(
    dataset_config, eval_split=True, eval_split_size=0.02)


# ✅ Model Arguments for XTTS (GPT-Based)
model_args = GPTArgs(
    max_conditioning_length=143677,
    min_conditioning_length=66150,
    debug_loading_failures=True,
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

# ✅ Audio Config
audio_config = XttsAudioConfig(
    sample_rate=22050, dvae_sample_rate=22050, output_sample_rate=44100
)

# ✅ Speaker Reference
SPEAKER_REFERENCE = os.path.join(DATASET_PATH, "wavs", "segment_001.wav")

# ✅ Training Config
config = GPTTrainerConfig(
    dashboard_logger="tensorboard",
    run_eval=True,
    epochs=20,
    output_path=OUTPUT_PATH,
    model_args=model_args,
    run_name="XTTS_v2_FT_IPA",
    project_name="XTTS_IPA_Finetuning",
    logger_uri=None,
    audio=audio_config,
    batch_size=8,
    batch_group_size=32,
    eval_batch_size=8,
    num_loader_workers=6,
    mixed_precision=True,
    print_step=5,
    plot_step=100,
    log_model_step=4,
    save_step=5,
    save_n_checkpoints=3,
    save_checkpoints=True,
    optimizer="AdamW",
    optimizer_params={"betas": [0.9, 0.96], "eps": 1e-8, "weight_decay": 1e-2},
    lr=3e-6,
    lr_scheduler="ReduceLROnPlateau",
    lr_scheduler_params={"mode": "min",
                         "factor": 0.5, "patience": 5, "min_lr": 1e-7},
    test_sentences=[
        {"text": "/ha.llo u.nd hɛʁ.t͡sli.x vɪl.ko.mən/",
            "speaker_wav": SPEAKER_REFERENCE, "language": "de"},
        {"text": "/mɛʁ.ha.ba na.sɯl.sɯn/",
            "speaker_wav": SPEAKER_REFERENCE, "language": "tr"},
    ],
)

# ✅ Initialize Model
print(f"🚀 Initializing GPT-Based XTTS Model...")
model = GPTTrainer.init_from_config(config)

# ✅ Load Checkpoint
try:
    model.load_checkpoint(config, XTTS_CHECKPOINT)
    print(f"✅ Loaded checkpoint from {XTTS_CHECKPOINT}")
except Exception as e:
    raise ValueError(f"⚠️ XTTS-V2 Checkpoint loading failed: {e}")

# ✅ Trainer Arguments
trainer_args = TrainerArgs(
    restore_path=None,
    skip_train_epoch=False,
    start_with_eval=True,
    grad_accum_steps=12,
)

# ✅ Initialize Trainer
trainer = Trainer(
    trainer_args, config, OUTPUT_PATH, model=model, train_samples=train_samples, eval_samples=eval_samples
)

# ✅ Start Fine-Tuning 🚀
print(f"🚀 Starting fine-tuning process with IPA input...")
trainer.fit()

print(f"🎉 Fine-tuning completed! Output saved to: {OUTPUT_PATH}")
