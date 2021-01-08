import { Form, Button, Select, Drawer, Card, InputNumber, Row } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import ReactFlow, { useStoreState } from "react-flow-renderer";
import { dagre, numberToRankConverter } from './util';
import uuid from 'react-uuid'
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';



function MindMap(props) {
    
  const onLoad = (graph) => {
    setTimeout(() => graph.fitView())
  };

  return (
    <>
        <Row  style={{height: window.innerHeight - 50, width: (window.innerWidth - 50)/2, overflow: 'none'}}>
          <ReactFlow
            minZoom={0}
            maxZoom={5}
            elements={props.neuralNetworkData}
            nodeTypes={
              {
                'default': (element) => {  
                  return (
                    <Text level={4}>
                      {element.data.value ?  <><br /><b>Value</b><br />{`${element.data.value}`}</> : ''}
                      {element.data.gradient ?  <><br /><b>Gradient</b><br/>{`${element.data.gradient}`}</> : ''}
                      {element.data.activation ?  <><br /><b>Activation</b><br/>{`${element.data.activation}`}</> : ''}
                      {element.data.bias ?  <><br /><b>Bias</b><br />{`${element.data.bias}`}</> : ''}
                    </Text>
                  ) 
                },
              }
            }
            paneMoveable={true}
            snapToGrid={true}
            snapGrid={[2,2]}
            draggable={false}
            onLoad={onLoad}
            zoomOnScroll={true}
            zoomOnDoubleClick={true}
            contentEditable={false}
            nodesDraggable={false}

            />
          </Row>
    </>
  )

}

export default  MindMap;