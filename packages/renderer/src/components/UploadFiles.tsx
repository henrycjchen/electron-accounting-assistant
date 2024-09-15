import {Button, Space} from 'antd';
import type {UploadChangeParam} from 'antd/es/upload';
import {useState} from 'react';
import {produce} from 'immer';
import {CloseOutlined, FileDoneOutlined, PlusOutlined} from '@ant-design/icons';
import { StyledUpload } from './StyledUpload';
import React from 'react';

export default function UploadFiles({onChange}:{onChange: (files: Record<string, string>) => void}) {
  const [fileNames, setFileNames] = useState<Record<string, string>>({
    outboundInvoices: '',
    inboundInvoices: '',
    calculate: '',
  });
  const [filePaths, setFilePaths] = useState<Record<string, string>>({});

  function addFile(file: {path: string; type: string}) {
    filePaths[file.type] = file.path;
    setFilePaths({...filePaths});
    onChange({...filePaths});
  }

  function handleRemoveClick(type: string) {
    delete filePaths[type];
    setFilePaths({...filePaths});
    setFileNames(
      produce(draft => {
        draft[type] = '';
      }),
    );
    onChange({...filePaths});
  }

  const handleChange = (info: UploadChangeParam, type: string) => {
    setFileNames(
      produce(draft => {
        draft[type] = info.file.originFileObj?.name || '';
      }),
    );
    if (info.file.originFileObj?.name) {
      addFile({
        path: info.file.originFileObj!.path,
        type,
      });
    }
  };

  return (
    <Space>
      <Space direction="vertical">
        出库发票
        <StyledUpload
          name="avatar"
          listType="picture-card"
          showUploadList={false}
          accept=".xlsx"
          customRequest={()=>{}}
          onChange={(e: UploadChangeParam) => handleChange(e, 'outboundInvoices')}
        >
          <Space
            direction="vertical"
            style={{
              fontSize: '12px',
              padding: '10px',
            }}
          >
            {fileNames.outboundInvoices ? (
              <FileDoneOutlined style={{fontSize: '30px', color: 'green'}}></FileDoneOutlined>
            ) : (
              <PlusOutlined style={{fontSize: '30px', color: 'gray'}}></PlusOutlined>
            )}
            {fileNames.outboundInvoices}
          </Space>
          {fileNames.outboundInvoices ? (
            <Button
              type="text"
              size="small"
              style={{position: 'absolute', right: '0', top: '0'}}
              onClick={e => {
                e.stopPropagation();
                handleRemoveClick('outboundInvoices');
              }}
            >
              <CloseOutlined style={{color: 'gray'}} />
            </Button>
          ) : null}
        </StyledUpload>
      </Space>
      <Space direction="vertical">
        测算表
        <StyledUpload
          name="avatar"
          listType="picture-card"
          showUploadList={false}
          customRequest={()=>{}}
          accept=".xlsx"
          onChange={(e: UploadChangeParam) => handleChange(e, 'calculate')}
        >
          <Space
            direction="vertical"
            style={{
              fontSize: '12px',
              padding: '10px',
            }}
          >
            {fileNames.calculate ? (
              <FileDoneOutlined style={{fontSize: '30px', color: 'green'}}></FileDoneOutlined>
            ) : (
              <PlusOutlined style={{fontSize: '30px', color: 'gray'}}></PlusOutlined>
            )}
            {fileNames.calculate}
          </Space>
          {fileNames.calculate ? (
            <Button
              type="text"
              size="small"
              style={{position: 'absolute', right: '0', top: '0'}}
              onClick={e => {
                e.stopPropagation();
                handleRemoveClick('calculate');
              }}
            >
              <CloseOutlined style={{color: 'gray'}} />
            </Button>
          ) : null}
        </StyledUpload>
      </Space>
      <Space direction="vertical">
        购进发票
        <StyledUpload
          name="avatar"
          listType="picture-card"
          showUploadList={false}
          customRequest={()=>{}}
          accept=".xlsx"
          onChange={(e: UploadChangeParam) => {
            handleChange(e, 'inboundInvoices');
          }}
        >
          <Space
            direction="vertical"
            style={{
              fontSize: '12px',
              padding: '10px',
            }}
          >
            {fileNames.inboundInvoices ? (
              <FileDoneOutlined style={{fontSize: '30px', color: 'green'}}></FileDoneOutlined>
            ) : (
              <PlusOutlined style={{fontSize: '30px', color: 'gray'}}></PlusOutlined>
            )}
            {fileNames.inboundInvoices}
          </Space>
          {fileNames.inboundInvoices ? (
            <Button
              type="text"
              size="small"
              style={{position: 'absolute', right: '0', top: '0'}}
              onClick={e => {
                e.stopPropagation();
                handleRemoveClick('inboundInvoices');
              }}
            >
              <CloseOutlined style={{color: 'gray'}} />
            </Button>
          ) : null}
        </StyledUpload>
      </Space>
    </Space>
  );
}

