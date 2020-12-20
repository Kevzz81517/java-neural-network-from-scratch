package com.kevzz.exception;

import lombok.Getter;

@Getter public class NeuralNetworkException extends RuntimeException {

	private int status;

	public NeuralNetworkException(int status, String message) {
		super(message);
		this.status = status;
	}
}
