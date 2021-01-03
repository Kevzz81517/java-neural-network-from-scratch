package com.kevzz.model.layer;

import com.kevzz.configuration.InputLayerConfiguration;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;

@NoArgsConstructor
@ToString
@EqualsAndHashCode(callSuper = true)
public class InputLayer extends Layer
	implements Serializable {

	public InputLayer(InputLayerConfiguration inputLayerConfiguration) {
		super(inputLayerConfiguration);
	}
}
