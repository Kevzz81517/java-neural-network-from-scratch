package com.kevzz.model.layer;

import com.kevzz.configuration.NonInputLayerConfiguration;
import com.kevzz.type.ActivationFunctionType;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode(callSuper = true)
public class NonInputLayer extends Layer implements Serializable {

	private ActivationFunctionType activationFunction;

	public NonInputLayer(NonInputLayerConfiguration currentLayerConfiguration, Layer previousLayer, ActivationFunctionType activationFunction) {
		super(currentLayerConfiguration, previousLayer);
		this.activationFunction = activationFunction;
	}

}
