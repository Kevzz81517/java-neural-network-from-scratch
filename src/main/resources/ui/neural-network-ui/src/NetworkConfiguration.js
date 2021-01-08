import './App.css';
import { Form, Button, Select, Drawer, Card, InputNumber, Row, Col, Switch } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { dagre, numberToRankConverter } from './util';
import uuid from 'react-uuid'
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';
import MindMap from './MindMap';
import {
  InputLayerConfiguration, 
  HiddenLayerConfiguration, 
  OutputLayerConfiguration, 
  NeuralNetworkConfiguration, 
  TrainingRequest,
  TestingRequest
} from './model';
import {configureNeuralNetwork, trainNeuralNetwork, testNeuralNetwork} from './API';

const ACTIVATION_FUNCTION_TYPE = {
  SIGMOID: 'Sigmoid',
  RELU: 'Relu'
}

const MODE = {
  CONFIGURABLE: 'CONFIGURABLE',
  TRAIN: 'TRAIN',
  TEST: 'TEST'
}

function NetworkConfiguration() {
  
  const [ neuralNetworkConfigurationForm ] = Form.useForm();

  const [ trainingForm ] = Form.useForm();

  const [ testingForm ] = Form.useForm();

  
  const [ neuralNetworkConfigurationData, setNeuralNetworkConfigurationData ] = useState({
    inputLayer: {
      nodes: {}
    },
    hiddenLayers: [],
    outputLayer: {
      nodes: {},
      bias: 0.0,
      activationFunction: Object.keys(ACTIVATION_FUNCTION_TYPE)[0]
    },
  });

  const [neuralNetworkData, setNeuralNetworkData] = useState([]);

  const [originalHeight, setOriginalHeight] = useState(0);

  const [width, setWidth] = useState(0);

  const [mode, setMode] = useState(MODE.CONFIGURABLE);

  const [model, setModel] = useState();

  const [trainingSet, setTrainingSet] = useState([{}]);

  
  const addNewInputNode = () => {
    neuralNetworkConfigurationData.inputLayer.nodes[uuid()] = {
      data: {
        value: '',
      }
    }
    setNeuralNetworkConfigurationData({
      ...neuralNetworkConfigurationData,
    })
  }

  const removeInputNode = () => {
    let inputLayerNodesKeys = Object.keys(neuralNetworkConfigurationData.inputLayer.nodes);
    delete neuralNetworkConfigurationData.inputLayer.nodes[inputLayerNodesKeys[inputLayerNodesKeys.length - 1]]
    setNeuralNetworkConfigurationData({...neuralNetworkConfigurationData})
  }

  const addNewOutputNode = () => {
    neuralNetworkConfigurationData.outputLayer.nodes[uuid()] = {
      data: {
        value: ''
      }
    }
    setNeuralNetworkConfigurationData({
      ...neuralNetworkConfigurationData,
    })
  }


  const removeOutputNode = () => {
    let outputLayerNodesKeys = Object.keys(neuralNetworkConfigurationData.outputLayer.nodes);
    delete neuralNetworkConfigurationData.outputLayer.nodes[outputLayerNodesKeys[outputLayerNodesKeys.length - 1]]
    setNeuralNetworkConfigurationData({...neuralNetworkConfigurationData})
  }

  const addNewHiddenNode = (layerIndex) => {
    
    let tempNeuralNetworkConfigurationData = {...neuralNetworkConfigurationData};

    tempNeuralNetworkConfigurationData.hiddenLayers[layerIndex].nodes[uuid()] = {
      data: {
        value: '',
      },
    }
    tempNeuralNetworkConfigurationData.hiddenLayers[layerIndex]['activationFunction'] = 'SIGMOID'

    setNeuralNetworkConfigurationData(tempNeuralNetworkConfigurationData)
  }

  const removeHiddenNode = (layerIndex) => {
    let layerNodesKeys = Object.keys(neuralNetworkConfigurationData.hiddenLayers[layerIndex].nodes);
    delete neuralNetworkConfigurationData.hiddenLayers[layerIndex].nodes[layerNodesKeys[layerNodesKeys.length - 1]]
  }

  const addNewHiddenLayer = () => {
    const layerIndex = neuralNetworkConfigurationData.hiddenLayers.length;
    neuralNetworkConfigurationData.hiddenLayers.push({
      nodes: {
        
      },
      bias: 0,
      activationFunction: Object.keys(ACTIVATION_FUNCTION_TYPE)[0]
    });
    
    addNewHiddenNode(layerIndex)
    
    setNeuralNetworkConfigurationData({
      ...neuralNetworkConfigurationData,
    });

    refactorGraph();

  }


  useEffect(() => {

    addNewInputNode();

    addNewHiddenLayer();

    addNewOutputNode();

    refactorGraph();

  },[]);

  const refactorGraph = () => {
    const dagreGraphUtil = new dagre.graphlib.Graph({
      directed: true,
      multigraph: true,
      compound: true,
      ranker: "longest-path",
      rankdir: "TB",
    });
    
    const graph = dagreGraphUtil.setGraph({
      directed: true,
      multigraph: true,
      compound: true,
      ranker: "longest-path",
      rankdir: "TB",
    });

    dagreGraphUtil.setDefaultEdgeLabel(function() { return {}; });

    const layers = [
      neuralNetworkConfigurationData.inputLayer,
      ...neuralNetworkConfigurationData.hiddenLayers,
      neuralNetworkConfigurationData.outputLayer
    ]

    layers.forEach((layer, layerIndex) => {

      const layerNodes = layer.nodes;

      const layerNodesKeys = Object.keys(layerNodes);

      layerNodesKeys.forEach(key => {
        dagreGraphUtil.setNode(
          key,
          {
            value: layerNodes[key].data.label,
            width: 90,
            height: 160
          }
        );
        if(layerIndex > 0) {
          Object.keys(layers[layerIndex - 1].nodes).forEach(sourceNode => dagreGraphUtil.setEdge(sourceNode, key))
        }
      });

    });

    
    dagre.layout(dagreGraphUtil);

    let newNeuralNetworkConfigurationData = [];

    const mapToNeuralNetworkDataTemplate = (layer) => {
      Object.keys(layer.nodes).forEach((n) => {
        newNeuralNetworkConfigurationData.push({
          id: n,
          ...layer.nodes[n],
          style: {
            width: 80,
          },
          position: {
            x: dagreGraphUtil.node(n).x - dagreGraphUtil.node(n).width  / 2,
            y: dagreGraphUtil.node(n).y -  dagreGraphUtil.node(n).height  / 2,
          }
        });
      })
    }

    const addEdgesBetweenTwoLayers = (startingLayer, endingLayer) => {
      let edges = [];

      const startingLayerNodesKeys = Object.keys(startingLayer.nodes);

      const endingLayerNodesKeys = Object.keys(endingLayer.nodes);

      startingLayerNodesKeys.forEach(startingLayerNodeKey => endingLayerNodesKeys.forEach(endingLayerNodeKey => edges.push({
          id: `e${startingLayerNodeKey}-${endingLayerNodeKey}`, 
          source: startingLayerNodeKey, 
          target: endingLayerNodeKey
        }

      )));

      return edges;

    }

    layers.forEach(layer => mapToNeuralNetworkDataTemplate(layer));

    for(let i = layers.length - 1; i > 0; i--) {
      newNeuralNetworkConfigurationData.push(...addEdgesBetweenTwoLayers(layers[i-1], layers[i]));
    }
    
    setNeuralNetworkData(newNeuralNetworkConfigurationData);

    setOriginalHeight(dagreGraphUtil._label.height);

    setWidth(dagreGraphUtil._label.width);

  }

  const refactorAndFillGraph = (layers) => {
    
    const dagreGraphUtil = new dagre.graphlib.Graph({
      directed: true,
      multigraph: true,
      compound: true,
      ranker: "longest-path",
      rankdir: "TB",
    });
    
    const graph = dagreGraphUtil.setGraph({
      directed: true,
      multigraph: true,
      compound: true,
      ranker: "longest-path",
      rankdir: "TB",
    });

    dagreGraphUtil.setDefaultEdgeLabel(function() { return {}; });

    const nodes = {};

    let edges = [];

    layers.forEach((layer, layerIndex) => {

      const layerNodes = layer.neurons;

      layerNodes.forEach(currentNode => {
        nodes[currentNode.id] = {
          node: currentNode,
          layerIndex
        };
        dagreGraphUtil.setNode(
          currentNode.id,
          {
            value: '',
            width: 80,
            height: 80
          }
        );
        if(layerIndex > 0) {
          layers[layerIndex - 1].neurons.forEach((sourceNode, index) => {
            dagreGraphUtil.setEdge(sourceNode.id, currentNode.id)
            edges.push({
              id: `e${sourceNode.id}-${currentNode.id}`,
              source: sourceNode.id,
              target: currentNode.id ,
              label: Math.round(currentNode.weights[index]*100)/100
            })
          });
        }
      });
    });

    
    dagre.layout(dagreGraphUtil);

    let newNeuralNetworkConfigurationData = [];

    const mapToNeuralNetworkDataTemplate = (layer) => {
      layer.neurons.forEach((n) => {
        newNeuralNetworkConfigurationData.push({
          id: n.id,
          data: {
            value: n.value !== undefined  ? (Math.round(n.value*100)/100).toString() : undefined,
            gradient: n.gradient !== undefined ? (Math.round(n.gradient*100)/100).toString() : undefined,
            bias: n.bias !== undefined ? (Math.round(n.bias*100)/100).toString() : undefined,
            activation: layer.activationFunction ? ACTIVATION_FUNCTION_TYPE[layer.activationFunction]: undefined
          },
          style: {
            width: 80,
          },
          position: {
            x: dagreGraphUtil.node(n.id).x - dagreGraphUtil.node(n.id).width  / 2,
            y: dagreGraphUtil.node(n.id).y -  dagreGraphUtil.node(n.id).height  / 2,
          }
        });
      })
    }

    layers.forEach(layer => mapToNeuralNetworkDataTemplate(layer));
  
    setNeuralNetworkData([...newNeuralNetworkConfigurationData, ...edges]);

    setOriginalHeight(dagreGraphUtil._label.height);

    setWidth(dagreGraphUtil._label.width);

  }

  const submitTrainingForm = (values) => {

    trainNeuralNetwork(
      TrainingRequest(model, values.epochs, values.learningRate, 
        values.trainingSet)
      ).then(response => response.json().then((neuralNetwork => {
        refactorAndFillGraph(neuralNetwork.layers);
        setModel(neuralNetwork);
      })));
  }

  const submitTestingForm = (values) => {

    testNeuralNetwork(
      TestingRequest(model, values.inputs)
      ).then(response => response.json().then((neuralNetwork => {
        refactorAndFillGraph(neuralNetwork.layers);
        setModel(neuralNetwork);
      })));
  }
  
  return (
    <Row>
      {
        mode !== MODE.CONFIGURABLE ? 
        (
          <Button 
            type='primary'
            style={{position: 'fixed', left: (window.innerWidth )/2 - 150, zIndex: 999}}
            onClick={() => {
              setMode(MODE.CONFIGURABLE); 
              setModel(undefined)
            }}
          >
            Re-Configure
          </Button>
        ): (
          <Button 
              type='primary'
              style={{position: 'fixed', left: (window.innerWidth )/2 - 150, zIndex: 999}}
              onClick={() => {
                const inputLayerConfiguration = InputLayerConfiguration(Object.keys(neuralNetworkConfigurationData.inputLayer.nodes).length);
                const hiddenLayersConfigurations = neuralNetworkConfigurationData.hiddenLayers.map(hiddenLayer => HiddenLayerConfiguration(
                  Object.keys(hiddenLayer.nodes).length,
                  hiddenLayer.activationFunction,
                  hiddenLayer.bias
                ));
                const outputLayerConfiguration = OutputLayerConfiguration(
                  Object.keys(neuralNetworkConfigurationData.outputLayer.nodes).length,
                  neuralNetworkConfigurationData.outputLayer.activationFunction,
                  neuralNetworkConfigurationData.outputLayer.bias
                )
                const neuralNetworkConfiguration = NeuralNetworkConfiguration(inputLayerConfiguration, hiddenLayersConfigurations, outputLayerConfiguration);
                configureNeuralNetwork(neuralNetworkConfiguration).then(response => response.json().then(neuralNetwork => {
                  refactorAndFillGraph(neuralNetwork.layers);
                  setModel(neuralNetwork);
                  setMode(MODE.TRAIN);
                }));
              }}
            >
              Complete Configuration
          </Button>
        )
      }
        {
          mode === MODE.CONFIGURABLE ? (
            <Card
              style={{
                width: (window.innerWidth)/2 - 50
              }}
            >
              <Form
                form={neuralNetworkConfigurationForm}
                name='neuralNetworkConfigurationForm'
              >
                <>
                <Title level={3}>Input layer</Title>
                <Form.Item
                  label='How many nodes do you want in input layer ?'
                  initialValue={1}
                >
                  <InputNumber
                    value={Object.keys(neuralNetworkConfigurationData.inputLayer.nodes).length}
                    step={1}
                    min={1}
                    onChange={(value) => {
                      let inputLayerNodesLength = Object.keys(neuralNetworkConfigurationData.inputLayer.nodes).length;
                      if(value > inputLayerNodesLength) {
                        addNewInputNode()
                      } else if(value < inputLayerNodesLength) {
                        removeInputNode()
                      }
                      refactorGraph()
                    }}
                  />
                </Form.Item>
                </>
                <Form.Item>
                    <Button type="dashed" onClick={() => addNewHiddenLayer()} block icon={<PlusOutlined />}>
                      Add Hidden Layer
                    </Button>
                </Form.Item>
                {
                  neuralNetworkConfigurationData.hiddenLayers.map((layer, layerIndex) => {
                    return (
                      <>
                        <Title level={3}>{numberToRankConverter(layerIndex + 1)} hidden layer</Title>
                        <Form.Item
                          label={`How many nodes do you want in this layer ?`}
                          name={`hidden-layer-config-${layerIndex}-node-count`}
                          initialValue={1}
                        >
                          <InputNumber
                            value={Object.keys(neuralNetworkConfigurationData.hiddenLayers[layerIndex].nodes).length}
                            step={1}
                            min={1}
                            onChange={(value) => {
                              let layerNodesLength = Object.keys(neuralNetworkConfigurationData.hiddenLayers[layerIndex].nodes).length;
                              if(value > layerNodesLength) {
                                addNewHiddenNode(layerIndex)
                              } else if(value < layerNodesLength) {
                                removeHiddenNode(layerIndex)
                              }
                              refactorGraph()
                            }}
                          />
                        </Form.Item>
                        <Form.Item
                          label={`Which activation function do you want in this layer ?`}
                          name={`hidden-layer-config-${layerIndex}-activation`}
                          value={neuralNetworkConfigurationData.hiddenLayers[layerIndex].activationFunction}
                          initialValue={neuralNetworkConfigurationData.hiddenLayers[layerIndex].activationFunction}
                          key={neuralNetworkConfigurationData.hiddenLayers[layerIndex].activationFunction}
                        >
                          <Select
                            value={neuralNetworkConfigurationData.hiddenLayers[layerIndex].activationFunction}
                            onChange={(value) => {
                              let tempNeuralNetworkConfigurationData = {...neuralNetworkConfigurationData};
                              tempNeuralNetworkConfigurationData.hiddenLayers[layerIndex].activationFunction = value;
                              setNeuralNetworkConfigurationData(tempNeuralNetworkConfigurationData);
                            }}
                          >
                            {Object.keys(ACTIVATION_FUNCTION_TYPE).map(activationFunctionOptionKey => {
                              return <Select.Option 
                                        value={activationFunctionOptionKey}
                                      >
                                        {ACTIVATION_FUNCTION_TYPE[activationFunctionOptionKey]}
                                      </Select.Option>
                            })}
                            
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label={`What is the bias you want in this layer ?`}
                          name={`hidden-layer-config-${layerIndex}-bias`}
                        >
                          <InputNumber
                            value={neuralNetworkConfigurationData.hiddenLayers[layerIndex].bias}
                            defaultValue={neuralNetworkConfigurationData.hiddenLayers[layerIndex].bias}
                            step={0.01}
                            min={0}
                            onChange={(value) => {
                              let tempNeuralNetworkConfigurationData = {...neuralNetworkConfigurationData};
                              tempNeuralNetworkConfigurationData.hiddenLayers[layerIndex]['bias'] = value;
                              setNeuralNetworkConfigurationData(tempNeuralNetworkConfigurationData);
                            }}
                          />
                        </Form.Item>
                      </>
                    );
                  })
                }
                <>
                <Title level={3}>Output layer</Title>
                <Form.Item
                  label='What is nodes do you want in output layer ?'
                >
                  <InputNumber
                    value={Object.keys(neuralNetworkConfigurationData.outputLayer.nodes).length}
                    step={1}
                    min={1}
                    onChange={(value) => {
                      let outputLayerNodesLength = Object.keys(neuralNetworkConfigurationData.outputLayer.nodes).length;
                      if(value > outputLayerNodesLength) {
                        addNewOutputNode()
                      } else if(value < outputLayerNodesLength) {
                        removeOutputNode()
                      }
                      refactorGraph()
                    }}
                  />
                </Form.Item>
                </>
                <Form.Item
                  label={`What is the bias you want in this layer ?`}
                  name={`hidden-layer-config-output-bias`}
                >
                  <InputNumber
                    value={neuralNetworkConfigurationData.outputLayer.bias}
                    defaultValue={neuralNetworkConfigurationData.outputLayer.bias}
                    step={0.01}
                    min={0}
                    onChange={(value) => {
                      let tempNeuralNetworkConfigurationData = {...neuralNetworkConfigurationData};
                      tempNeuralNetworkConfigurationData.outputLayer['bias'] = value;
                      setNeuralNetworkConfigurationData(tempNeuralNetworkConfigurationData);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label={`Which activation function do you want in this layer ?`}
                  name={`output-layer-config-output-activation`}
                  initialValue={neuralNetworkConfigurationData.outputLayer.activationFunction}
                  key={neuralNetworkConfigurationData.outputLayer.activationFunction}
                >
                  <Select
                    value={neuralNetworkConfigurationData.outputLayer.activationFunction}
                    onChange={(value) => {
                      let tempNeuralNetworkConfigurationData = {...neuralNetworkConfigurationData};
                      tempNeuralNetworkConfigurationData.outputLayer.activationFunction = value;
                      setNeuralNetworkConfigurationData(tempNeuralNetworkConfigurationData);
                    }}
                  >
                    {Object.keys(ACTIVATION_FUNCTION_TYPE).map(activationFunctionOptionKey => {
                      return <Select.Option 
                                value={activationFunctionOptionKey}
                              >
                                {ACTIVATION_FUNCTION_TYPE[activationFunctionOptionKey]}
                              </Select.Option>
                    })}
                    
                  </Select>
                </Form.Item>
              </Form>
            </Card>
          ): (
            <Card
              style={{
                width: (window.innerWidth)/2 - 50,
                overflow: 'auto',
              }}
            >
              <Col style={{ width: '100%' }}>
                <Row justify='center'>
                  <Row justify='space-around' style={{width: '70%'}}>
                  Train 
                  <Switch 
                    checked={mode === MODE.TEST}
                    onChange={(checked) => {setMode(checked ? MODE.TEST : MODE.TRAIN)}}
                  />
                  Test
                  </Row>
                </Row>
                {
                  mode === MODE.TRAIN ? (
                    <Form
                      form={trainingForm}
                      name='trainingForm'
                      onFinish={submitTrainingForm}
                    >
                      <br />
                      <Form.Item>
                        <Button type="dashed" onClick={() => {setTrainingSet([...trainingSet, {}])}} block icon={<PlusOutlined />}>
                          Add New Training Row
                        </Button>
                      </Form.Item>
                      <br />
                      <table>
                        <tr>
                          {
                            Object.keys(neuralNetworkConfigurationData.inputLayer.nodes).map((nodeId, index) => {
                              return (
                                <th>
                                  <Text>{`Input - ${index + 1}`}</Text>
                                </th>
                              )
                            })
                          }
                          {
                            Object.keys(neuralNetworkConfigurationData.outputLayer.nodes).map((nodeId, index) => {
                              return (
                                <th>
                                  <Text>{`Output - ${index + 1}`}</Text>
                                </th>
                              );
                            })
                          }
                        </tr>
                        <br />
                        {
                          trainingSet.map((row, rowIndex) => {
                            return (
                              <tr>
                                {
                                  Array(
                                    Object.keys(neuralNetworkConfigurationData.outputLayer.nodes).length 
                                    + 
                                    Object.keys(neuralNetworkConfigurationData.inputLayer.nodes).length
                                  ).fill().map((col, colIndex) => {
                                    return <td>
                                      <Form.Item
                                        rules={[
                                          {
                                            required: true,
                                            message: ''
                                          }
                                        ]}
                                        name={['trainingSet', rowIndex, colIndex]}
                                      >
                                        <InputNumber 
                                          step={0.01}
                                        />
                                      </Form.Item>
                                    </td>
                                  })
                                }
                              </tr>
                            );
                          })
                        }
                      </table>
                      <Col>
                        <Form.Item
                          label='Learning Rate'
                          rules={[
                            {
                              required: true,
                              message: 'Please provide the learning rate'
                            }
                          ]}
                          name='learningRate'
                        >
                          <InputNumber 
                            min={0}
                            step={0.01}
                          />
                        </Form.Item>
                        <Form.Item
                          label='Training Loops'
                          rules={[
                            {
                              required: true,
                              message: 'Please provide number of training loops'
                            }
                          ]}
                          name='epochs'
                        >
                          <InputNumber 
                            min={0}
                            step={1}
                          />
                        </Form.Item>
                      </Col>
                      <Button 
                        type='primary' 
                        htmlType='submit'
                      >
                        Train Network
                      </Button>
                    </Form>
                  ): (
                    mode === MODE.TEST ? (
                      <Form
                        form={testingForm}
                        name='testingForm'
                        onFinish={submitTestingForm}
                      >
                        <br />
                        <table>
                          <tr>
                            {
                              Object.keys(neuralNetworkConfigurationData.inputLayer.nodes).map((nodeId, index) => {
                                return (
                                  <th>
                                    <Text>{`Input - ${index + 1}`}</Text>
                                  </th>
                                )
                              })
                            }
                          </tr>
                          <br />
                          <tr>
                            {
                              Array( 
                                Object.keys(neuralNetworkConfigurationData.inputLayer.nodes).length
                              ).fill().map((col, colIndex) => {
                                return <td>
                                  <Form.Item
                                    rules={[
                                      {
                                        required: true,
                                        message: ''
                                      }
                                    ]}
                                    name={['inputs', colIndex]}
                                  >
                                    <InputNumber 
                                      step={0.01}
                                    />
                                  </Form.Item>
                                </td>
                              })
                            }
                          </tr>
                        </table>
                        
                        <Button 
                          type='primary' 
                          htmlType='submit'
                        >
                          Test Network
                        </Button>
                      </Form>
                    ) : (null)
                  )
                }
              </Col>
              
            </Card>
          )
        }
      <Card
        width={'50%'}
      >
        <MindMap 
          key={new Date()}
          neuralNetworkData={neuralNetworkData}
        /> 
      </Card>
    </Row>
  );
}

export default NetworkConfiguration;
