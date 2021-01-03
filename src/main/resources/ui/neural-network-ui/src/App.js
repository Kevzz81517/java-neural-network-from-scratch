import './App.css';
import { Form, Button, Select, Drawer, Card, InputNumber, Row } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import ReactFlow, { useStoreState } from "react-flow-renderer";
import { dagre, numberToRankConverter } from './util';
import uuid from 'react-uuid'
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';
import MindMap from './MindMap';

const ACTIVATION_FUNCTION_TYPE = {
  SIGMOID: 'Sigmoid',
  RELU: 'Relu'
}

function App() {
  
  const [ neuralNetworkConfigurationForm ] = Form.useForm();
  
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

  const addNewInputNode = () => {
    neuralNetworkConfigurationData.inputLayer.nodes[uuid()] = {
      data: {
        label: ''
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
        label: ''
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
    neuralNetworkConfigurationData.hiddenLayers[layerIndex].nodes[uuid()] = {
      data: {
        label: ''
      }
    }
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
            label: layerNodes[key].data.label,
            width: 80,
            height: 80
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
  
  return (
    <Row>
      <Card
        style={{
          width: (window.innerWidth)/2 - 50
        }}
      >
        <Form
          form={neuralNetworkConfigurationForm}
        >
          <>
          <Title level={3}>Input layer</Title>
          <Form.Item
            label='What is nodes do you want in input layer ?'
            initialValue={1}
          >
            <InputNumber
              defaultValue={1}
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
                      defaultValue={1}
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
                    initialValue={neuralNetworkConfigurationData.hiddenLayers[layerIndex].activationFunction}
                  >
                    <Select
                      value={neuralNetworkConfigurationData.hiddenLayers[layerIndex].activationFunction}
                      onChange={(value) => {
                        let tempNeuralNetworkConfigurationData = {...neuralNetworkConfigurationData};
                        debugger;
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
                    initialValue={0}
                  >
                    <InputNumber
                      value={neuralNetworkConfigurationData.hiddenLayers[layerIndex].bias}
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
            initialValue={1}
          >
            <InputNumber
              defaultValue={1}
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
            initialValue={0}
          >
            <InputNumber
              value={neuralNetworkConfigurationData.outputLayer.bias}
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

export default App;
