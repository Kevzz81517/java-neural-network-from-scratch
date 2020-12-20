package com.kevzz.configuration;

import com.kevzz.configuration.InputLayerConfiguration;
import com.kevzz.configuration.NonInputLayerConfiguration;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class NeuralNetworkInitialConfiguration {

	private final InputLayerConfiguration inputLayerConfiguration;

	private final List<NonInputLayerConfiguration> hiddenLayersConfigurations;

	private final NonInputLayerConfiguration outputLayerConfiguration;

}
