function InputLayerConfiguration(neuronCount) {
  return {
    neuronCount
  }
}

function NonInputLayerConfiguration(neuronCount, activationFunction, bias) {
  return {
    neuronCount,
    activationFunction,
    bias
  };
}

function HiddenLayerConfiguration(neuronCount, activationFunction, bias) {
  return NonInputLayerConfiguration(neuronCount, activationFunction, bias);
}

function OutputLayerConfiguration(neuronCount, activationFunction, bias) {
  return NonInputLayerConfiguration(neuronCount, activationFunction, bias);
}

function NeuralNetworkConfiguration(inputLayerConfiguration, hiddenLayersConfigurations, outputLayerConfiguration) {
  return {
    inputLayerConfiguration,
    hiddenLayersConfigurations,
    outputLayerConfiguration
  };
}

function TrainingRequest(neuralNetwork, epochs, learningRate, trainingData) {
  return {
    neuralNetwork,
    epochs,
    learningRate,
    trainingData
  }
}

function TestingRequest(neuralNetwork, inputs) {
  return {
    neuralNetwork,
    inputs
  }
}

export {
  InputLayerConfiguration,
  HiddenLayerConfiguration,
  OutputLayerConfiguration,
  NeuralNetworkConfiguration,
  TrainingRequest,
  TestingRequest
}