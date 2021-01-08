
const API_BASE_URL = 'http://localhost:8080';
const POST = 'POST';

const configureNeuralNetwork = (neuralNetworkConfiguration) => {
  return fetch(API_BASE_URL + '/neural-network/configure', {
    method: POST,
    body: JSON.stringify(neuralNetworkConfiguration),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  });
}

const trainNeuralNetwork = (trainingRequest) => {
  return fetch(API_BASE_URL + '/neural-network/train', {
    method: POST,
    body: JSON.stringify(trainingRequest),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  });
}

export {
  configureNeuralNetwork,
  trainNeuralNetwork
}