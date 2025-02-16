import os
import torch
import optuna
from trainer import Trainer, TrainerArgs
from TTS.tts.datasets import load_tts_samples
from TTS.tts.configs.shared_configs import BaseDatasetConfig
from TTS.tts.layers.xtts.trainer.gpt_trainer import GPTArgs, GPTTrainer, GPTTrainerConfig, XttsAudioConfig
from TTS.utils.manage import ModelManager
from TTS.tts.configs.xtts_config import XttsConfig

# ✅ Paths
OUTPUT_PATH = os.path.abspath("fine_tuning_output_2")
DATASET_PATH = os.path.abspath("audio_dataset")
METADATA_FILE = os.path.join(DATASET_PATH, "metadata.csv")
CHECKPOINTS_OUT_PATH = os.path.abspath("xtts_checkpoints")
os.makedirs(CHECKPOINTS_OUT_PATH, exist_ok=True)

DVAE_CHECKPOINT = os.path.join(CHECKPOINTS_OUT_PATH, "dvae.pth")
MEL_NORM_FILE = os.path.join(CHECKPOINTS_OUT_PATH, "mel_stats.pth")
TOKENIZER_FILE = os.path.join(CHECKPOINTS_OUT_PATH, "vocab.json")
XTTS_CHECKPOINT = os.path.join(CHECKPOINTS_OUT_PATH, "model.pth")

# ✅ Dataset Config
dataset_config = BaseDatasetConfig(
    formatter="ljspeech",
    meta_file_train=METADATA_FILE,
    path=DATASET_PATH,
    language="de",
)
train_samples, eval_samples = load_tts_samples(
    dataset_config, eval_split=True, eval_split_size=0.02)

# ✅ Speaker Reference
SPEAKER_REFERENCE = os.path.join(DATASET_PATH, "wavs", "segment_001.wav")


def objective(trial):
    # 🔧 Hyperparameters to tune
    learning_rate = trial.suggest_float("learning_rate", 1e-6, 5e-4, log=True)
    batch_size = trial.suggest_categorical("batch_size", [4, 8, 12, 16])
    epochs = trial.suggest_int("epochs", 10, 20, 40)
    grad_accum = trial.suggest_categorical("grad_accum", [64, 128, 256])
    gamma = trial.suggest_float("gamma", 0.1, 0.5)

    # ⚙️ Model Arguments
    model_args = GPTArgs(
        max_conditioning_length=143677,
        min_conditioning_length=66150,
        debug_loading_failures=True,
        max_wav_length=223997,
        max_text_length=400,
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

    # 🎵 Audio Config
    audio_config = XttsAudioConfig(
        sample_rate=22050, dvae_sample_rate=22050, output_sample_rate=24000)

    # 🛠️ Trainer Config
    config = GPTTrainerConfig(
        dashboard_logger="tensorboard",
        run_eval=True,
        epochs=epochs,
        output_path=OUTPUT_PATH,
        model_args=model_args,
        run_name=f"XTTS_v2_FT_Optuna_{trial.number}",
        project_name="XTTS_Finetuning",
        audio=audio_config,
        batch_size=batch_size,
        batch_group_size=batch_size * 2,
        eval_batch_size=batch_size,
        num_loader_workers=6,
        print_step=5,
        plot_step=100,
        log_model_step=200,
        save_step=500,
        save_n_checkpoints=1,
        save_checkpoints=True,
        optimizer="AdamW",
        optimizer_params={"betas": [0.9, 0.96],
                          "eps": 1e-8, "weight_decay": 1e-2},
        lr=learning_rate,
        lr_scheduler="MultiStepLR",
        lr_scheduler_params={"milestones": [
            5000, 10000, 20000], "gamma": gamma},
        test_sentences=[
            {"text": "This is a test sentence for fine-tuned XTTS-v2.",
                "speaker_wav": SPEAKER_REFERENCE, "language": "en"},
            {"text": "Künstliche Intelligenz verändert die Welt.",
                "speaker_wav": SPEAKER_REFERENCE, "language": "de"},
        ],
    )

    # 🚀 Initialize Model
    model = GPTTrainer.init_from_config(config)
    model.load_checkpoint(config, XTTS_CHECKPOINT)

    # 🎯 Trainer Setup
    trainer_args = TrainerArgs(
        restore_path=None,
        skip_train_epoch=False,
        start_with_eval=True,
        grad_accum_steps=grad_accum,
    )

    trainer = Trainer(
        trainer_args, config, OUTPUT_PATH, model=model,
        train_samples=train_samples, eval_samples=eval_samples
    )

    # 🚦 Run Training
    trainer.fit()

    # 📈 Evaluate Performance
    eval_loss = trainer.eval_loss if hasattr(trainer, "eval_loss") else 1e6
    return eval_loss


# 🔍 Run Optuna Optimization
study = optuna.create_study(direction="minimize")
study.optimize(objective, n_trials=5)

# 🏆 Best Params
print("🔥 Best Hyperparameters:", study.best_params)

# 💾 Save Study Results
study.trials_dataframe().to_csv("optuna_xtts_results.csv")

print("🎯 Optuna Fine-Tuning Completed!")
