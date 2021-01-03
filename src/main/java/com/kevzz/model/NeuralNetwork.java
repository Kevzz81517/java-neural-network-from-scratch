package com.kevzz.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kevzz.configuration.NeuralNetworkInitialConfiguration;
import com.kevzz.exception.NeuralNetworkException;
import com.kevzz.model.layer.InputLayer;
import com.kevzz.model.layer.Layer;
import com.kevzz.model.layer.NonInputLayer;
import com.kevzz.model.node.Neuron;
import com.kevzz.model.node.NonInputNeuron;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class NeuralNetwork {

	private Layer[] layers;

	@JsonIgnore
	public InputLayer getInputLayer() {
		return (InputLayer) this.layers[0];
	}

	@JsonIgnore
	public NonInputLayer getOutputLayer() {
		return (NonInputLayer) this.layers[this.layers.length - 1];
	}

	public NeuralNetwork(NeuralNetworkInitialConfiguration neuralNetworkInitialConfiguration) {
		Layer[] layers = new Layer[neuralNetworkInitialConfiguration.getHiddenLayersConfigurations().size() + 2];

		layers[0] = new InputLayer(neuralNetworkInitialConfiguration.getInputLayerConfiguration());

		for (int i = 1; i < neuralNetworkInitialConfiguration.getHiddenLayersConfigurations().size() + 1; i++) {
			layers[i] = new NonInputLayer(neuralNetworkInitialConfiguration.getHiddenLayersConfigurations().get(i - 1),
				layers[i - 1], neuralNetworkInitialConfiguration.getHiddenLayersConfigurations().get(i - 1)
				.getActivationFunctionType());
		}

		layers[neuralNetworkInitialConfiguration.getHiddenLayersConfigurations().size() + 1] =
			new NonInputLayer(neuralNetworkInitialConfiguration.getOutputLayerConfiguration(),
				layers[neuralNetworkInitialConfiguration.getHiddenLayersConfigurations().size()],
				neuralNetworkInitialConfiguration.getOutputLayerConfiguration().getActivationFunctionType());

		this.layers = layers;
	}

	public void forward(double[] inputs) {
		Layer inputLayer = this.getInputLayer();
		Neuron[] neurons = inputLayer.getNeurons();
		if (inputs.length == neurons.length) {
			for (int i = 0; i < neurons.length; i++) {
				neurons[i].setValue(inputs[i]);
			}
			for (int i = 1; i < layers.length; i++) {
				NonInputLayer currentLayer = (NonInputLayer) layers[i];
				neurons = currentLayer.getPreviousLayer().getNeurons();
				for (int k = 0; k < currentLayer.getNeurons().length; k++) {
					double newNodeValue = 0;
					NonInputNeuron currentNeuron = (NonInputNeuron) currentLayer.getNeurons()[k];
					for (int j = 0; j < neurons.length; j++) {
						newNodeValue += (currentNeuron.getWeights()[j] * neurons[j].getValue());
					}
					newNodeValue = newNodeValue + currentNeuron.getBias();
					newNodeValue = currentLayer.getActivationFunction().calculate(newNodeValue);
					currentNeuron.setValue(newNodeValue);
				}
			}
		} else {
			throw new NeuralNetworkException(500, "Incorrect Inputs");
		}
	}

	public void backward(double[] outputs, double learningRate) {

		if (outputs.length == this.getOutputLayer().getNeurons().length) {
			NonInputNeuron[] outputNeurons = (NonInputNeuron[]) this.getOutputLayer().getNeurons();

			for (int i = 0; i < outputNeurons.length; i++) {

				double errorDiff = outputNeurons[i].getValue() - outputs[i];
				double gradient =
					errorDiff * this.getOutputLayer().getActivationFunction().gradient(outputNeurons[i].getValue());
				outputNeurons[i].setGradient(gradient);

				for (int j = 0; j < outputNeurons[i].getWeights().length; j++) {
					double previousLayerNodeValue = getOutputLayer().getPreviousLayer().getNeurons()[j].getValue();
					double error = previousLayerNodeValue * gradient;
					outputNeurons[i].getCacheWeights()[j] = outputNeurons[i].getWeights()[j] - learningRate * error;
				}

			}

			for (int i = layers.length - 2; i > 0; i--) {
				for (int j = 0; j < layers[i].getNeurons().length; j++) {
					NonInputNeuron currentNeuron = (NonInputNeuron) layers[i].getNeurons()[j];
					double totalNextLayersGradient = sumGradient(j, i + 1);
					double value = currentNeuron.getValue();
					double currentGradient = ((NonInputLayer) layers[i]).getActivationFunction().gradient(value);
					double errorDiff = (totalNextLayersGradient) * currentGradient;
					currentNeuron.setGradient(errorDiff);
					for (int k = 0; k < currentNeuron.getWeights().length; k++) {
						double error = errorDiff * layers[i - 1].getNeurons()[k].getValue();

						currentNeuron.getCacheWeights()[k] = currentNeuron.getWeights()[k] - learningRate * error;
					}
				}
			}

			for (int i = 1; i < layers.length; i++) {
				for (int j = 0; j < (layers[i]).getNeurons().length; j++) {
					((NonInputNeuron) (layers[i].getNeurons()[j])).applyWeightCache();
				}
			}
		} else {
			throw new NeuralNetworkException(500, "Incorrect Outputs");
		}
	}

	public void oneTrainingPass(double[] inputs, double[] outputs, double learningRate) {
		forward(inputs);
		backward(outputs, learningRate);
	}

	@JsonIgnore
	public float sumGradient(int n_index, int currentLayerIndex) {
		float totalGradient = 0;
		NonInputLayer currentLayer = (NonInputLayer) layers[currentLayerIndex];
		for (int i = 0; i < currentLayer.getNeurons().length; i++) {
			NonInputNeuron currentNeuron = (NonInputNeuron) currentLayer.getNeurons()[i];
			totalGradient += currentNeuron.getWeights()[n_index] * currentNeuron.getGradient();
		}
		return totalGradient;
	}

}
