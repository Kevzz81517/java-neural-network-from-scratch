package com.kevzz.configuration;

import com.kevzz.type.ActivationFunctionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@AllArgsConstructor @RequiredArgsConstructor @Getter public class NonInputLayerConfiguration {

	private final int neuronCount;

	private final ActivationFunctionType activationFunctionType;

	private double bias;
}
