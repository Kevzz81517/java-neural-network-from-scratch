package com.kevzz.controller;

import com.kevzz.configuration.NeuralNetworkInitialConfiguration;
import com.kevzz.model.NeuralNetwork;
import com.kevzz.model.TestingRequest;
import com.kevzz.model.TrainingRequest;
import com.kevzz.model.TrainingSet;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.stream.LongStream;

@RestController @RequestMapping("/neural-network") public class MainController {

	@PostMapping("/configure")
	public NeuralNetwork configure(@RequestBody NeuralNetworkInitialConfiguration neuralNetworkInitialConfiguration) {
		return new NeuralNetwork(neuralNetworkInitialConfiguration);
	}

	@PostMapping("/train") public NeuralNetwork train(@RequestBody TrainingRequest trainingRequest) {

		NeuralNetwork neuralNetwork = trainingRequest.getNeuralNetwork();

		for (int i = 1; i < neuralNetwork.getLayers().length; i++) {
			neuralNetwork.getLayers()[i].setPreviousLayer(neuralNetwork.getLayers()[i - 1]);
		}

		int inputNodesCount = neuralNetwork.getInputLayer().getNeurons().length;

		ArrayList<TrainingSet> trainingSets = new ArrayList<>();

		for (double[] trainingRow : trainingRequest.getTrainingData()) {

			trainingSets.add(new TrainingSet(Arrays.copyOfRange(trainingRow, 0, inputNodesCount),
				Arrays.copyOfRange(trainingRow, inputNodesCount, trainingRow.length)));
		}

		LongStream.rangeClosed(1, trainingRequest.getEpochs()).forEach(i -> {
			trainingSets.forEach(trainingSet -> neuralNetwork
				.oneTrainingPass(trainingSet.getInputs(), trainingSet.getOutputs(), trainingRequest.getLearningRate()));
		});

		return neuralNetwork;
	}

	@PostMapping("/test") public NeuralNetwork test(@RequestBody TestingRequest testingRequest) {

		NeuralNetwork neuralNetwork = testingRequest.getNeuralNetwork();

		for (int i = 1; i < neuralNetwork.getLayers().length; i++) {
			neuralNetwork.getLayers()[i].setPreviousLayer(neuralNetwork.getLayers()[i - 1]);
		}

		neuralNetwork.forward(testingRequest.getInputs());

		return neuralNetwork;
	}
}
