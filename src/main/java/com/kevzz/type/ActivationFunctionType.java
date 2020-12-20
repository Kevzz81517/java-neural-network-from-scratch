package com.kevzz.type;

import com.kevzz.exception.NeuralNetworkException;
import org.apache.commons.math3.analysis.function.Sigmoid;

interface ActivationFunctionTypeMethod {
	double calculate(double value);
}


public enum ActivationFunctionType implements ActivationFunctionTypeMethod {

	SIGMOID("Sigmoid") {

		@Override
		public double calculate(double value) {
			return sigmoid.value(value);
		}

	}, RELU("Rectified Linear Unit") {
		@Override
		public double calculate(double value) {
			throw new NeuralNetworkException(500, "ReLU Activation Function not supported.");
		}
	};


	public static Sigmoid sigmoid = new Sigmoid();

	private String displayName;

	public String getDisplayName() {
		return this.displayName;
	}

	ActivationFunctionType(String displayName) {
		this.displayName = displayName;
	}
}
