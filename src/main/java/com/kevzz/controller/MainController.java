package com.kevzz.controller;

import com.kevzz.configuration.NeuralNetworkInitialConfiguration;
import com.kevzz.model.NeuralNetwork;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController @RequestMapping("/neural-network") public class MainController {

	@PostMapping("/configure")
	public NeuralNetwork configure(@RequestBody NeuralNetworkInitialConfiguration neuralNetworkInitialConfiguration) {
		return new NeuralNetwork(neuralNetworkInitialConfiguration);
	}
}
