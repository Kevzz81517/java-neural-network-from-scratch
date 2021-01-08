package com.kevzz.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainingRequest {

	private NeuralNetwork neuralNetwork;

	private long epochs;

	private double learningRate;

	private double [][] trainingData;
}
