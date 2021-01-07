package com.kevzz.configuration;

import com.kevzz.configuration.InputLayerConfiguration;
import com.kevzz.configuration.NonInputLayerConfiguration;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NeuralNetworkInitialConfiguration {

	private InputLayerConfiguration inputLayerConfiguration;

	private List<NonInputLayerConfiguration> hiddenLayersConfigurations;

	private NonInputLayerConfiguration outputLayerConfiguration;

}
