package com.kevzz;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kevzz.configuration.InputLayerConfiguration;
import com.kevzz.configuration.NeuralNetworkInitialConfiguration;
import com.kevzz.configuration.NonInputLayerConfiguration;
import com.kevzz.model.NeuralNetwork;
import com.kevzz.model.node.Neuron;
import com.kevzz.type.ActivationFunctionType;
import com.kevzz.util.NumberToRankConverterUtility;
import com.kevzz.util.RandomDoubleGeneratorUtility;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

public class Application {

	public static Scanner scanner = new Scanner(System.in);

	public static InputLayerConfiguration getInputLayerConfiguration() {
		System.out.println("Let's first add the Input Layer");
		int inputNeuronCount = 0;
		while (true) {
			System.out.println("What is your Input Size ?");
			try {
				if ((inputNeuronCount = Integer.parseInt(scanner.nextLine())) > 1) {
					return new InputLayerConfiguration(inputNeuronCount);
				}
				System.out.println("Something wrong with Input !");
			} catch (Exception ex) {
				System.out.println("Something wrong with Input !");
			}
		}
	}

	public static NonInputLayerConfiguration getNonInputLayerConfiguration(String layerName) {
		while (true) {
			System.out.printf("What is the number of nodes in %s layer?\n", layerName);
			int inputNeuronCount = 0;
			try {
				if ((inputNeuronCount = Integer.parseInt(scanner.nextLine())) >= 1) {
					return new NonInputLayerConfiguration(inputNeuronCount, ActivationFunctionType.SIGMOID,
						RandomDoubleGeneratorUtility.generateRandomDouble(0, 1));
				}
				System.out.println("Something wrong with Input !");
			} catch (Exception ex) {
				System.out.println("Something wrong with Input !");
			}
		}
	}

	public static List<NonInputLayerConfiguration> getHiddenLayersConfiguration() {
		System.out.println("Now Let's add some Hidden Layers");
		int hiddenLayersCount = 0;
		List<NonInputLayerConfiguration> hiddenLayersConfigurations = new ArrayList<NonInputLayerConfiguration>();
		while (true) {
			System.out.println("How many hidden layers do you wanna add ? ");
			try {
				if ((hiddenLayersCount = Integer.parseInt(scanner.nextLine())) >= 1) {
					break;
				}
				System.out.println("Something wrong with Input !");
			} catch (Exception ex) {
				System.out.println("Something wrong with Input !");
			}
		}
		for (int i = 0; i < hiddenLayersCount; i++) {
			hiddenLayersConfigurations
				.add(getNonInputLayerConfiguration(NumberToRankConverterUtility.process(i + 1) + " Hidden"));
		}
		return hiddenLayersConfigurations;
	}

	public static NonInputLayerConfiguration getOutputLayerConfiguration() {
		System.out.println("Now Let's add the Output Layer");
		return getNonInputLayerConfiguration("Output");
	}

	public static void headerMessage() {
		System.out.println("Welcome to Kevzz's Neural Network Builder");
		System.out.println("Let's create your customized Neural Network");
	}

	public static void summary(NeuralNetworkInitialConfiguration neuralNetworkInitialConfiguration) {
		System.out.println("-----------------------------------------------------------------------------------------");
		System.out.println("Your Neural Network configuration is completed");
		System.out.println("Here is the summary of your Network");
		System.out.printf("Number of Layers: %d\n",
			neuralNetworkInitialConfiguration.getHiddenLayersConfigurations().size() + 2);
		System.out.printf("Input Layer -> Nodes : %d\n",
			neuralNetworkInitialConfiguration.getInputLayerConfiguration().getNeuronCount());
		int i = 1;
		for (NonInputLayerConfiguration hiddenLayerConfiguration : neuralNetworkInitialConfiguration
			.getHiddenLayersConfigurations()) {
			System.out.printf("%s Hidden Layer -> Nodes : %d, Bias : %f, Activation : %s\n",
				NumberToRankConverterUtility.process(i), hiddenLayerConfiguration.getNeuronCount(),
				hiddenLayerConfiguration.getBias(),
				hiddenLayerConfiguration.getActivationFunction().getDisplayName());
			i++;
		}
		System.out.printf("Output Layer -> Nodes : %d, Bias : %f, Activation : %s\n",
			neuralNetworkInitialConfiguration.getOutputLayerConfiguration().getNeuronCount(),
			neuralNetworkInitialConfiguration.getOutputLayerConfiguration().getBias(),
			neuralNetworkInitialConfiguration.getOutputLayerConfiguration().getActivationFunction()
				.getDisplayName());
		System.out.println("-----------------------------------------------------------------------------------------");

	}

	public static NeuralNetwork generateNeuralNetwork(NeuralNetworkInitialConfiguration neuralNetworkInitialConfiguration) {

		return new NeuralNetwork(neuralNetworkInitialConfiguration);
	}

	public static void main(String[] args) {
		headerMessage();

		InputLayerConfiguration inputLayerConfiguration = getInputLayerConfiguration();

		List<NonInputLayerConfiguration> hiddenLayersConfiguration = getHiddenLayersConfiguration();

		NonInputLayerConfiguration outputLayerConfiguration = getOutputLayerConfiguration();

		NeuralNetworkInitialConfiguration neuralNetworkInitialConfiguration =
			new NeuralNetworkInitialConfiguration(inputLayerConfiguration, hiddenLayersConfiguration,
				outputLayerConfiguration);

		summary(neuralNetworkInitialConfiguration);

		NeuralNetwork neuralNetwork = generateNeuralNetwork(neuralNetworkInitialConfiguration);

		for(double [] inputs : new double[][] {{0,0},{0,1},{1,0},{1,1}}) {
			neuralNetwork.forward(inputs);
			String.join(",", Arrays.stream(neuralNetwork.getOutputLayer().getNeurons()).map(i -> String.valueOf(i.getValue())).toArray(String[]::new));
			for (Neuron neuron : neuralNetwork.getOutputLayer().getNeurons()) {
				System.out.print(Math.round(neuron.getValue()));
			}
			System.out.println();
		}

		System.out.println("-----------------------------------------------");

		for(int i = 0; i < 100000; i++) {
			neuralNetwork.oneTrainingPass(new double[] {0,0}, new double[] {1,0,0,0}, 0.01);
			neuralNetwork.oneTrainingPass(new double[] {0,1}, new double[] {0,1,0,0}, 0.01);
			neuralNetwork.oneTrainingPass(new double[] {1,0}, new double[] {0,0,1,0}, 0.01);
			neuralNetwork.oneTrainingPass(new double[] {1,1}, new double[] {0,0,0,1}, 0.01);
		}

		for(double [] inputs : new double[][] {{0,0},{0,1},{1,0},{1,1}}) {
			neuralNetwork.forward(inputs);
			String.join(",", Arrays.stream(neuralNetwork.getOutputLayer().getNeurons()).map(i -> String.valueOf(i.getValue())).toArray(String[]::new));
			for (Neuron neuron : neuralNetwork.getOutputLayer().getNeurons()) {
				System.out.print(Math.round(neuron.getValue()));
			}
			System.out.println();
		}

		System.out.println("-----------------------------------------------");

		for(int i = 0; i < 500000; i++) {
			neuralNetwork.oneTrainingPass(new double[] {0,0}, new double[] {1,0,0,0}, 0.01);
			neuralNetwork.oneTrainingPass(new double[] {0,1}, new double[] {0,1,0,0}, 0.01);
			neuralNetwork.oneTrainingPass(new double[] {1,0}, new double[] {0,0,1,0}, 0.01);
			neuralNetwork.oneTrainingPass(new double[] {1,1}, new double[] {0,0,0,1}, 0.01);
		}

		for(double [] inputs : new double[][] {{0,0},{0,1},{1,0},{1,1}}) {
			neuralNetwork.forward(inputs);
			String.join(",", Arrays.stream(neuralNetwork.getOutputLayer().getNeurons()).map(i -> String.valueOf(i.getValue())).toArray(String[]::new));
			for (Neuron neuron : neuralNetwork.getOutputLayer().getNeurons()) {
				System.out.print(Math.round(neuron.getValue()));
			}
			System.out.println();
		}

		System.out.println("-----------------------------------------------");

		ObjectMapper objectMapper = new ObjectMapper();

		try {

			String neuralNetworkStr = objectMapper.writeValueAsString(neuralNetwork);

			NeuralNetwork newNeuralNetwork = objectMapper.readValue(neuralNetworkStr, NeuralNetwork.class);

		} catch (JsonProcessingException e) {

			e.printStackTrace();
		}



	}
}
