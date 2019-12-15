import datetime

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

dataset = pd.read_csv('aligned.csv')

train_dataset = dataset.sample(frac=0.8, random_state=0)
test_dataset = dataset.drop(train_dataset.index)
train_labels = train_dataset.pop('key_conf') * 100
test_labels = test_dataset.pop('key_conf') * 100

# Normalize data
train_stats = train_dataset.describe().transpose()


def norm(x):
    return (x - train_stats['mean']) / train_stats['std']


normed_train_data = norm(train_dataset)
normed_test_data = norm(test_dataset)

# Model
model = keras.Sequential([
    layers.Dense(64, activation='relu', input_shape=[
        len(train_dataset.keys())]),
    layers.Dense(64, activation='relu'),
    layers.Dense(1)
])
optimizer = tf.keras.optimizers.RMSprop(0.001)

model.compile(loss='mse',
              optimizer=optimizer,
              metrics=['mae', 'mse'])

# Train with TensorBoard logging
log_dir = "logs/fit/" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = tf.keras.callbacks.TensorBoard(
    log_dir=log_dir, histogram_freq=1)

EPOCHS = 50
history = model.fit(
    normed_train_data, train_labels,
    epochs=EPOCHS, validation_split=0.2, callbacks=[tensorboard_callback],
    verbose=0)

# eval
loss, mae, mse = model.evaluate(normed_test_data, test_labels, verbose=2)
print("Testing MAE: {:5.2f} key confidence".format(mae))
