package com.kevzz.model.layer;

import com.kevzz.configuration.NonInputLayerConfiguration;
import com.kevzz.type.ActivationFunctionType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NonInputLayer extends Layer {

	private final ActivationFunctionType activationFunction;

	public NonInputLayer(NonInputLayerConfiguration currentLayerConfiguration, Layer previousLayer, ActivationFunctionType activationFunction) {
		super(currentLayerConfiguration, previousLayer);
		this.activationFunction = activationFunction;
	}

}
