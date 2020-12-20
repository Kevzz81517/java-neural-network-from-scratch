package com.kevzz.util;

import org.apache.commons.math3.random.*;

import java.util.Date;
import java.util.Random;

public class RandomDoubleGeneratorUtility {

	private static RandomGenerator randomGenerator = RandomGeneratorFactory.createRandomGenerator(new Random(new Date().getTime()));

	public static double generateRandomDouble(double min, double max) {
		return min + randomGenerator.nextDouble() * (max - min);
	}

	public static double [] generateRandomDoubleArray(int count) {
		double [] vector = new double[count];
		for (int i = 0; i < count; i++) {
			vector[i] = generateRandomDouble(0.1, 0.99);
		}
		return vector;
	}
}
