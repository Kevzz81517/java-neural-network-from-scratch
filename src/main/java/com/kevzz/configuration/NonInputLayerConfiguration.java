package com.kevzz.configuration;

import com.kevzz.type.ActivationFunctionType;
import lombok.*;

@AllArgsConstructor @Getter @Setter @NoArgsConstructor public class NonInputLayerConfiguration {

	private int neuronCount;

	private ActivationFunctionType activationFunction;

	private double bias;

}
