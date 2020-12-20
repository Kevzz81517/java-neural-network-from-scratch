package com.kevzz.configuration;

import lombok.Getter;

@Getter
public class InputLayerConfiguration {

	private final int neuronCount;

	public InputLayerConfiguration(int neuronCount) {
		this.neuronCount = neuronCount;
	}
}
