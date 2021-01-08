package com.kevzz.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestingRequest {

	private NeuralNetwork neuralNetwork;

	private double [] inputs;
}
