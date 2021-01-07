package com.kevzz.configuration;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InputLayerConfiguration {

	private int neuronCount;

	public InputLayerConfiguration(int neuronCount) {
		this.neuronCount = neuronCount;
	}
}
