package com.kevzz.model.layer;

import com.kevzz.configuration.InputLayerConfiguration;
import com.kevzz.configuration.NonInputLayerConfiguration;
import com.kevzz.model.node.InputNeuron;
import com.kevzz.model.node.Neuron;
import com.kevzz.model.node.NonInputNeuron;
import lombok.Getter;

import static com.kevzz.util.RandomDoubleGeneratorUtility.generateRandomDoubleArray;

@Getter public class Layer {

	private final Neuron[] neurons;

	private final Layer previousLayer;

	public Layer(NonInputLayerConfiguration currentLayerConfiguration, Layer previousLayer) {
		Neuron[] neurons = new NonInputNeuron[currentLayerConfiguration.getNeuronCount()];
		for (int i = 0; i < neurons.length; i++) {
			double[] weights = generateRandomDoubleArray(previousLayer.getNeurons().length);
			double[] cacheWeights = new double[previousLayer.getNeurons().length];
			double[] weightGradients = new double[previousLayer.getNeurons().length];
			neurons[i] = new NonInputNeuron(weights, currentLayerConfiguration.getBias(), cacheWeights);
		}
		this.neurons = neurons;
		this.previousLayer = previousLayer;
	}

	public Layer(InputLayerConfiguration inputLayerConfiguration) {
		Neuron[] neurons = new InputNeuron[inputLayerConfiguration.getNeuronCount()];
		for (int i = 0; i < neurons.length; i++) {
			neurons[i] = new InputNeuron();
		}
		this.neurons = neurons;
		this.previousLayer = null;
	}

}
