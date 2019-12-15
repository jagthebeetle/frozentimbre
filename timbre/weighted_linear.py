""" Weights inputs by their duration. """
import datetime

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

import tensorflow as tf
from tensorflow.keras import Model
from tensorflow.keras.layers import Dense

dataset = pd.read_csv('aligned.csv')

x_train = dataset.sample(frac=0.8, random_state=0)
x_test = dataset.drop(x_train.index)
y_train = x_train.pop('key_conf') * 100
y_test = x_test.pop('key_conf') * 100
# Normalize data
train_stats = x_train.describe().transpose()


def norm(x):
    duration = x.pop('duration')
    normed_x = (x - train_stats['mean']) / train_stats['std']
    normed_x['duration'] = duration
    return normed_x


# Convert to tf.data.Dataset
x_train = norm(x_train)
train_ds = tf.data.Dataset.from_tensor_slices(
    (x_train.values, y_train.values)).shuffle(25000).batch(32)
x_test = norm(x_test)
test_ds = tf.data.Dataset.from_tensor_slices(
    (x_test.values, y_test.values)).batch(32)


class LinearModel(Model):
    def __init__(self):
        super(LinearModel, self).__init__()
        self.Linear = Dense(1, dtype='float64')

    def call(self, x):
        return self.Linear(x)


model = LinearModel()


def loss_fn(label, prediction, weight):
    residuals = tf.math.squared_difference(label, prediction)
    return tf.reduce_sum(residuals * tf.expand_dims(weight, 1))


optimizer = tf.keras.optimizers.RMSprop()
train_loss = tf.keras.metrics.Mean(name='train_loss')
train_accuracy = tf.keras.metrics.MeanAbsoluteError(name='train_accuracy')

test_loss = tf.keras.metrics.Mean(name='test_loss')
test_accuracy = tf.keras.metrics.MeanAbsoluteError(name='test_accuracy')


@tf.function
def train_step(segment, label):
    expanded_label = tf.expand_dims(label, 1)
    with tf.GradientTape() as tape:
        predictions = model(segment)
        loss = loss_fn(expanded_label, predictions, segment[:, 0])
    gradients = tape.gradient(loss, model.trainable_variables)
    optimizer.apply_gradients(zip(gradients, model.trainable_variables))
    train_loss(loss)
    train_accuracy(expanded_label, predictions)


@tf.function
def test_step(segment, label):
    expanded_label = tf.expand_dims(label, 1)
    predictions = model(segment)
    t_loss = loss_fn(expanded_label, predictions, segment[:, 0])

    test_loss(t_loss)
    test_accuracy(expanded_label, predictions)


EPOCHS = 1000
for epoch in range(EPOCHS):
    for segment, label in train_ds:
        train_step(segment, label)

    for test_segment, test_label in test_ds:
        test_step(test_segment, test_label)

    if epoch % 25 == 0:
        template = 'Epoch {}, Loss: {}, MAE: {}, Test Loss: {}, Test MAE: {}'
        print(template.format(epoch+1,
                              train_loss.result(),
                              train_accuracy.result(),
                              test_loss.result(),
                              test_accuracy.result()))

    # Reset the metrics for the next epoch
    train_loss.reset_states()
    train_accuracy.reset_states()
    test_loss.reset_states()
    test_accuracy.reset_states()
