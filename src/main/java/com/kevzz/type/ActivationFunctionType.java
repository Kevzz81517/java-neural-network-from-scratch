package com.kevzz.type;

import org.apache.commons.math3.analysis.function.Sigmoid;

interface ActivationFunctionTypeMethod {
	double calculate(double value);

	double gradient(double value);
}


public enum ActivationFunctionType implements ActivationFunctionTypeMethod {

	SIGMOID("Sigmoid") {
		@Override public double calculate(double value) {
			return sigmoid.value(value);
		}

		@Override public double gradient(double value) {
			return value * (1 - value);
		}

	}, RELU("Rectified Linear Unit") {
		@Override public double calculate(double value) {
			return Math.max(0.3 * value, value);
		}

		@Override public double gradient(double value) {
			if (value < 0) {
				return 0.3;
			} else {
				return 1;
			}
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
