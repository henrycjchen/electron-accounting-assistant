import {generateBillArrangement} from '#preload';
import {StyledUpload} from '@/components/StyledUpload';
import {CloseOutlined, FileDoneOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, message, Space} from 'antd';
import type {UploadChangeParam} from 'antd/es/upload';
import React from 'react';

export default function BillArrangement() {
  const [fileName, setFileName] = React.useState('');
  const filePath = React.useRef('');

  return (
    <Space direction="vertical">
      <Space direction="vertical">
        发票列表
        <StyledUpload
          name="avatar"
          listType="picture-card"
          showUploadList={false}
          accept=".xlsx"
          customRequest={() => {}}
          onChange={(e: UploadChangeParam) => {
            filePath.current = e.file.originFileObj!.path || '';
            setFileName(e.file.originFileObj?.name || '');
          }}
        >
          <Space
            direction="vertical"
            style={{
              fontSize: '12px',
              padding: '10px',
            }}
          >
            {fileName ? (
              <FileDoneOutlined style={{fontSize: '30px', color: 'green'}}></FileDoneOutlined>
            ) : (
              <PlusOutlined style={{fontSize: '30px', color: 'gray'}}></PlusOutlined>
            )}
            {fileName}
          </Space>
          {fileName ? (
            <Button
              type="text"
              size="small"
              style={{position: 'absolute', right: '0', top: '0'}}
              onClick={e => {
                e.stopPropagation();
                setFileName('');
              }}
            >
              <CloseOutlined style={{color: 'gray'}} />
            </Button>
          ) : null}
        </StyledUpload>
      </Space>
      <Button
        type="primary"
        disabled={!fileName}
        onClick={async () => {
          try {
            message.loading('整理中');
            await generateBillArrangement(filePath.current);
            message.destroy();
            message.success('整理完成');
          } catch (err) {
            message.error((err as any).message);
          }
        }}
      >
        整理发票
      </Button>
    </Space>
  );
}
